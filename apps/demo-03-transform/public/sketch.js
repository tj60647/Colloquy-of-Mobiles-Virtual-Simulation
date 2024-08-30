import { Transform } from "../lib/Transform.js";

//console.log("Sketch starting..."); // Should appear in the console immediately

// Attach the functions to the window object
window.preload = preload;
window.setup = setup;
window.draw = draw;

let easyFont;
let easycam;
let rootTransform,
  childTransform,
  grandChildTransform,
  greatGrandChildTransform;
let hud;

/**
 * Setup function for p5.js sketch.
 * Initializes a hierarchy of Transform objects, sets up the canvas in WEBGL mode, and initializes EasyCam for interactive 3D navigation.
 * Also sets up a HUD for displaying statistics about the transforms.
 */

function preload() {
  easyFont = loadFont("roboto-regular-webfont.ttf"); // on openprocessing, this file is in the "files" tab of the web ide.
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
    "Root",
    1
  );
  childTransform = new Transform(
    rootTransform,
    { x: 0, y: 0, z: 50 },
    { yaw: 0, pitch: 90, roll: 0 },
    "Child",
    2
  );
  grandChildTransform = new Transform(
    childTransform,
    { x: 0, y: 0, z: 50 },
    { yaw: 0, pitch: 90, roll: 0 },
    "GrandChild",
    3
  );
  greatGrandChildTransform = new Transform(
    grandChildTransform,
    { x: 0, y: 0, z: 50 },
    { yaw: 0, pitch: 90, roll: 0 },
    "GreatGrandChild",
    4
  );

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

  // Draw lines connecting transforms in the hierarchy
  drawLineToTransform(rootTransform);
  drawLineToTransform(childTransform);
  drawLineToTransform(grandChildTransform);
  drawLineToTransform(greatGrandChildTransform);

  // Draw transforms and their local coordinate axes
  drawTransform(rootTransform);
  drawTransform(childTransform);
  drawTransform(grandChildTransform);
  drawTransform(greatGrandChildTransform);

  // Draw HUD with statistics
  easycam.beginHUD();
  drawHUD();
  easycam.endHUD();
}

/**
 * Draws a line from the parent transform to the specified transform.
 * If the transform has no parent, the line is drawn from the origin.
 * @param {Transform} transform - The Transform object to which the line is drawn.
 */
function drawLineToTransform(transform) {
  const pos = transform.getGlobalPosition();
  const parentPos = transform.parent
    ? transform.parent.getGlobalPosition()
    : { x: 0, y: 0, z: 0 };
  stroke(0, 128, 0); // Set line color to green for visibility
  line(parentPos.x, parentPos.y, parentPos.z, pos.x, pos.y, pos.z); // Draw line from parent to transform position
}

/**
 * Draws a transform and its local coordinate axes in 3D space.
 * The transform is visualized as a sphere, and the axes are colored lines.
 * @param {Transform} transform - The Transform object to draw.
 */
function drawTransform(transform) {
  const pos = transform.getGlobalPosition();
  const ori = transform.getGlobalOrientation();

  push(); // Start a new drawing state
  translate(pos.x, pos.y, pos.z); // Move to the global position of the transform

  // Draw the transform as a small sphere
  fill(128, 0, 0); // Red color for the sphere
  sphere(2); // Sphere size

  // Apply orientation to the local axes
  rotateZ(radians(ori.roll));
  rotateX(radians(ori.pitch));
  rotateY(radians(-ori.yaw));

  // Draw local coordinate axes
  strokeWeight(1);
  stroke(255, 0, 0); // X-axis in red
  line(0, 0, 0, 20, 0, 0);
  stroke(0, 255, 0); // Y-axis in green
  line(0, 0, 0, 0, 20, 0);
  stroke(0, 0, 255); // Z-axis in blue
  line(0, 0, 0, 0, 0, 20);

  // Draw axis labels
  textSize(8);
  fill(255, 0, 0);
  text("X", 22, 0, 0);
  fill(0, 255, 0);
  text("Y", 0, 22, 0);
  fill(0, 0, 255);
  text("Z", 0, 0, 22);

  pop(); // Restore original drawing state
}

/**
 * Draws the HUD with statistics about each transform.
 * The HUD displays the global and local positions and orientations of the root, child, grandchild, and great-grandchild transforms.
 */
function drawHUD() {
  fill(0);
  textSize(10);
  textAlign(LEFT, TOP);

  // Root Transform
  text(
    `Root Global Position: (${rootTransform
      .getGlobalPosition()
      .x.toFixed(2)}, ${rootTransform
      .getGlobalPosition()
      .y.toFixed(2)}, ${rootTransform.getGlobalPosition().z.toFixed(2)})`,
    20,
    20
  );
  text(
    `Root Local Position: (${rootTransform.localPosition.x.toFixed(
      2
    )}, ${rootTransform.localPosition.y.toFixed(
      2
    )}, ${rootTransform.localPosition.z.toFixed(2)})`,
    20,
    40
  );
  text(
    `Root Global Orientation: (Yaw: ${rootTransform
      .getGlobalOrientation()
      .yaw.toFixed(2)}, Pitch: ${rootTransform
      .getGlobalOrientation()
      .pitch.toFixed(2)}, Roll: ${rootTransform
      .getGlobalOrientation()
      .roll.toFixed(2)})`,
    20,
    60
  );
  text(
    `Root Local Orientation: (Yaw: ${rootTransform.localOrientation.yaw.toFixed(
      2
    )}, Pitch: ${rootTransform.localOrientation.pitch.toFixed(
      2
    )}, Roll: ${rootTransform.localOrientation.roll.toFixed(2)})`,
    20,
    80
  );

  // Child Transform
  text(
    `Child Global Position: (${childTransform
      .getGlobalPosition()
      .x.toFixed(2)}, ${childTransform
      .getGlobalPosition()
      .y.toFixed(2)}, ${childTransform.getGlobalPosition().z.toFixed(2)})`,
    20,
    120
  );
  text(
    `Child Local Position: (${childTransform.localPosition.x.toFixed(
      2
    )}, ${childTransform.localPosition.y.toFixed(
      2
    )}, ${childTransform.localPosition.z.toFixed(2)})`,
    20,
    140
  );
  text(
    `Child Global Orientation: (Yaw: ${childTransform
      .getGlobalOrientation()
      .yaw.toFixed(2)}, Pitch: ${childTransform
      .getGlobalOrientation()
      .pitch.toFixed(2)}, Roll: ${childTransform
      .getGlobalOrientation()
      .roll.toFixed(2)})`,
    20,
    160
  );
  text(
    `Child Local Orientation: (Yaw: ${childTransform.localOrientation.yaw.toFixed(
      2
    )}, Pitch: ${childTransform.localOrientation.pitch.toFixed(
      2
    )}, Roll: ${childTransform.localOrientation.roll.toFixed(2)})`,
    20,
    180
  );

  // GrandChild Transform
  text(
    `GrandChild Global Position: (${grandChildTransform
      .getGlobalPosition()
      .x.toFixed(2)}, ${grandChildTransform
      .getGlobalPosition()
      .y.toFixed(2)}, ${grandChildTransform.getGlobalPosition().z.toFixed(2)})`,
    20,
    220
  );
  text(
    `GrandChild Local Position: (${grandChildTransform.localPosition.x.toFixed(
      2
    )}, ${grandChildTransform.localPosition.y.toFixed(
      2
    )}, ${grandChildTransform.localPosition.z.toFixed(2)})`,
    20,
    240
  );
  text(
    `GrandChild Global Orientation: (Yaw: ${grandChildTransform
      .getGlobalOrientation()
      .yaw.toFixed(2)}, Pitch: ${grandChildTransform
      .getGlobalOrientation()
      .pitch.toFixed(2)}, Roll: ${grandChildTransform
      .getGlobalOrientation()
      .roll.toFixed(2)})`,
    20,
    260
  );
  text(
    `GrandChild Local Orientation: (Yaw: ${grandChildTransform.localOrientation.yaw.toFixed(
      2
    )}, Pitch: ${grandChildTransform.localOrientation.pitch.toFixed(
      2
    )}, Roll: ${grandChildTransform.localOrientation.roll.toFixed(2)})`,
    20,
    280
  );

  // GreatGrandChild Transform
  text(
    `GreatGrandChild Global Position: (${greatGrandChildTransform
      .getGlobalPosition()
      .x.toFixed(2)}, ${greatGrandChildTransform
      .getGlobalPosition()
      .y.toFixed(2)}, ${greatGrandChildTransform
      .getGlobalPosition()
      .z.toFixed(2)})`,
    20,
    320
  );
  text(
    `GreatGrandChild Local Position: (${greatGrandChildTransform.localPosition.x.toFixed(
      2
    )}, ${greatGrandChildTransform.localPosition.y.toFixed(
      2
    )}, ${greatGrandChildTransform.localPosition.z.toFixed(2)})`,
    20,
    340
  );
  text(
    `GreatGrandChild Global Orientation: (Yaw: ${greatGrandChildTransform
      .getGlobalOrientation()
      .yaw.toFixed(2)}, Pitch: ${greatGrandChildTransform
      .getGlobalOrientation()
      .pitch.toFixed(2)}, Roll: ${greatGrandChildTransform
      .getGlobalOrientation()
      .roll.toFixed(2)})`,
    20,
    360
  );
  text(
    `GreatGrandChild Local Orientation: (Yaw: ${greatGrandChildTransform.localOrientation.yaw.toFixed(
      2
    )}, Pitch: ${greatGrandChildTransform.localOrientation.pitch.toFixed(
      2
    )}, Roll: ${greatGrandChildTransform.localOrientation.roll.toFixed(2)})`,
    20,
    380
  );
}
