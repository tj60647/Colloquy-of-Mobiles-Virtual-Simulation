import { LightActuator } from "../lib/LightActuator.js";
import { Sensor } from "../../lib/Sensor.js";
import { Transform } from "../../lib/Transform.js";
import { Render3Dp5 } from "../../lib/Render3Dp5.js";

//console.log("Sketch starting..."); // Should appear in the console immediately

let easyFont;
let easycam;
let rootTransform, actuator, sensor;
let testPoints = [];
let hud;

// Attach the functions to the window object
window.preload = preload;
window.setup = setup;
window.draw = draw;
let loading = true;

// Preload the font
function preload() {
  //console.log("Preloading...");
  easyFont = loadFont("roboto-regular-webfont.ttf");
  //console.log("Font loaded:", !!easyFont); // Log true if the font is loaded successfully
}

// Setup function
function setup() {
  //console.log("Setup started");
  createCanvas(600, 600, WEBGL);
  frameRate(30);
  //console.log("typeof createEasyCam: " + typeof createEasyCam); // Should print "function"
  easycam = createEasyCam();
  document.oncontextmenu = () => false;
  textFont(easyFont);

  // Initialize transforms
  rootTransform = new Transform(
    null,
    { x: 0, y: 0, z: 0 },
    { yaw: 0, pitch: 0, roll: 0 },
    "Root",
    1
  );
  actuator = new LightActuator(
    rootTransform,
    { x: 35, y: 0, z: 50 },
    { yaw: 0, pitch: 0, roll: 90 },
    60
  );
  sensor = new Sensor(
    rootTransform,
    { x: -35, y: 0, z: 50 },
    { yaw: 0, pitch: 0, roll: -90 },
    60
  );

  // Generate test points
  const grid_Z = 50;
  const gridSpacing = 10;
  const gridPointCount_X = 10;
  const gridPointCount_Y = 10;
  const gridOffset_X = (gridPointCount_X * gridSpacing) / 2;
  const gridOffset_Y = (gridPointCount_Y * gridSpacing) / 2;

  for (let i = 0; i < gridPointCount_X; i++) {
    for (let j = 0; j < gridPointCount_Y; j++) {
      const x = i * gridSpacing - gridOffset_X;
      const y = j * gridSpacing - gridOffset_Y;
      testPoints.push({ x: x, y: y, z: grid_Z });
    }
  }

  hud = createGraphics(600, 600);
  hud.textSize(16);
  hud.fill(0);

  // Set up is done
  loading = false;
}

// Draw function
function draw() {
  if (loading) {
    // Display a loading screen
    background(220);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("Loading...", width / 2, height / 2);
  } else {
    background(220);
    lights();

    Render3Dp5.drawLineToTransform(rootTransform);
    Render3Dp5.drawLineToTransform(actuator);
    Render3Dp5.drawLineToTransform(sensor);

    Render3Dp5.drawTransform(rootTransform);
    Render3Dp5.drawTransform(actuator);
    Render3Dp5.drawTransform(sensor);

    Render3Dp5.drawActuatorFOV(actuator);
    Render3Dp5.drawSensorFOV(sensor);

    for (let point of testPoints) {
      Render3Dp5.drawTestPoint(point, sensor.isInFieldOfView(point));
    }

    //easycam.beginHUD();
    //drawHUD();
    //easycam.endHUD();
  }
}

// Draw HUD
function drawHUD() {
  fill(0);
  textSize(10);
  textAlign(LEFT, TOP);

  // Root Transform
  text(
    `Root Global Position: (${rootTransform
      .getGlobalPosition()
      .x.toFixed(2)}, ` +
      `${rootTransform.getGlobalPosition().y.toFixed(2)}, ` +
      `${rootTransform.getGlobalPosition().z.toFixed(2)})`,
    20,
    20
  );
  text(
    `Root Local Position: (${rootTransform.localPosition.x.toFixed(2)}, ` +
      `${rootTransform.localPosition.y.toFixed(2)}, ` +
      `${rootTransform.localPosition.z.toFixed(2)})`,
    20,
    40
  );
  text(
    `Root Global Orientation: (Yaw: ${rootTransform
      .getGlobalOrientation()
      .yaw.toFixed(2)}, ` +
      `Pitch: ${rootTransform.getGlobalOrientation().pitch.toFixed(2)}, ` +
      `Roll: ${rootTransform.getGlobalOrientation().roll.toFixed(2)})`,
    20,
    60
  );
  text(
    `Root Local Orientation: (Yaw: ${rootTransform.localOrientation.yaw.toFixed(
      2
    )}, ` +
      `Pitch: ${rootTransform.localOrientation.pitch.toFixed(2)}, ` +
      `Roll: ${rootTransform.localOrientation.roll.toFixed(2)})`,
    20,
    80
  );

  // Actuator
  text(
    `Actuator Global Position: (${actuator
      .getGlobalPosition()
      .x.toFixed(2)}, ` +
      `${actuator.getGlobalPosition().y.toFixed(2)}, ` +
      `${actuator.getGlobalPosition().z.toFixed(2)})`,
    20,
    120
  );
  text(
    `Actuator Local Position: (${actuator.localPosition.x.toFixed(2)}, ` +
      `${actuator.localPosition.y.toFixed(2)}, ` +
      `${actuator.localPosition.z.toFixed(2)})`,
    20,
    140
  );
  text(
    `Actuator Global Orientation: (Yaw: ${actuator
      .getGlobalOrientation()
      .yaw.toFixed(2)}, ` +
      `Pitch: ${actuator.getGlobalOrientation().pitch.toFixed(2)}, ` +
      `Roll: ${actuator.getGlobalOrientation().roll.toFixed(2)})`,
    20,
    160
  );
  text(
    `Actuator Local Orientation: (Yaw: ${actuator.localOrientation.yaw.toFixed(
      2
    )}, ` +
      `Pitch: ${actuator.localOrientation.pitch.toFixed(2)}, ` +
      `Roll: ${actuator.localOrientation.roll.toFixed(2)})`,
    20,
    180
  );

  // Sensor
  text(
    `Sensor Global Position: (${sensor.getGlobalPosition().x.toFixed(2)}, ` +
      `${sensor.getGlobalPosition().y.toFixed(2)}, ` +
      `${sensor.getGlobalPosition().z.toFixed(2)})`,
    20,
    220
  );
  text(
    `Sensor Local Position: (${sensor.localPosition.x.toFixed(2)}, ` +
      `${sensor.localPosition.y.toFixed(2)}, ` +
      `${sensor.localPosition.z.toFixed(2)})`,
    20,
    240
  );
  text(
    `Sensor Global Orientation: (Yaw: ${sensor
      .getGlobalOrientation()
      .yaw.toFixed(2)}, ` +
      `Pitch: ${sensor.getGlobalOrientation().pitch.toFixed(2)}, ` +
      `Roll: ${sensor.getGlobalOrientation().roll.toFixed(2)})`,
    20,
    260
  );
  text(
    `Sensor Local Orientation: (Yaw: ${sensor.localOrientation.yaw.toFixed(
      2
    )}, ` +
      `Pitch: ${sensor.localOrientation.pitch.toFixed(2)}, ` +
      `Roll: ${sensor.localOrientation.roll.toFixed(2)})`,
    20,
    280
  );
}
