import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/controls/OrbitControls.js";
import { Actuator_THREE } from "../../lib/Actuator_THREE.js";
import { Sensor_THREE } from "../../lib/Sensor_THREE.js";
import { Transducer_THREE } from "../../lib/Transducer_THREE.js";
import { formatValue } from "../../lib/UI_Utilities.js";

const sensorCount = 3;
const actuatorCount = 3;

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

// Set up OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Add a directional light to the scene
const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(70, 200, 100).normalize();
scene.add(light);

// Add a grid helper to the scene
const gridHelper = new THREE.PolarGridHelper(
  42,
  8,
  16,
  128,
  0xcccccc,
  0xdddddd
);
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
  const actuator = new Actuator_THREE(
    `Actuator ${i + 1}`,
    Math.PI / 4,
    1000,
    true,
    true,
    true
  );
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
  const sensor = new Sensor_THREE(
    `Sensor ${i + 1}`,
    Math.PI / 2,
    0.05,
    true,
    true,
    true
  );
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

// A function to update the target detection status
function updateTargetDetectionStatus(sensor, statusDisplay) {
  let targetIsDetectable = false;
  statusDisplay.innerHTML = "";

  const statusHeader = document.createElement("div");
  statusHeader.textContent = `Actuator Detection Summary for ${sensor.name}:`;
  statusHeader.style.fontWeight = "bold";
  statusDisplay.appendChild(statusHeader);

  for (let actuator of actuators) {
    // for each actuator, check if it is detectable by the sensor
    // for an actuator to be detectable, it must be within the sensor's field of view and range
    if (sensor.isTargetDetectable(actuator).inRange) {
      targetIsDetectable = true;
      //is sensor visible to actuator
      //for this demo we will just check if the actuator is facing the sensor
      const result = actuator.isTargetInFieldOfEffect(sensor);
      const isSensorVisible = result.inFieldOfEffect;

      if (isSensorVisible) {
        const targetRow = document.createElement("div");
        targetRow.style.marginTop = "5px";
        targetRow.innerHTML = `<strong>Actuator:</strong> Pos: (${actuator.position.x.toFixed(
          1
        )}, ${actuator.position.y.toFixed(1)}, ${actuator.position.z.toFixed(
          1
        )}) <span style="color: green;">(Facing sensor)</span>`;
        statusDisplay.appendChild(targetRow);
      } else {
        const targetRow = document.createElement("div");
        targetRow.style.marginTop = "5px";
        targetRow.innerHTML = `<strong>Actuator:</strong> Pos: (${actuator.position.x.toFixed(
          1
        )}, ${actuator.position.y.toFixed(1)}, ${actuator.position.z.toFixed(
          1
        )}) <span style="color: red;">(Not facing sensor)</span>`;
        statusDisplay.appendChild(targetRow);
      }

      // target.material.color.setRGB(0, 1, 0); // Detected targets turn green
      // target.material.emissive.setRGB(0, 1, 0);
    } else {
      // target.material.color.set(0xff0000);
      // target.material.emissive.set(0x000000);
    }
  }

  if (!targetIsDetectable) {
    const noTargetMessage = document.createElement("div");
    noTargetMessage.textContent = `No Actuators detected by ${sensor.name}.`;
    statusDisplay.appendChild(noTargetMessage);
  }
}

// Create a parent container for the control panels
const controlsContainer = document.createElement("div");
controlsContainer.style.position = "absolute";
controlsContainer.style.top = "10px";
controlsContainer.style.left = "10px";
controlsContainer.style.display = "flex";
controlsContainer.style.flexDirection = "row";
controlsContainer.style.gap = "10px";
controlsContainer.style.zIndex = "100";
document.body.appendChild(controlsContainer);

// UI Creation
function createUI(transducer) {
  const isSensor =
    transducer.transducerType === Transducer_THREE.TRANSDUCER_TYPE.SENSOR;
  const isActuator =
    transducer.transducerType === Transducer_THREE.TRANSDUCER_TYPE.ACTUATOR;

  //get the background color based on the field of effect color
  // Get the hexadecimal color value
  const hexColor = transducer.fieldOfEffect_HelperColor;

  // Extract RGB components from the hexadecimal color
  let red = (hexColor >> 16) & 0xff;
  let green = (hexColor >> 8) & 0xff;
  let blue = hexColor & 0xff;

  // Set the transparency value (0.0 to 1.0, where 0 is fully transparent and 1 is fully opaque)
  const alpha = 0.8; // Example: 80% opacity

  // Create the rgba color string
  const backgroundColor = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  // Create the container for the UI controls
  const uiContainer = document.createElement("div");
  uiContainer.style.color = "white";
  uiContainer.style.fontFamily = "Arial, sans-serif";
  uiContainer.style.backgroundColor = backgroundColor;
  uiContainer.style.padding = "10px";
  uiContainer.style.borderRadius = "5px";
  uiContainer.style.width = "200px";
  uiContainer.style.marginBottom = "10px";
  controlsContainer.appendChild(uiContainer);

  // Title Label
  const titleLabel = document.createElement("div");
  titleLabel.textContent = `${transducer.name} Controls`;
  titleLabel.style.fontWeight = "bold";
  titleLabel.style.textAlign = "center";
  uiContainer.appendChild(titleLabel);

  // Field of Effect (FoE) Angle Control
  const fovLabel = document.createElement("div");
  fovLabel.textContent = `Field of Effect: ${formatValue(
    transducer.fieldOfEffect_AngleFull * (180 / Math.PI),
    0
  )}°`;
  fovLabel.style.marginTop = "5px";
  uiContainer.appendChild(fovLabel);

  const fovInput = document.createElement("input");
  fovInput.type = "range";
  fovInput.min = "0";
  fovInput.max = "180";
  fovInput.value = (
    transducer.fieldOfEffect_AngleFull *
    (180 / Math.PI)
  ).toFixed(0);
  fovInput.addEventListener("input", () => {
    const fovValue = fovInput.value;
    transducer.fieldOfEffect_AngleFull = (fovValue * Math.PI) / 180;
    fovLabel.textContent = `Field of Effect: ${formatValue(fovValue, 0)}°`;
  });
  uiContainer.appendChild(fovInput);

  // Power Control (only for Actuators, to determine range)
  if (isActuator) {
    const powerLabel = document.createElement("div");
    powerLabel.textContent = `Power: ${formatValue(transducer.power || 50)}`;
    powerLabel.style.marginTop = "5px";
    uiContainer.appendChild(powerLabel);

    const powerInput = document.createElement("input");
    powerInput.type = "range";
    powerInput.min = "10"; // Minimum power level
    powerInput.max = "1000"; // Maximum power level
    powerInput.value = transducer.power;
    powerInput.addEventListener("input", () => {
      const powerValue = parseInt(powerInput.value);
      transducer.power = powerValue;
      powerLabel.textContent = `Power: ${formatValue(transducer.power)}`;
    });
    uiContainer.appendChild(powerInput);
  }

  // Sensitivity Control (only for Sensors)
  if (isSensor) {
    const sensitivityLabel = document.createElement("div");
    sensitivityLabel.textContent = `Sensitivity: ${formatValue(
      transducer.minIntensitySensitivity,
      2
    )}`;
    sensitivityLabel.style.marginTop = "5px";
    uiContainer.appendChild(sensitivityLabel);

    const sensitivityInput = document.createElement("input");
    sensitivityInput.type = "range";
    sensitivityInput.min = "0.01";
    sensitivityInput.max = "1.00";
    sensitivityInput.step = "0.01";
    sensitivityInput.value = transducer.minIntensitySensitivity.toFixed(2);
    sensitivityInput.addEventListener("input", () => {
      transducer.minIntensitySensitivity = parseFloat(sensitivityInput.value);
      sensitivityLabel.textContent = `Sensitivity: ${formatValue(
        transducer.minIntensitySensitivity,
        2
      )}`;
    });
    uiContainer.appendChild(sensitivityInput);
  }

  // Rotation Rate Control (for all transducers)
  const rotationRateLabel = document.createElement("div");
  rotationRateLabel.textContent = `Rotation Rate: ${formatValue(
    transducer.rotationRate,
    3
  )}`;
  rotationRateLabel.style.marginTop = "5px";
  uiContainer.appendChild(rotationRateLabel);

  const rotationRateSlider = document.createElement("input");
  rotationRateSlider.type = "range";
  rotationRateSlider.min = "-0.01";
  rotationRateSlider.max = "0.01";
  rotationRateSlider.step = "0.001";
  rotationRateSlider.value = transducer.rotationRate; // Set initial value to the transducer's current rotation rate
  rotationRateSlider.addEventListener("input", (event) => {
    const newRotationRate = parseFloat(event.target.value);
    transducer.rotationRate = newRotationRate; // Update the transducer's rotation rate property
    rotationRateLabel.textContent = `Rotation Rate: ${formatValue(
      newRotationRate,
      3
    )}`;
  });
  uiContainer.appendChild(rotationRateSlider);

  // Status Display for Sensors
  if (isSensor) {
    const statusDisplay = document.createElement("div");
    statusDisplay.textContent = `${transducer.name} Status: Initializing...`;
    statusDisplay.style.fontSize = "12px";
    statusDisplay.style.fontWeight = "lighter";
    statusDisplay.style.marginTop = "5px";
    uiContainer.appendChild(statusDisplay);
    return statusDisplay; // Return the status display for sensors
  }

  // Status Display for Actuators
  if (isActuator) {
    const statusDisplay = document.createElement("div");
    statusDisplay.textContent = `Location: (${formatValue(
      transducer.position.x,
      1
    )}, ${formatValue(transducer.position.y, 1)}, ${formatValue(
      transducer.position.z,
      1
    )})`;
    statusDisplay.style.fontSize = "12px";
    statusDisplay.style.fontWeight = "lighter";
    statusDisplay.style.marginTop = "5px";
    uiContainer.appendChild(statusDisplay);

    const strengthLabel = document.createElement("div");
    strengthLabel.textContent = `Effective Range: ${formatValue(
      transducer.fieldOfEffect_HelperRange
    )}`;
    strengthLabel.style.fontSize = "12px";
    strengthLabel.style.fontWeight = "lighter";
    strengthLabel.style.marginTop = "5px";
    uiContainer.appendChild(strengthLabel);

    return statusDisplay; // Return the status display for actuators
  }

  return null; // Return null for any other type
}

// Create UI for each sensor and actuator
const sensors_statusDisplays = sensors.map(createUI);
const actuators_statusDisplays = actuators.map(createUI);

// Function to update the scene on each frame
function animate() {
  requestAnimationFrame(animate);

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
    updateTargetDetectionStatus(sensor, sensors_statusDisplays[index]);
  });

  controls.update();
  renderer.render(scene, camera);
}

// Handling window resizing
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the animation loop
animate();
