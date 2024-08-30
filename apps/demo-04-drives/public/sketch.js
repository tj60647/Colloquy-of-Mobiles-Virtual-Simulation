//import classes
import { Agent_DriveManager } from "../lib/Agent_DriveManager.js";

// Attach the functions to the window object
window.setup = setup;
window.draw = draw;

let agents = [];

function setup() {
  createCanvas(1200, 1200);

  // Create 5 agents at different positions
  agents.push(new Agent_DriveManager(50, 50, 250));
  agents.push(new Agent_DriveManager(400, 50, 250));
  agents.push(new Agent_DriveManager(750, 50, 250));
  agents.push(new Agent_DriveManager(50, 400, 250));
  agents.push(new Agent_DriveManager(400, 400, 250));
}

function draw() {
  background(255);

  // Render all agents
  for (let agent of agents) {
    agent.render();
  }
}
