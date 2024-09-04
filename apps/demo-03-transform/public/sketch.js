import { Transform } from "../lib/Transform.js";

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
const rotationSpeed = 0.5; // Speed of rotation in degrees per frame

/**
 * Setup function for p5.js sketch.
 * Initializes a hierarchy of Transform objects, sets up the canvas in WEBGL mode, and initializes EasyCam for interactive 3D navigation.
 * Also sets up a HUD for displaying statistics about the transforms.
 */
function preload() {
  easyFont = loadFont("roboto-regular-webfont.ttf"); // Load font for text rendering
}

function setup() {
  createCanvas(600, 600, WEBGL);
  easycam = createEasyCam(); // Initialize EasyCam for interactive 3D view control
  document.oncontextmenu = () => false; // Disable right-click context menu to prevent interference with EasyCam

  textFont(easyFont); // Use the loaded font after creating canvas

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
    { x: 0, y: 50, z: 0 },
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

  // Increment the roll of each transform to rotate around the Z-axis
  //rotateTransform(rootTransform);
  rotateTransform(childTransform);
  // rotateTransform(grandChildTransform);
  // rotateTransform(greatGrandChildTransform);

  // Draw transforms in hierarchical order
  drawTransform(rootTransform);
  drawTransform(childTransform);
  drawTransform(grandChildTransform);
  //drawTransform(greatGrandChildTransform);

  // Draw HUD with statistics
  easycam.beginHUD();
  drawHUD();
  easycam.endHUD();
}

/**
 * Rotates a transform around its local Z-axis by incrementing its roll.
 * @param {Transform} transform - The Transform object to rotate.
 */
function rotateTransform(transform) {
  transform.roll += rotationSpeed; // Increment the roll angle by a small amount
  // Reset the roll angle to 0 if it exceeds 360 degrees
  if (transform.roll >= 360) {
    transform.roll = transform.roll - 360;
  }
}

/**
 * Draws a transform and its children in 3D space.
 * The transform is visualized as a sphere, and the axes are colored lines.
 * This function is recursive to handle hierarchical drawing.
 * @param {Transform} transform - The Transform object to draw.
 */
function drawTransform(transform) {
  push(); // Save the current transformation state

  // Get global position and orientation
  const pos = transform.getGlobalPosition();
  const ori = transform.getGlobalOrientation();

  // Move to the transform's global position
  translate(pos.x, pos.y, pos.z);

  // Apply orientation to the local axes
  rotateZ(radians(ori.roll));
  rotateX(radians(ori.pitch));
  rotateY(radians(-ori.yaw));

  // Draw the transform as a small sphere
  fill(128, 0, 0); // Red color for the sphere
  sphere(2); // Sphere size

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

  // // Recursively draw child transforms
  // for (let child of [
  //   childTransform,
  //   grandChildTransform,
  //   greatGrandChildTransform,
  // ]) {
  //   if (child.parent === transform) {
  //     drawTransform(child); // Recursively draw the child transform
  //   }
  // }

  pop(); // Restore the previous transformation state
}

/**
 * Draws the HUD with statistics about each transform.
 * The HUD displays the global and local positions and orientations of the root, child, grandchild, and great-grandchild transforms.
 */
function drawHUD() {
  fill(0);
  textSize(10);
  textAlign(LEFT, TOP);

  // Helper function to get formatted position and orientation data
  function formatPositionAndOrientation(transform) {
    const globalPos = transform.getGlobalPosition();
    const globalOri = transform.getGlobalOrientation();
    return {
      globalPos: `(${globalPos.x.toFixed(2)}, ${globalPos.y.toFixed(
        2
      )}, ${globalPos.z.toFixed(2)})`,
      localPos: `(${transform.x.toFixed(2)}, ${transform.y.toFixed(
        2
      )}, ${transform.z.toFixed(2)})`,
      globalOri: `(Yaw: ${globalOri.yaw.toFixed(
        2
      )}, Pitch: ${globalOri.pitch.toFixed(2)}, Roll: ${globalOri.roll.toFixed(
        2
      )})`,
      localOri: `(Yaw: ${transform.yaw.toFixed(
        2
      )}, Pitch: ${transform.pitch.toFixed(2)}, Roll: ${transform.roll.toFixed(
        2
      )})`,
    };
  }

  // Draw information for each transform
  const transforms = [
    {
      name: "Root",
      data: formatPositionAndOrientation(rootTransform),
      yOffset: 20,
    },
    {
      name: "Child",
      data: formatPositionAndOrientation(childTransform),
      yOffset: 120,
    },
    {
      name: "GrandChild",
      data: formatPositionAndOrientation(grandChildTransform),
      yOffset: 220,
    },
    {
      name: "GreatGrandChild",
      data: formatPositionAndOrientation(greatGrandChildTransform),
      yOffset: 320,
    },
  ];

  transforms.forEach((t) => {
    text(`${t.name} Global Position: ${t.data.globalPos}`, 20, t.yOffset);
    text(`${t.name} Local Position: ${t.data.localPos}`, 20, t.yOffset + 20);
    text(
      `${t.name} Global Orientation: ${t.data.globalOri}`,
      20,
      t.yOffset + 40
    );
    text(`${t.name} Local Orientation: ${t.data.localOri}`, 20, t.yOffset + 60);
  });
}
