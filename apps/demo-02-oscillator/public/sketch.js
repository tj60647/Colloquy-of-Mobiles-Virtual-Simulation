import { Agent } from '../lib/Agent.js';
import { Environment } from '../lib/Environment.js';
import { Render2Dp5 } from '../lib/Render2Dp5.js';
import { DebugUtility } from '../lib/DebugUtility.js';
import { MotionRequest } from '../lib/Oscillator.js';

//console.log("Sketch starting..."); // Should appear in the console immediately

// Attach the functions to the window object
window.setup = setup;
window.draw = draw;
window.mouseReleased = mouseReleased;

let environment;
let renderer;
let agent1;

let releaseButton, stopButton;

function setup() {
  createCanvas(800, 800);
  frameRate(60);

  // Ensure the constructor runs to initialize the static property
  new DebugUtility();
  // Initialize the debug listener
  DebugUtility.addToggleDebugListener();

  environment = new Environment();
  renderer = new Render2Dp5(environment);

  const centerX = width / 2;
  const centerY = height / 2;
  const diameter = 400;
  const numPoints = 3;

  for (let i = 0; i < numPoints; i++) {
    let pointData = getPointOnCircle(diameter, numPoints, i, centerX, centerY);
    let agent = new Agent(
      `Agent ${i + 1}`,
      60,
      pointData.x,
      pointData.y,
      0,
      pointData.orientation + 180
    );
    agent.HorizontalControlSubsystem.minPosition = -45;
    agent.HorizontalControlSubsystem.maxPosition = 45;
    agent.HorizontalControlSubsystem.reinforcementPosition = 0;
    agent.HorizontalControlSubsystem.maxVelocity = 15;
    agent.HorizontalControlSubsystem.maxAcceleration = 15;
    agent.setMotionRequest(MotionRequest.RELEASE);
    environment.addAgent(agent);
  }

  let agent = new Agent(`Agent Beam`, 60, centerX, centerY, 0, 0);
  agent.HorizontalControlSubsystem.minPosition = -180;
  agent.HorizontalControlSubsystem.maxPosition = 180;
  agent.HorizontalControlSubsystem.reinforcementPosition = 0;
  agent.HorizontalControlSubsystem.maxVelocity = 10;
  agent.HorizontalControlSubsystem.maxAcceleration = 10;
  agent.setMotionRequest(MotionRequest.RELEASE);
  environment.addAgent(agent);

  agent1 = agent;

  // Define button dimensions and positions
  releaseButton = {
    x: 10,
    y: 800 - 50,
    width: 80,
    height: 30,
    label: 'Release',
  };
  stopButton = { x: 100, y: 800 - 50, width: 80, height: 30, label: 'Stop' };
}

function draw() {
  background(220);

  // Update environment
  environment.update();

  // Render environment
  renderer.render();

  // Draw buttons
  drawButton(releaseButton);
  drawButton(stopButton);
}

function drawButton(button) {
  //console.log(`Drawing button ${button.label} at (${button.x}, ${button.y})`);

  // Change color on mouse over
  if (isMouseOverButton(button)) {
    fill(170); // Darker gray on hover
    //console.log(`Mouse is over button ${button.label}`);
  } else {
    fill(200); // Light gray
  }

  rect(button.x, button.y, button.width, button.height);

  fill(0);
  textAlign(CENTER, CENTER);
  text(button.label, button.x + button.width / 2, button.y + button.height / 2);
}

function isMouseOverButton(button) {
  const isOver =
    mouseX > button.x &&
    mouseX < button.x + button.width &&
    mouseY > button.y &&
    mouseY < button.y + button.height;
  //console.log(`Checking mouse over button ${button.label}: ${isOver}`);
  return isOver;
}
// function for mouse released

function mouseReleased() {
  // Check if release button is pressed
  if (isMouseOverButton(releaseButton)) {
    //console.log("Release button released");
    agent1.setMotionRequest(MotionRequest.RELEASE);
  }

  // Check if stop button is pressed
  if (isMouseOverButton(stopButton)) {
    //console.log("Stop button released");
    agent1.setMotionRequest(MotionRequest.STOP);
  }
}

function getPointOnCircle(diameter, numPoints, pointIndex, centerX, centerY) {
  // Calculate the angle between each point on the circle
  const angleBetweenPoints = TWO_PI / numPoints;

  // Calculate the angle for the specific point
  const angle = pointIndex * angleBetweenPoints;

  // Calculate the x, y coordinates of the point on the circle
  const x = centerX + (diameter / 2) * cos(angle);
  const y = centerY + (diameter / 2) * sin(angle);

  // Return the position and orientation (angle) in degrees
  return {
    x: x,
    y: y,
    orientation: degrees(angle),
  };
}
