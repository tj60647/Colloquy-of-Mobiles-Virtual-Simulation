import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js';
import { Actuator_THREE } from '../../lib/Actuator_THREE.js';
import { Sensor_THREE } from '../../lib/Sensor_THREE.js';
import { Transducer_THREE } from '../../lib/Transducer_THREE.js';
import { formatValue } from '../../lib/UI_Utilities.js';
import { hexToRgba } from '../../lib/UI_Utilities.js';
import { createCameraControl } from '../../../lib/cameraUtilities.js';

const sensorCount = 4;
const actuatorCount = 3;

// Create the main scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

// a helper conatainer for the lines illustrating the detected targets
const lineContainer = new THREE.Object3D();
scene.add(lineContainer);

///////////////////////////
// Set up the WebGL renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

///////////////////////////
// set up the scene

// Add a directional light to the scene
const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(70, 200, 100).normalize();
scene.add(light);

// Add a grid helper to the scene
const gridHelper = new THREE.PolarGridHelper(42, 8, 16, 128, 0xcccccc, 0xdddddd);
scene.add(gridHelper);

// Helper Function to get a random position within the field
function getRandomPosition() {
  // use polar coordinates to get a random position within the field
  const angle = Math.random() * Math.PI * 2; // random angle between 0 and 2PI
  const radius = Math.random() * 42; // random radius between 0 and 42
  // convert polar coordinates to cartesian
  return {
    x: radius * Math.cos(angle),
    y: Math.random() * 4 - 2,
    z: radius * Math.sin(angle),
  };
}

// Create Actuators
const actuators = [];
for (let i = 0; i < actuatorCount; i++) {
  const actuator = new Actuator_THREE(`Actuator ${i + 1}`, Math.PI / 4, 1000, true, true, true);
  const position = getRandomPosition();
  actuator.position.set(position.x, position.y, position.z);
  actuator.rotation.y = Math.random() * Math.PI * 2;

  // Add a rotation rate property to each actuator
  //constrain the rotation rate to a range of -0.01 to 0.01 and 3 decimal places
  actuator.rotationRate = Math.random() * 0.02 - 0.01;
  actuator.rotationRate = parseFloat(actuator.rotationRate.toFixed(3));
  if (actuator.rotationRate === 0) {
    actuator.rotationRate = 0.001;
  }

  scene.add(actuator);
  actuators.push(actuator);
}

// Create Sensors
const sensors = [];
for (let i = 0; i < sensorCount; i++) {
  const sensor = new Sensor_THREE(`Sensor ${i + 1}`, Math.PI / 2, 0.05, true, true, true);
  const position = getRandomPosition();
  sensor.position.set(position.x, position.y, position.z);
  sensor.rotation.y = Math.random() * Math.PI * 2;

  // Add a rotation rate property to each sensor
  //constrain the rotation rate to a range of -0.01 to 0.01 and 3 decimal places
  sensor.rotationRate = Math.random() * 0.02 - 0.01;
  sensor.rotationRate = parseFloat(sensor.rotationRate.toFixed(3));
  if (sensor.rotationRate === 0) {
    sensor.rotationRate = 0.001;
  }

  scene.add(sensor);
  sensors.push(sensor);
}

///////////////////////////
// scene analysis and ui updates

// A function to update the target detection status
function updateTargetDetectionStatus(sensor, transducer_status) {
  //console.log("transducer_status", transducer_status);
  let targetIsDetectable = false;
  transducer_status.innerHTML = '';
  //clear the line container

  const statusHeader = document.createElement('div');
  statusHeader.textContent = `Detection Summary:`;
  statusHeader.style.fontWeight = 'bold';
  transducer_status.appendChild(statusHeader);

  for (let actuator of actuators) {
    // for each actuator, check if it is detectable by the sensor
    // for an actuator to be detectable, it must be within the sensor's field of view and range
    // the result includes: inFieldOfView, inRange, distance, sourcePower, receivedIntensity
    const sensor_result = sensor.isTargetDetectable(actuator);

    if (sensor_result.inRange) {
      //the actuator is detectable
      targetIsDetectable = true;
      //is sensor visible to actuator
      //for this demo we will just check if the actuator is facing the sensor
      // the result includes: power, inFieldOfEffect, distance, transmittedIntensity
      const actuator_result = actuator.isTargetInFieldOfEffect(sensor);
      const isSensorVisible = actuator_result.inFieldOfEffect;

      // Create a new row for each detectable target
      let targetRow = document.createElement('div');
      targetRow.style.marginTop = '5px'; // Add some spacing between rows

      if (isSensorVisible) {
        // Set the entire targetRow text to green
        targetRow.innerHTML = `
          <strong>Target ${actuator.name}:</strong> <br>
          Detected <br>
          Distance: ${sensor_result.distance.toFixed(2)} <br>
          Source Power: ${sensor_result.sourcePower} <br>
          Sensed Intensity: ${sensor_result.receivedIntensity.toFixed(3)}
        `;
        targetRow.style.color = 'green'; // Set all text to green

        // Create a line between the sensor and the actuator
        // add the line to the line container
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        const points = [];
        points.push(sensor.position);
        points.push(actuator.position);
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        lineContainer.add(line);
      } else {
        // the actuator is not visible to the sensor
        // either too far or not in the field of view
        //if to far, the signal is too faint
        // Set the entire targetRow text to red
        targetRow.innerHTML = `
          <strong>Target ${actuator.name}:</strong> <br>
          Not Detected: Actuator not facing Sensor. <br>
          Distance: ${sensor_result.distance.toFixed(2)} <br>
          Source Power: ${sensor_result.sourcePower} <br>
          Sensed Intensity: ${sensor_result.receivedIntensity.toFixed(3)}
        `;
        targetRow.style.color = 'red'; // Set all text to red
      }
      // set the font size and weight for the target row
      targetRow.style.fontSize = '10px';
      // Append the target row to the status display
      transducer_status.appendChild(targetRow);
    }
  }

  if (!targetIsDetectable) {
    let targetRow = document.createElement('div');
    targetRow.style.marginTop = '5px'; // Add some spacing between rows
    targetRow.innerHTML = `<strong>No Targets Detected</strong>`;
    targetRow.style.fontSize = '10px';
    transducer_status.appendChild(targetRow);
  }
}

///////////////////////////
// UI Controls

// Create a container for the camera control
const cameraControl = createCameraControl(renderer);

// Create a parent container for the control panels
const controlsContainer = document.createElement('div');
controlsContainer.style.position = 'absolute';
controlsContainer.style.top = '10px';
controlsContainer.style.left = '10px';
controlsContainer.style.display = 'flex';
controlsContainer.style.flexDirection = 'row';
controlsContainer.style.alignItems = 'flex-start';
controlsContainer.style.gap = '10px';
controlsContainer.style.zIndex = '100';
document.body.appendChild(controlsContainer);

// Transducer Control UI Creation
function createTransducerControlUI(transducer) {
  const isSensor = transducer.transducerType === Transducer_THREE.TRANSDUCER_TYPE.SENSOR;
  const isActuator = transducer.transducerType === Transducer_THREE.TRANSDUCER_TYPE.ACTUATOR;

  //get the background color based on the field of effect color
  // Get the hexadecimal color value
  const rgbaColor = hexToRgba(transducer.fieldOfEffect_HelperColor, 0.8);
  const rgbaColor_button = hexToRgba(transducer.fieldOfEffect_HelperColor, 1.0);

  // Create the rgba color string
  const backgroundColor = rgbaColor;
  // Create the container for the UI controls
  const panelContainer = document.createElement('div');
  panelContainer.style.color = 'white';
  panelContainer.style.fontFamily = 'Arial, sans-serif';
  panelContainer.style.backgroundColor = backgroundColor;
  panelContainer.style.padding = '10px';
  panelContainer.style.borderRadius = '5px';
  panelContainer.style.width = '200px';
  panelContainer.style.marginBottom = '10px';
  panelContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
  panelContainer.style.boxSizing = 'border-box';
  panelContainer.style.flexGrow = '0';
  panelContainer.style.flexShrink = '1';

  // Title Button for the control panel
  const titleButton = document.createElement('button');
  titleButton.textContent = `${transducer.name} Controls`;
  titleButton.style.width = '100%';
  titleButton.style.backgroundColor = rgbaColor_button;
  titleButton.style.fontWeight = 'bold';
  titleButton.style.textAlign = 'center';
  titleButton.style.fontSize = '16px';
  titleButton.style.color = 'white';
  titleButton.style.border = '1px solid white';
  titleButton.style.borderRadius = '5px';
  titleButton.style.cursor = 'pointer';
  panelContainer.appendChild(titleButton);

  const controlContainer = document.createElement('div');
  controlContainer.style.display = 'flex';
  controlContainer.style.flexDirection = 'column';
  controlContainer.style.gap = '5px';
  panelContainer.appendChild(controlContainer);

  // Field of Effect (FoE) Angle Control
  const fovLabel = document.createElement('div');
  fovLabel.textContent = `Field of Effect: ${formatValue(
    transducer.fieldOfEffect_AngleFull * (180 / Math.PI),
    0
  )}°`;
  fovLabel.style.marginTop = '5px';
  controlContainer.appendChild(fovLabel);

  // Create the input element for the field of effect angle
  const fovInput = document.createElement('input');
  fovInput.type = 'range';
  fovInput.min = '0';
  fovInput.max = '180';
  fovInput.value = (transducer.fieldOfEffect_AngleFull * (180 / Math.PI)).toFixed(0);
  fovInput.addEventListener('input', () => {
    const fovValue = fovInput.value;
    transducer.fieldOfEffect_AngleFull = (fovValue * Math.PI) / 180;
    fovLabel.textContent = `Field of Effect: ${formatValue(fovValue, 0)}°`;
  });
  controlContainer.appendChild(fovInput);

  // Power Control (only for Actuators, to determine range)
  if (isActuator) {
    const powerLabel = document.createElement('div');
    powerLabel.textContent = `Power: ${formatValue(transducer.power || 50)}`;
    powerLabel.style.marginTop = '5px';
    controlContainer.appendChild(powerLabel);

    const powerInput = document.createElement('input');
    powerInput.type = 'range';
    powerInput.min = '10'; // Minimum power level
    powerInput.max = '1000'; // Maximum power level
    powerInput.value = transducer.power;
    powerInput.addEventListener('input', () => {
      const powerValue = parseInt(powerInput.value);
      transducer.power = powerValue;
      powerLabel.textContent = `Power: ${formatValue(transducer.power)}`;
    });
    controlContainer.appendChild(powerInput);
  }

  // Sensitivity Control (only for Sensors)
  if (isSensor) {
    const sensitivityLabel = document.createElement('div');
    sensitivityLabel.textContent = `Sensitivity: ${formatValue(
      transducer.minIntensitySensitivity,
      2
    )}`;
    sensitivityLabel.style.marginTop = '5px';
    controlContainer.appendChild(sensitivityLabel);

    const sensitivityInput = document.createElement('input');
    sensitivityInput.type = 'range';
    sensitivityInput.min = '0.01';
    sensitivityInput.max = '1.00';
    sensitivityInput.step = '0.01';
    sensitivityInput.value = transducer.minIntensitySensitivity.toFixed(2);
    sensitivityInput.addEventListener('input', () => {
      transducer.minIntensitySensitivity = parseFloat(sensitivityInput.value);
      sensitivityLabel.textContent = `Sensitivity: ${formatValue(
        transducer.minIntensitySensitivity,
        2
      )}`;
    });
    controlContainer.appendChild(sensitivityInput);
  }

  // Rotation Rate Control (for all transducers)
  const rotationRateLabel = document.createElement('div');
  rotationRateLabel.textContent = `Rotation Rate: ${formatValue(transducer.rotationRate, 3)}`;
  rotationRateLabel.style.marginTop = '5px';
  controlContainer.appendChild(rotationRateLabel);

  // Create the input element for the rotation rate
  const rotationRateSlider = document.createElement('input');
  rotationRateSlider.type = 'range';
  rotationRateSlider.min = '-0.01';
  rotationRateSlider.max = '0.01';
  rotationRateSlider.step = '0.001';
  rotationRateSlider.value = transducer.rotationRate; // Set initial value to the transducer's current rotation rate
  rotationRateSlider.addEventListener('input', (event) => {
    const newRotationRate = parseFloat(event.target.value);
    transducer.rotationRate = newRotationRate; // Update the transducer's rotation rate property
    rotationRateLabel.textContent = `Rotation Rate: ${formatValue(newRotationRate, 3)}`;
  });
  controlContainer.appendChild(rotationRateSlider);

  // Status Display for Sensors
  let statusDisplay;
  if (isSensor) {
    statusDisplay = document.createElement('div');
    statusDisplay.textContent = `${transducer.name} Status: Initializing...`;
    statusDisplay.style.fontSize = '12px';
    statusDisplay.style.fontWeight = 'lighter';
    statusDisplay.style.marginTop = '5px';
    panelContainer.appendChild(statusDisplay);
  } else if (isActuator) {
    // Status Display for Actuators
    statusDisplay = document.createElement('div');
    statusDisplay.textContent = `Location: (${formatValue(
      transducer.position.x,
      1
    )}, ${formatValue(transducer.position.y, 1)}, ${formatValue(transducer.position.z, 1)})`;
    statusDisplay.style.fontSize = '12px';
    statusDisplay.style.fontWeight = 'lighter';
    statusDisplay.style.marginTop = '5px';
    panelContainer.appendChild(statusDisplay);

    const strengthLabel = document.createElement('div');
    strengthLabel.textContent = `Effective Range: ${formatValue(
      transducer.fieldOfEffect_HelperRange
    )}`;
    strengthLabel.style.fontSize = '12px';
    strengthLabel.style.fontWeight = 'lighter';
    strengthLabel.style.marginTop = '5px';
    panelContainer.appendChild(strengthLabel);
  }
  // Add the control container to the controls container
  controlsContainer.appendChild(panelContainer);

  titleButton.addEventListener('click', () => {
    //toggle the display of the control panel
    controlContainer.style.display = controlContainer.style.display === 'none' ? 'block' : 'none';
  });

  // Return the control container status display for the transducer
  return statusDisplay;
}

// Function to update the scene on each frame
function animate() {
  requestAnimationFrame(animate);

  lineContainer.children = []; //clear the line container
  actuators.forEach((actuator, index) => {
    actuator.rotation.y += actuator.rotationRate;
    if (actuator.rotation.y > Math.PI * 2) {
      actuator.rotation.y = 0;
    }
    // update actuator status display for each actuator
    // this will show power changes and effective range
  });

  sensors.forEach((sensor, index) => {
    sensor.rotation.y += sensor.rotationRate;
    if (sensor.rotation.y > Math.PI * 2) {
      sensor.rotation.y = 0;
    }
    // update sensor status display for each sensor
    updateTargetDetectionStatus(sensor, sensors_control_status[index]);
  });

  // Render the scene
  renderMainCamera();
}

// Create UI for each sensor and actuator
const sensors_control_status = sensors.map(createTransducerControlUI);
const actuators_control_status = actuators.map(createTransducerControlUI);

// Start the animation loop
animate();

function renderMainCamera() {
  // Render the main scene from the main camera's perspective
  renderer.clear(); // Clear the previous frame

  // Update orbit mode if active

  cameraControl.updateOrbit();

  // Update the controls and render the scene
  if (!cameraControl.isOrbiting) {
    cameraControl.currentOrbitControl.update(); // Only update controls if not in orbit mode
  }

  renderer.render(scene, cameraControl.camera);
}
