// Import the Three.js library and OrbitControls from a CDN
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js";
import { Color } from "https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/controls/OrbitControls.js";

// Import Text from Troika Text library loaded via CDN
import { Text } from "https://unpkg.com/troika-three-text?module";

// Import the custom Sensor_THREE class
import { Sensor_THREE } from "../../lib/Sensor_THREE.js";

// Create the main scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

// Set up the main camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-5, 11, -21);

// Set up the WebGL renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set up the OrbitControls for camera manipulation
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Adds inertia to the controls for smoother camera movements

// Add a directional light to the scene
const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(70, 200, 100).normalize();
scene.add(light);

// Add a grid helper to the scene
const gridHelper = new THREE.GridHelper(84, 84, 0xcccccc, 0xdddddd);

scene.add(gridHelper);

// Add an array of targets to the scene inside a 100 unit circle
const targets = [];
for (let i = 0; i < 16; i++) {
  const target = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshLambertMaterial({ color: 0xff0000 })
  );

  const distance = Math.random() * 38 + 4;
  const angle = Math.random() * Math.PI * 2;
  const deltaY = Math.random() * 10 - 5;
  target.position.set(
    distance * Math.cos(angle),
    deltaY,
    distance * Math.sin(angle)
  );
  scene.add(target);
  targets.push(target);
}

// Create a sensor instance
const sensor = new Sensor_THREE(
  "Front Sensor",
  Math.PI / 4,
  84,
  0.1,
  true,
  true,
  true
);
sensor.position.set(0, 0, 0); // Position the sensor at the origin
sensor.rotation.set(0, Math.PI / 4, 0); // Rotate the sensor 45 degrees around the Y-axis
scene.add(sensor); // Add the sensor to the scene

// Create a secondary camera for the sensor's view
const sensorCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000); // Aspect ratio set to 1 for a square view
sensorCamera.fov = sensor.fov * (180 / Math.PI); // Update sensor camera FOV
sensorCamera.updateProjectionMatrix();

// Variable for rotation rate
let rotationRate = 0.003; // Default rotation rate

// Function to create and set up the UI
function createUI() {
  // Create a UI container
  const uiContainer = document.createElement("div");
  uiContainer.style.position = "absolute";
  uiContainer.style.top = "10px";
  uiContainer.style.left = "10px";
  uiContainer.style.color = "white";
  uiContainer.style.fontFamily = "Arial, sans-serif";
  uiContainer.style.zIndex = "100";
  uiContainer.style.backgroundColor = "rgba(128, 128, 128, 0.5)";
  uiContainer.style.padding = "10px";
  uiContainer.style.borderRadius = "5px";
  uiContainer.style.display = "flex";
  uiContainer.style.flexDirection = "column";
  uiContainer.style.gap = "10px";
  uiContainer.style.width = "150px"; // Fixed width for the UI
  document.body.appendChild(uiContainer);

  // Create a title label
  const titleLabel = document.createElement("div");
  titleLabel.textContent = "Sensor Controls";
  titleLabel.style.fontWeight = "bold";
  titleLabel.style.textAlign = "center";
  uiContainer.appendChild(titleLabel);

  // Create a button to toggle the sensor visibility
  const toggleButton = document.createElement("button");
  toggleButton.textContent = sensor.visible ? "Hide Sensor" : "Show Sensor";
  toggleButton.style.width = "100%"; // Fixed width for the button
  toggleButton.onclick = () => {
    sensor.visible = !sensor.visible;
    toggleButton.textContent = sensor.visible ? "Hide Sensor" : "Show Sensor";
  };
  uiContainer.appendChild(toggleButton);

  // Create a label and slider for the sensor's field of view
  const fovLabel = document.createElement("label");
  fovLabel.textContent = "Field of View:";
  uiContainer.appendChild(fovLabel);

  const fovSlider = document.createElement("input");
  fovSlider.type = "range";
  fovSlider.min = "10";
  fovSlider.max = "180";
  fovSlider.value = (sensor.fov * (180 / Math.PI)).toString();
  fovSlider.oninput = (event) => {
    sensor.fov = (parseInt(event.target.value) * Math.PI) / 180;
    sensorCamera.fov = sensor.fov * (180 / Math.PI); // Update sensor camera FOV
    sensorCamera.updateProjectionMatrix();
  };
  uiContainer.appendChild(fovSlider);

  // Create a label and slider for the sensor's sensitivity
  const sensitivityLabel = document.createElement("label");
  sensitivityLabel.textContent = "Sensitivity:";
  uiContainer.appendChild(sensitivityLabel);

  const sensitivitySlider = document.createElement("input");
  sensitivitySlider.type = "range";
  sensitivitySlider.min = "1";
  sensitivitySlider.max = "200";
  sensitivitySlider.value = sensor.sensitivity.toString();
  sensitivitySlider.oninput = (event) => {
    sensor.sensitivity = parseInt(event.target.value);
  };
  uiContainer.appendChild(sensitivitySlider);

  // Create a label and slider for the sensor's rotation rate
  const rotationRateLabel = document.createElement("label");
  rotationRateLabel.textContent = "Rotation Rate:";
  uiContainer.appendChild(rotationRateLabel);

  const rotationRateSlider = document.createElement("input");
  rotationRateSlider.type = "range";
  rotationRateSlider.min = "-0.01";
  rotationRateSlider.max = "0.01";
  rotationRateSlider.step = "0.001";
  rotationRateSlider.value = rotationRate.toString(); // Default rotation rate
  rotationRateSlider.oninput = (event) => {
    rotationRate = parseFloat(event.target.value);
  };
  uiContainer.appendChild(rotationRateSlider);

  // Create a status display at the bottom
  const statusDisplay = document.createElement("div");
  statusDisplay.textContent = "Sensor Status: Initializing...";
  statusDisplay.style.fontSize = "12px";
  statusDisplay.style.fontWeight = "lighter";
  statusDisplay.style.marginTop = "5px"; // Add some spacing above the status
  uiContainer.appendChild(statusDisplay);

  return { statusDisplay };
}

// Create a border overlay for the sensor camera view
const borderOverlay = document.createElement("div");
borderOverlay.style.position = "absolute";
borderOverlay.style.border = "2px solid white"; // White border
borderOverlay.style.boxSizing = "border-box"; // Include the border in the size calculations
borderOverlay.style.zIndex = "99"; // Make sure it appears above other elements
document.body.appendChild(borderOverlay);

// Function to position and resize the border overlay
function updateBorderOverlay() {
  const insetSize = Math.min(window.innerWidth, window.innerHeight) / 4; // Make the viewport a square
  borderOverlay.style.width = `${insetSize}px`;
  borderOverlay.style.height = `${insetSize}px`;
  borderOverlay.style.top = `${10}px`;
  borderOverlay.style.left = `${window.innerWidth - insetSize - 10}px`;
}

// Initialize UI and get references to dynamically updated elements
const { statusDisplay } = createUI();

// Function to update the scene on each animation frame
function animate() {
  requestAnimationFrame(animate);

  // Rotate the sensor around the Y-axis based on the rotation rate
  sensor.rotation.y += rotationRate;
  // Reset sensor rotation if it exceeds 2*PI
  if (sensor.rotation.y > Math.PI * 2) {
    sensor.rotation.y = 0;
  }

  // Update the sensor camera to match the sensor's position and orientation
  sensorCamera.position.copy(sensor.position);

  // Compute the direction the sensor is facing
  const sensorDirection = new THREE.Vector3();
  sensor.getWorldDirection(sensorDirection);

  // Point the camera in the same direction as the sensor
  sensorCamera.lookAt(sensor.position.clone().add(sensorDirection));

  // Check if any targets are within the sensor's field of view
  let targetIsInView = false;

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    const result = sensor.isInRange(target);
    const inView = sensor.isInFieldOfView(target);

    if (inView && result.inRange) {
      targetIsInView = true;
      // Adjust the color based on the distance
      const greenValue = Math.floor(
        255 - (result.distance / sensor.range) * 255
      );
      target.material.color.setRGB(0, greenValue / 255, 0);
      target.material.emissive.setRGB(0, greenValue / 255, 0);
    } else {
      target.material.color.set(0xff0000);
      target.material.emissive.set(0x000000);
    }
  }

  // Update the HUD text dynamically
  let text = targetIsInView
    ? "A target is in the field of view!"
    : "No target is in the field of view.";

  // Update the UI display
  statusDisplay.textContent = text;

  controls.update(); // Update the OrbitControls

  // Render the main scene from the main camera's perspective
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.clear(); // Clear the previous frame
  renderer.render(scene, camera);

  // Render the sensor's view in a square window in the top-right corner
  const insetSize = Math.min(window.innerWidth, window.innerHeight) / 4; // Make the viewport a square
  renderer.setScissorTest(true); // Enable scissor test to limit rendering to the viewport
  renderer.setScissor(
    window.innerWidth - insetSize - 10,
    window.innerHeight - insetSize - 10,
    insetSize,
    insetSize
  );
  renderer.setViewport(
    window.innerWidth - insetSize - 10,
    window.innerHeight - insetSize - 10,
    insetSize,
    insetSize
  );
  renderer.render(scene, sensorCamera);
  renderer.setScissorTest(false); // Disable scissor test after rendering

  // Update the position and size of the border overlay
  updateBorderOverlay();
}

// Start the animation loop
animate();

// Handle window resizing
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  updateBorderOverlay();
});
