// Import the Three.js library and OrbitControls from a CDN
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js";
import { Actuator_THREE } from "../../lib/Actuator_THREE.js";
import { Sensor_THREE } from "../../lib/Sensor_THREE.js";
import { Transducer_THREE } from "../../lib/Transducer_THREE.js";
import { formatValue } from "../../lib/UI_Utilities.js";
import { hexToRgba } from "../../lib/UI_Utilities.js";
import { createCameraControl } from "../../../lib/cameraUtilities.js";

// Import the oscillatorSystem class from the oscillatorSystem.js file
// includ the MotionRequest class
import { OscillatorSystem_THREE } from "../../../lib/OscillatorSystem_THREE.js";

// variables common to all THREE.js sketches
let scene, renderer, cameraControl, lightSource;
let fogNear = 50;
let fogFar = 250;

let armature;
//oscillator systems container
let oscillatorSystems = [];

let range_female = 45;
let maxAcceleration_female = 15;
let maxVelocity_female = 15;

let range_female_vertical_search = 30;
let maxAcceleration_female_vertical_search = 10;
let maxVelocity_female_vertical_search = 20;

let range_beam = 180;
let maxAcceleration_beam = 5;
let maxVelocity_beam = 5;

let range_male = 60;
let maxAcceleration_male = 10;
let maxVelocity_male = 10;

// Create a glass-like material
const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff, // White or light color for glass
  metalness: 0, // Glass is not metallic, range 0 to 1
  roughness: 0, // Smooth surface
  transmission: 1, // Full transmission for clear glass, range 0 to 1
  opacity: 0.5, // Slight opacity to enhance the glass effect
  transparent: true, // Enable transparency
  reflectivity: 0.9, // High reflectivity for glass
  ior: 1.5, // Index of refraction, typical value for glass
  clearcoat: 1, // Extra glossiness for reflective surfaces, range 0 to 1
  clearcoatRoughness: 0.5, // No roughness for a smooth, glass-like surface, range 0 to 1
});

// Create a chrome-like material
const chromeMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff, // White or light color for glass
  metalness: 1, // Glass is not metallic, range 0 to 1
  roughness: 0, // Smooth surface
  transmission: 0, // Full transmission for clear glass, range 0 to 1
  opacity: 1, // Slight opacity to enhance the glass effect
  transparent: false, // Enable transparency
  reflectivity: 0.9, // High reflectivity for glass
  ior: 1, // Index of refraction, typical value for glass
  clearcoat: 1, // Extra glossiness for reflective surfaces, range 0 to 1
  clearcoatRoughness: 1, // No roughness for a smooth, glass-like surface, range 0 to 1
});

function init() {
  initRenderer();
  initSceneContext();
  initCameraControl();

  let numFemales = 3;
  let numMales = 2;
  let distanceFromCenter_female = 84;
  let distanceFromCenter_male = 24;
  let armature_centerX = 0;
  let armature_centerZ = 0;

  let armature = new THREE.Group();
  let armature_axesHelper = new THREE.AxesHelper(12);
  armature.add(armature_axesHelper);
  armature.position.set(armature_centerX, 42, armature_centerZ);
  scene.add(armature);

  //set up the female oscillator systems
  for (let i = 0; i < numFemales; i++) {
    // Get the position and orientation data for placing the oscillator on a circle
    let pointData = getPointOnCircle(
      distanceFromCenter_female,
      numFemales,
      i,
      armature_centerX,
      armature_centerZ
    );

    //add female oscillator systems
    // Create a new oscillatorSystem at the computed position with a given name and orientation
    let femaleOscillatorSystem = new OscillatorSystem_THREE(
      `oscillatorSystem Female ${i + 1}`, // Name of the oscillator
      THREE.MathUtils.degToRad(-range_female), // minPosition converted to radians
      THREE.MathUtils.degToRad(range_female), // maxPosition converted to radians
      THREE.MathUtils.degToRad(0) // reinforcementPosition converted to radians
    );

    // Set the position of the oscillatorSystem
    femaleOscillatorSystem.position.set(pointData.x, -8, pointData.y); // Assuming Y is height, 0 for vertical axis

    // Adjust the initial orientation of the oscillatorSystem
    femaleOscillatorSystem.rotation.y = pointData.orientation + Math.PI; // Rotate the oscillatorSystem to face the center

    // Configure motion parameters for the oscillatorSystem
    //convert to radians
    femaleOscillatorSystem.maxVelocity = (maxVelocity_female * Math.PI) / 180;
    femaleOscillatorSystem.maxAcceleration =
      (maxAcceleration_female * Math.PI) / 180;

    // Set the motion request to RELEASE
    femaleOscillatorSystem.setMotionRequest(
      OscillatorSystem_THREE.MOTION_REQUEST.RELEASE
    );

    //add the speaker
    const speaker = new Actuator_THREE(
      `speaker`,
      Math.PI,
      3000,
      true,
      true,
      true
    );
    speaker.position.set(3, -12, 0);
    femaleOscillatorSystem.oscillator.add(speaker);

    //add the microphone
    const microphone = new Sensor_THREE(
      `microphone`,
      Math.PI,
      0.05,
      true,
      true,
      true
    );
    microphone.position.set(-3, -12, 0);
    femaleOscillatorSystem.oscillator.add(microphone);

    //add a female body
    // this is a sphere from the three.js library
    let femaleGeometry = new THREE.SphereGeometry(8, 32, 32);
    //make it glass
    let femaleBody = new THREE.Mesh(femaleGeometry, glassMaterial);
    //position it
    femaleBody.position.set(0, -15, 0);
    //add it to the oscillator system
    femaleOscillatorSystem.oscillator.add(femaleBody);

    // add the search system to the oscillator system
    let searchSystem = new OscillatorSystem_THREE(
      `oscillatorSystem Search ${i + 1}`, // Name of the oscillatorSystem
      THREE.MathUtils.degToRad(-range_female_vertical_search), // minPosition converted to radians
      THREE.MathUtils.degToRad(range_female_vertical_search), // maxPosition converted to radians
      THREE.MathUtils.degToRad(0) // reinforcementPosition converted to radians
    );

    // Set the position of the oscillatorSystem
    searchSystem.position.set(0, -15, 5); // Assuming Y is height, 0 for vertical axis

    // Adjust the initial orientation of the oscillatorSystem
    searchSystem.rotation.y = 0;
    searchSystem.rotation.z = Math.PI / 2;

    // Configure motion parameters for the oscillatorSystem
    //convert to radians
    searchSystem.maxVelocity =
      (maxVelocity_female_vertical_search * Math.PI) / 180;
    searchSystem.maxAcceleration =
      (maxAcceleration_female_vertical_search * Math.PI) / 180;

    //add the light sensor
    const lightSensor = new Sensor_THREE(
      `light sensor`,
      Math.PI / 2,
      0.05,
      true,
      true,
      true
    );
    lightSensor.position.set(0, 0, 1);
    searchSystem.oscillator.add(lightSensor);

    //add a mirror to the oscillator system
    // this is a box from the three.js library
    const mirrorGeometry = new THREE.BoxGeometry(4, 4, 0.1);
    //make it mirror
    const mirror = new THREE.Mesh(mirrorGeometry, chromeMaterial);
    mirror.position.set(0, 0, 0.5);
    searchSystem.oscillator.add(mirror);

    // Set the motion request to RELEASE
    searchSystem.setMotionRequest(
      OscillatorSystem_THREE.MOTION_REQUEST.RELEASE
    );

    // Add the search system to the oscillator system
    femaleOscillatorSystem.oscillator.add(searchSystem);

    // add the oscillatorSystem to the oscillatorSystems array
    oscillatorSystems.push(searchSystem);

    // Add the oscillatorSystem to the environment
    armature.add(femaleOscillatorSystem);
    oscillatorSystems.push(femaleOscillatorSystem);
  }

  // Create a central "beam" oscillatorSystem
  let beamOscillatorSystem = new OscillatorSystem_THREE(
    `oscillatorSystem Beam`, // Name of the oscillatorSystem
    THREE.MathUtils.degToRad(-range_beam), // minPosition converted to radians
    THREE.MathUtils.degToRad(range_beam), // maxPosition converted to radians
    THREE.MathUtils.degToRad(0) // reinforcementPosition converted to radians
  );

  // Set the position of the beam oscillatorSystem relative to the armature
  beamOscillatorSystem.position.set(0, -4, 0);

  // add the beam body
  // this is a box from the three.js library
  let beamGeometry = new THREE.BoxGeometry(0.5, 0.5, 24);
  //make it chrome
  let beamBody = new THREE.Mesh(beamGeometry, chromeMaterial);
  beamBody.position.set(0, -4, 0);
  beamOscillatorSystem.oscillator.add(beamBody);

  // Configure motion parameters for the beam oscillatorSystem
  beamOscillatorSystem.maxVelocity = (maxVelocity_beam * Math.PI) / 180;
  beamOscillatorSystem.maxAcceleration = (maxAcceleration_beam * Math.PI) / 180;

  // Set the motion request to RELEASE
  beamOscillatorSystem.setMotionRequest(
    OscillatorSystem_THREE.MOTION_REQUEST.RELEASE
  );

  // Adjust the initial orientation of the oscillatorSystem
  beamOscillatorSystem.rotation.y = Math.PI; // Rotate the oscillatorSystem to face the center

  // Add the beam oscillatorSystem to the scene
  armature.add(beamOscillatorSystem);
  oscillatorSystems.push(beamOscillatorSystem);

  //add to male oscillator systems to the beamOscillator system
  // there are numMales oscillators
  //male 1 and 2
  //they are 24 units from the center of the beam
  // centered relative to the beam
  for (let i = 0; i < numMales; i++) {
    let pointData = getPointOnCircle(
      distanceFromCenter_male,
      numMales,
      i,
      0,
      0
    );

    // add male oscillator systems
    // Create a new oscillatorSystem at the computed position with a given name and orientation
    let maleOscillatorSystem = new OscillatorSystem_THREE(
      `oscillatorSystem Male ${i + 1}`, // Name of the oscillator
      THREE.MathUtils.degToRad(-range_male), // minPosition converted to radians
      THREE.MathUtils.degToRad(range_male), // maxPosition converted to radians
      THREE.MathUtils.degToRad(0) // reinforcementPosition converted to radians
    );
    // Assuming Y is height, 0 for vertical axis
    maleOscillatorSystem.position.set(pointData.x, -4, pointData.y);
    // Rotate the oscillatorSystem to face away from the center
    maleOscillatorSystem.rotation.y = pointData.orientation;
    maleOscillatorSystem.maxVelocity = (maxVelocity_male * Math.PI) / 180; // Max velocity remains as is
    maleOscillatorSystem.maxAcceleration =
      (maxAcceleration_male * Math.PI) / 180; // Max acceleration remains as is
    maleOscillatorSystem.setMotionRequest(
      OscillatorSystem_THREE.MOTION_REQUEST.RELEASE
    );

    //add the speaker
    const speaker = new Actuator_THREE(
      `speaker`,
      Math.PI,
      3000,
      true,
      true,
      true
    );
    speaker.position.set(0, -8, 0);
    maleOscillatorSystem.oscillator.add(speaker);

    //add the microphone
    const microphone = new Sensor_THREE(
      `microphone`,
      Math.PI,
      0.05,
      true,
      true,
      true
    );
    microphone.position.set(-3, -9, 0);
    maleOscillatorSystem.oscillator.add(microphone);

    //add the light
    const light = new Actuator_THREE(
      `light`,
      Math.PI / 8,
      3000,
      true,
      true,
      true
    );
    light.position.set(0, -15, 0);
    maleOscillatorSystem.oscillator.add(light);

    //add the male body
    //this is a box from the three.js library
    let maleGeometry = new THREE.BoxGeometry(6, 10, 1);
    //make it glass
    let maleBody = new THREE.Mesh(maleGeometry, chromeMaterial);
    maleBody.position.set(0, -15, 0);
    maleOscillatorSystem.oscillator.add(maleBody);

    beamOscillatorSystem.oscillator.add(maleOscillatorSystem);
    oscillatorSystems.push(maleOscillatorSystem);
  }

  console.log(oscillatorSystems);

  //create UI
  createUI();

  // Start the animation loop
  animate();
}

function getPointOnCircle(diameter, numPoints, pointIndex, centerX, centerY) {
  // Calculate the angle between each point on the circle
  const angleBetweenPoints = (2 * Math.PI) / numPoints;

  // Calculate the angle for the specific point
  const angle = pointIndex * angleBetweenPoints;

  // Calculate the x, y coordinates of the point on the circle
  const x = centerX + (diameter / 2) * Math.sin(angle);
  const y = centerY + (diameter / 2) * Math.cos(angle);

  // Return the position and orientation (angle) in radians
  return {
    x: x,
    y: y,
    orientation: angle,
  };
}

function initRenderer() {
  // Set up the renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function initSceneContext() {
  // Create the scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color("white"); // Set the scene background color
  scene.fog = new THREE.Fog(0xffffff, fogNear, fogFar); // Initial fog settings
  scene.ambientLight = new THREE.AmbientLight(0xffffff, 0.05);

  // Add a light source
  lightSource = new THREE.DirectionalLight(0xffffff, 1);
  lightSource.position.set(10, 10, 10);
  scene.add(lightSource);

  // Add a grid to the scene for reference
  const gridHelper = new THREE.PolarGridHelper(
    42,
    6,
    12,
    128,
    0xcccccc,
    0xdddddd
  );
  scene.add(gridHelper);
}

function initCameraControl() {
  //verify the renderer is created
  if (!renderer) {
    console.log("Renderer not created");
  }
  const defaultPerspectiveViewScale = 4;
  // Create a container for the camera control
  cameraControl = createCameraControl(renderer);
  cameraControl.perspectiveCameraDefaultPosition = new THREE.Vector3(
    -5 * defaultPerspectiveViewScale,
    11 * defaultPerspectiveViewScale,
    -21 * defaultPerspectiveViewScale
  );
  cameraControl.perspectiveCamera.position.copy(
    cameraControl.perspectiveCameraDefaultPosition
  );
}

////////////////////////////////////////
// UI Setup
////////////////////////////////////////

function createUI() {
  // Create a parent container for the control panels
  const controlsContainer = document.createElement("div");
  controlsContainer.style.position = "absolute";
  controlsContainer.style.top = "10px";
  controlsContainer.style.left = "10px";
  controlsContainer.style.display = "flex";
  controlsContainer.style.flexDirection = "row";
  controlsContainer.style.alignItems = "flex-start";
  controlsContainer.style.gap = "10px";
  controlsContainer.style.zIndex = "100";
  controlsContainer.style.visibility = "hidden"; // Hide the controls by default
  document.body.appendChild(controlsContainer);

  // Create control panels for Females, Males, and Beam
  createControlPanel(
    controlsContainer,
    "Females",
    {
      range: range_female,
      maxVelocity: maxVelocity_female,
      maxAcceleration: maxAcceleration_female,
    },
    updateFemaleParams,
    "rgba(128, 0, 128, 0.8)"
  ); // Add color for Females panel

  createControlPanel(
    controlsContainer,
    "Males",
    {
      range: range_male,
      maxVelocity: maxVelocity_male,
      maxAcceleration: maxAcceleration_male,
    },
    updateMaleParams,
    "rgba(0, 128, 128, 0.8)"
  ); // Add color for Males panel

  createControlPanel(
    controlsContainer,
    "Beam",
    {
      range: range_beam,
      maxVelocity: maxVelocity_beam,
      maxAcceleration: maxAcceleration_beam,
    },
    updateBeamParams,
    "rgba(0, 128, 0, 0.8)"
  ); // Add color for Beam panel
}

// Function to create individual control panels
function createControlPanel(
  parentElement,
  label,
  params,
  onUpdateCallback,
  backgroundColor
) {
  // Create the container for the control panel
  const panelContainer = document.createElement("div");
  panelContainer.style.color = "white";
  panelContainer.style.fontFamily = "Arial, sans-serif";
  panelContainer.style.backgroundColor = backgroundColor; // Use the passed background color
  panelContainer.style.padding = "10px";
  panelContainer.style.borderRadius = "5px";
  panelContainer.style.width = "200px";
  panelContainer.style.marginBottom = "10px";
  panelContainer.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.2)";
  panelContainer.style.boxSizing = "border-box";
  panelContainer.style.flexGrow = "0";
  panelContainer.style.flexShrink = "1";

  // Title Button for the control panel
  const titleButton = document.createElement("button");
  titleButton.textContent = `${label} Controls`;
  titleButton.style.width = "100%";
  titleButton.style.backgroundColor = backgroundColor;
  titleButton.style.fontWeight = "bold";
  titleButton.style.textAlign = "center";
  titleButton.style.fontSize = "16px";
  titleButton.style.color = "white";
  titleButton.style.border = "1px solid white";
  titleButton.style.borderRadius = "5px";
  titleButton.style.cursor = "pointer";
  panelContainer.appendChild(titleButton);

  // Create a container for the sliders
  const controlContainer = document.createElement("div");
  controlContainer.style.display = "flex";
  controlContainer.style.flexDirection = "column";
  controlContainer.style.gap = "5px";
  panelContainer.appendChild(controlContainer);

  // Create sliders for range, max velocity, and max acceleration
  createSlider(controlContainer, "Range", params.range, 1, 180, (value) => {
    params.range = value;
    onUpdateCallback(params);
  });

  createSlider(
    controlContainer,
    "Max Velocity",
    params.maxVelocity,
    1,
    30,
    (value) => {
      params.maxVelocity = value;
      onUpdateCallback(params);
    }
  );

  createSlider(
    controlContainer,
    "Max Acceleration",
    params.maxAcceleration,
    1,
    20,
    (value) => {
      params.maxAcceleration = value;
      onUpdateCallback(params);
    }
  );

  // Add panel to the main controls container
  parentElement.appendChild(panelContainer);

  // Toggle the display of the control panel on button click
  titleButton.addEventListener("click", () => {
    controlContainer.style.display =
      controlContainer.style.display === "none" ? "block" : "none";
  });
}

// Function to create a slider for a specific parameter
function createSlider(panel, label, initialValue, min, max, onChange) {
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.alignItems = "center";

  const sliderLabel = document.createElement("label");
  sliderLabel.textContent = `${label}: ${initialValue.toFixed(0)}`;
  container.appendChild(sliderLabel);

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = min;
  slider.max = max;
  slider.value = initialValue;
  slider.step = 1.0;
  slider.style.width = "100%";

  // Update label and call the onChange callback when the slider changes
  slider.oninput = function () {
    sliderLabel.textContent = `${label}: ${slider.value}`;
    onChange(parseFloat(slider.value));
  };

  container.appendChild(slider);
  panel.appendChild(container);
}

// Update parameters for females
function updateFemaleParams(params) {
  range_female = params.range;
  maxVelocity_female = params.maxVelocity;
  maxAcceleration_female = params.maxAcceleration;

  oscillatorSystems.forEach((oscillator) => {
    if (oscillator.name.includes("Female")) {
      oscillator.maxVelocity = (maxVelocity_female * Math.PI) / 180;
      oscillator.maxAcceleration = (maxAcceleration_female * Math.PI) / 180;
      oscillator.minPosition = -((range_female / 2) * Math.PI) / 180; // Update the range
      oscillator.maxPosition = ((range_female / 2) * Math.PI) / 180; // Update the range
      // oscillator.setMotionRequest(
      //   OscillatorSystem_THREE.MOTION_REQUEST.RELEASE
      // );
    }
  });
}

// Update parameters for males
function updateMaleParams(params) {
  range_male = params.range;
  maxVelocity_male = params.maxVelocity;
  maxAcceleration_male = params.maxAcceleration;

  oscillatorSystems.forEach((oscillator) => {
    if (oscillator.name.includes("Male")) {
      oscillator.maxVelocity = (maxVelocity_male * Math.PI) / 180;
      oscillator.maxAcceleration = (maxAcceleration_male * Math.PI) / 180;
      oscillator.minPosition = -((range_male / 2) * Math.PI) / 180; // Update the range
      oscillator.maxPosition = ((range_male / 2) * Math.PI) / 180; // Update the range
      // oscillator.setMotionRequest(
      //   OscillatorSystem_THREE.MOTION_REQUEST.RELEASE
      // );
    }
  });
}

// Update parameters for beam
function updateBeamParams(params) {
  range_beam = params.range;
  maxVelocity_beam = params.maxVelocity;
  maxAcceleration_beam = params.maxAcceleration;

  oscillatorSystems.forEach((oscillator) => {
    if (oscillator.name.includes("Beam")) {
      oscillator.maxVelocity = (maxVelocity_beam * Math.PI) / 180;
      oscillator.maxAcceleration = (maxAcceleration_beam * Math.PI) / 180;
      oscillator.minPosition = -((range_beam / 2) * Math.PI) / 180; // Update the range
      oscillator.maxPosition = ((range_beam / 2) * Math.PI) / 180; // Update the range
      // oscillator.setMotionRequest(
      //   OscillatorSystem_THREE.MOTION_REQUEST.RELEASE
      // );
    }
  });
}

////////////////////////////////////////
// Animation Loop
////////////////////////////////////////

/**
 * Animates the scene, applying rotation to the transforms and rendering.
 */
function animate() {
  requestAnimationFrame(animate);

  // Update the oscillatorSystems by calling act() on each one in the oscillatorSystems array
  oscillatorSystems.forEach((oscillatorSystem) => {
    oscillatorSystem.act();
  });

  // Render the scene from the perspective of the camera
  renderMainCamera();
}

// Initialize the scene
init();

function renderMainCamera() {
  renderer.clear(); // Clear the previous frame

  // Update orbit mode if active
  cameraControl.updateOrbit();

  // Update the controls and render the scene
  if (!cameraControl.isOrbiting) {
    cameraControl.currentOrbitControl.update(); // Only update controls if not in orbit mode
  }
  renderer.render(scene, cameraControl.camera);
}
