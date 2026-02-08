import { SensorBase as Sensor } from '../../../dist/lib/components/SensorBase.js';
import { Transform } from '../../../dist/lib/Transform.js';
import { Render3Dp5 } from '../../../lib/Render3Dp5.js';

//console.log("Sketch starting..."); // Should appear in the console immediately

let easyFont;
let easycam;
let rootTransform, sensor;
let testPoints = [];
let hud;

// Attach the functions to the window object
window.preload = preload;
window.setup = setup;
window.draw = draw;

/**
 * Setup function for p5.js sketch.
 * Initializes a hierarchy of Transform objects, sets up the canvas in WEBGL mode, and initializes EasyCam for interactive 3D navigation.
 * Also sets up a HUD for displaying statistics about the transforms.
 */
function preload() {
  easyFont = loadFont('roboto-regular-webfont.ttf'); // on openprocessing, this file is in the "files" tab of the web ide.
}

function setup() {
  createCanvas(600, 600, WEBGL);
  easycam = createEasyCam(); // Initialize EasyCam for interactive 3D view control
  document.oncontextmenu = () => false; // Disable right-click context menu to prevent interference with EasyCam

  // use the loaded font
  // called after create canvas
  textFont(easyFont);

  // Initialize transforms with hierarchical relationships
  rootTransform = new Transform(
    null,
    { x: 0, y: 0, z: 0 },
    { yaw: 0, pitch: 0, roll: 0 },
    'Root',
    1
  );
  sensor = new Sensor(rootTransform, { x: 0, y: 0, z: 50 }, { yaw: 0, pitch: 15, roll: 15 }, 60);

  // Generate 100 test points at z = 50
  const numPoints = 121;
  const gridSize = 11; // Adjust this value to change the spacing between points
  for (let i = 0; i < numPoints; i++) {
    const x = (i % gridSize) * gridSize - gridSize * 5;
    const y = Math.floor(i / gridSize) * gridSize - gridSize * 5;
    testPoints.push({ x: x, y: y, z: 50 });
  }

  // Setup HUD for displaying statistics
  hud = createGraphics(600, 600);
  hud.textSize(16);
  hud.fill(0);
}

/**
 * Draw function for p5.js sketch.
 * Continuously executes to update the canvas with the current state of transforms and their connections.
 * It also updates the HUD with current transform statistics.
 */
function draw() {
  background(220);
  lights(); // Add default lighting to enhance 3D visibility

  // slowly rotate the sensor about its z axis
  sensor.roll += 0.1;
  //if the angle is greater than 360, reset it to 0
  if (sensor.roll > 360) {
    sensor.roll = 0;
  }

  // Draw lines connecting transforms in the hierarchy
  Render3Dp5.drawLineToTransform(rootTransform);
  Render3Dp5.drawLineToTransform(sensor);

  // Draw transforms and their local coordinate axes
  Render3Dp5.drawTransform(rootTransform);
  Render3Dp5.drawTransform(sensor);

  // Draw the sensor's field of view
  Render3Dp5.drawSensorFOV(sensor);

  // Draw test points
  for (let point of testPoints) {
    Render3Dp5.drawTestPoint(point, sensor.isInFieldOfView(point));
  }

  // Draw HUD with statistics
  easycam.beginHUD();
  drawHUD();
  easycam.endHUD();
}

/**
 * Draws the HUD with statistics about each transform.
 * The HUD displays the global and local positions and orientations of the root and sensor transforms.
 */
function drawHUD() {
  fill(0);
  textSize(10);
  textAlign(LEFT, TOP);

  // Root Transform
  text(
    `Root Global Position: (${rootTransform.getGlobalPosition().x.toFixed(2)}, ` +
    `${rootTransform.getGlobalPosition().y.toFixed(2)}, ` +
    `${rootTransform.getGlobalPosition().z.toFixed(2)})`,
    20,
    20
  );
  text(
    `Root Local Position: (${rootTransform.x.toFixed(2)}, ` +
    `${rootTransform.y.toFixed(2)}, ` +
    `${rootTransform.z.toFixed(2)})`,
    20,
    40
  );
  text(
    `Root Global Orientation: (Yaw: ${rootTransform.getGlobalOrientation().yaw.toFixed(2)}, ` +
    `Pitch: ${rootTransform.getGlobalOrientation().pitch.toFixed(2)}, ` +
    `Roll: ${rootTransform.getGlobalOrientation().roll.toFixed(2)})`,
    20,
    60
  );
  text(
    `Root Local Orientation: (Yaw: ${rootTransform.yaw.toFixed(2)}, ` +
    `Pitch: ${rootTransform.pitch.toFixed(2)}, ` +
    `Roll: ${rootTransform.roll.toFixed(2)})`,
    20,
    80
  );

  // Sensor
  text(
    `Sensor Global Position: (${sensor.getGlobalPosition().x.toFixed(2)}, ` +
    `${sensor.getGlobalPosition().y.toFixed(2)}, ` +
    `${sensor.getGlobalPosition().z.toFixed(2)})`,
    20,
    120
  );
  text(
    `Sensor Local Position: (${sensor.x.toFixed(2)}, ` +
    `${sensor.y.toFixed(2)}, ` +
    `${sensor.z.toFixed(2)})`,
    20,
    140
  );
  text(
    `Sensor Global Orientation: (Yaw: ${sensor.getGlobalOrientation().yaw.toFixed(2)}, ` +
    `Pitch: ${sensor.getGlobalOrientation().pitch.toFixed(2)}, ` +
    `Roll: ${sensor.getGlobalOrientation().roll.toFixed(2)})`,
    20,
    160
  );
  text(
    `Sensor Local Orientation: (Yaw: ${sensor.yaw.toFixed(2)}, ` +
    `Pitch: ${sensor.pitch.toFixed(2)}, ` +
    `Roll: ${sensor.roll.toFixed(2)})`,
    20,
    180
  );
  text(
    `Point In FOV: (${testPoints[0].x.toFixed(2)}, ${testPoints[0].y.toFixed(2)}, ` +
    `${testPoints[0].z.toFixed(2)})`,
    20,
    220
  );
  text(
    `Point Out FOV: (${testPoints[1].x.toFixed(2)}, ${testPoints[1].y.toFixed(2)}, ` +
    `${testPoints[1].z.toFixed(2)})`,
    20,
    240
  );
}
