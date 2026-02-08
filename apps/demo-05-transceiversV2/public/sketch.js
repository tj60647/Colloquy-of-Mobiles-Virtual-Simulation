//import classes
import { Transform } from '../lib/Transform.js';
import { LightActuator } from '../lib/LightActuator.js';
import { SoundActuator } from '../lib/SoundActuator.js';
import { LightSensor } from '../lib/LightSensor.js';
import { SoundSensor } from '../lib/SoundSensor.js';

// Attach the functions to the window object
window.setup = setup;
window.draw = draw;

/**
 * Abstract Actor class for the actor model.
 */
class Actor {
  constructor() {
    if (this.constructor === Actor) {
      throw new Error('Cannot instantiate abstract class Actor directly.');
    }
  }

  send(message, target) {
    if (target && target.receive) {
      target.receive(message, this);
    }
  }

  receive(message, sender) {
    throw new Error('receive() must be implemented in a subclass.');
  }
}

/**
 * PulseTransmitter class for sending light or sound pulses.
 */
class PulseTransmitter extends Actor {
  constructor(bufferSize, type, actuator, pattern) {
    super();
    this.bufferSize = bufferSize;
    this.type = type; // Type of pulse, e.g., 'sound' or 'light'
    this.actuator = actuator; // Actuator object for emitting pulses
    this.pattern = pattern; // Pattern to transmit
    this.patternIndex = 0; // Index for the current pattern step
  }

  sendPulse(environment, sourceId, strength, frequency = null) {
    const content = this.pattern[this.patternIndex]; // Get the current pulse from the pattern

    const message = new Message(
      this.type,
      content,
      sourceId,
      this.actuator.getGlobalPosition(),
      this.actuator.getGlobalForwardVector(),
      strength,
      millis(),
      this.actuator.fieldOfView,
      frequency
    );

    this.patternIndex = (this.patternIndex + 1) % this.pattern.length; // Move to the next pulse in the pattern

    // Send the message to the environment
    this.send(message, environment);
  }
}

/**
 * PulseReceiver class for receiving light or sound pulses.
 */
class PulseReceiver extends Actor {
  constructor(bufferSize, sampleRate, patterns, type, sensor, agent) {
    super();
    this.buffer = new Array(bufferSize).fill(0);
    this.bufferSize = bufferSize;
    this.sampleRate = sampleRate;
    this.patterns = patterns;
    this.type = type; // Type of pulse the receiver is sensitive to, e.g., 'sound' or 'light'
    this.sensor = sensor; // Sensor object for receiving pulses
    this.bufferIndex = 0; // Circular buffer index
    this.agent = agent; // Reference to the agent this receiver belongs to
  }

  receive(message, sender) {
    if (message.type === this.type && !this.agent.isTransmitting) {
      // Add the content of the message to the buffer at the current index
      this.buffer[this.bufferIndex] += message.content;
    }

    this.processPulse();
  }

  nextCycle() {
    // Move to the next buffer index and reset it for the next cycle
    this.bufferIndex = (this.bufferIndex + 1) % this.bufferSize;
    this.buffer[this.bufferIndex] = 0; // Reset the buffer value at the new index
  }

  processPulse() {
    // Process the buffer based on the current state
    for (const patternName in this.patterns) {
      if (this.matchesPattern(this.patterns[patternName])) {
        //console.log(`Matched pattern: ${patternName}`);
        this.onPatternMatched(patternName);
      }
    }
  }

  matchesPattern(pattern) {
    if (this.buffer.length < pattern.length) {
      return false;
    }

    for (let i = 0; i < pattern.length; i++) {
      const bufferValue = this.buffer[(this.bufferIndex + i) % this.bufferSize];
      if (bufferValue !== pattern[i]) {
        return false;
      }
    }

    return true;
  }

  onPatternMatched(patternName) {
    // fill(255);
    // textSize(16);
    // text(`Pattern Matched: ${patternName}`, 10, 30 + 20 * Object.keys(this.patterns).indexOf(patternName));
  }
}

/**
 * Agent class representing an autonomous robot.
 */
class Agent {
  constructor(id, position, direction, patterns) {
    this.id = id;
    this.position = position;
    this.direction = direction;
    this.isTransmitting = false; // Flag to check if the agent is transmitting

    const randomPatternKey = random(Object.keys(patterns));
    const randomPattern = patterns[randomPatternKey];
    const fixedPattern = patterns[0];

    this.transform = new Transform(null, position, direction, `Agent_${id}`);
    this.lightActuator = new LightActuator(
      this.transform,
      { x: 0, y: 0, z: 0 },
      { yaw: 0, pitch: 0, roll: 0 },
      30
    );
    this.soundActuator = new SoundActuator(
      this.transform,
      { x: 0, y: 0, z: 0 },
      { yaw: 0, pitch: 0, roll: 0 },
      30
    );

    this.lightTransmitter = new PulseTransmitter(40, 'light', this.lightActuator, randomPattern);
    this.soundTransmitter = new PulseTransmitter(40, 'sound', this.soundActuator, randomPattern);

    this.lightSensor = new LightSensor(
      this.transform,
      { x: 0, y: 0, z: 0 },
      { yaw: 0, pitch: 0, roll: 0 },
      30
    );
    this.soundSensor = new SoundSensor(
      this.transform,
      { x: 0, y: 0, z: 0 },
      { yaw: 0, pitch: 0, roll: 0 },
      30
    );

    this.lightReceiver = new PulseReceiver(40, 20, patterns, 'light', this.lightSensor, this);
    this.soundReceiver = new PulseReceiver(40, 20, patterns, 'sound', this.soundSensor, this);
  }

  act(environment) {
    this.isTransmitting = true; // Set flag to true when transmitting

    if (this.id === 'Agent1') {
      // Only Agent 1 transmits light
      this.lightTransmitter.sendPulse(environment, `${this.id}_lightTransmitter`, 0.9);
    }

    // this.soundTransmitter.sendPulse(
    //   environment,
    //   `${this.id}_soundTransmitter`,
    //   0.9,
    //   440 // Frequency for sound
    // );

    this.isTransmitting = false; // Reset flag after transmission
  }
}

/**
 * Environment class for managing agents and pulse propagation.
 */
class Environment extends Actor {
  constructor() {
    super();
    this.agents = [];
  }

  registerAgent(agent) {
    this.agents.push(agent);
  }

  receive(message, sender) {
    this.forwardPulse(message);
  }

  forwardPulse(message) {
    this.agents.forEach((agent) => {
      agent.lightReceiver.receive(message, null);
      agent.soundReceiver.receive(message, null);
    });
  }

  nextCycle() {
    // Prepare receivers for the next cycle
    this.agents.forEach((agent) => {
      agent.lightReceiver.nextCycle();
      agent.soundReceiver.nextCycle();
    });
  }
}

/**
 * Renderer class for visualizing the environment and agents.
 */
class Renderer {
  constructor(environment) {
    this.environment = environment;
  }

  drawBuffers() {
    const xOffset = 10;
    const yOffsetStart = 50;
    const yOffsetStep = 30;
    const cellSize = 5;
    const bufferSpacing = 150; // Adjust spacing between agents

    this.environment.agents.forEach((agent, agentIndex) => {
      const yOffset = yOffsetStart + agentIndex * bufferSpacing;

      // Calculate width of the buffer area
      const bufferWidth = agent.lightTransmitter.bufferSize * cellSize + 2 * xOffset;
      const bufferHeight = 4 * yOffsetStep + 20; // Adjust for four buffers

      // Draw a rectangle around the buffers for each agent
      stroke(255);
      noFill();
      rect(xOffset - 5, yOffset - 30, bufferWidth, bufferHeight);

      // Draw Light Transmitter Buffer
      fill(255);
      noStroke();
      text(`Agent ${agentIndex + 1} Light TX:`, xOffset, yOffset);
      strokeWeight(1);
      stroke(128);
      for (let i = 0; i < agent.lightTransmitter.bufferSize; i++) {
        const value =
          agent.lightTransmitter.pattern[
            (agent.lightTransmitter.patternIndex - 1 - i + agent.lightTransmitter.pattern.length) %
              agent.lightTransmitter.pattern.length
          ];
        fill(value === 1 ? 255 : 0);
        rect(xOffset + i * cellSize, yOffset + 10, cellSize, cellSize);
      }

      // Draw Sound Transmitter Buffer
      fill(255);
      noStroke();
      text(`Agent ${agentIndex + 1} Sound TX:`, xOffset, yOffset + yOffsetStep);
      strokeWeight(1);
      stroke(128);
      for (let i = 0; i < agent.soundTransmitter.bufferSize; i++) {
        const value =
          agent.soundTransmitter.pattern[
            (agent.soundTransmitter.patternIndex - 1 - i + agent.soundTransmitter.pattern.length) %
              agent.soundTransmitter.pattern.length
          ];
        fill(value === 1 ? 255 : 0);
        rect(xOffset + i * cellSize, yOffset + 10 + yOffsetStep, cellSize, cellSize);
      }

      // Draw Light Receiver Buffer
      fill(255);
      noStroke();
      text(`Agent ${agentIndex + 1} Light RX:`, xOffset, yOffset + yOffsetStep * 2);
      strokeWeight(1);
      stroke(128);
      for (let i = 0; i < agent.lightReceiver.buffer.length; i++) {
        const index =
          (agent.lightReceiver.bufferIndex - 1 - i + agent.lightReceiver.bufferSize) %
          agent.lightReceiver.bufferSize;
        if (agent.lightReceiver.buffer[index] === 1) {
          fill(255, 255, 0);
        } else {
          fill(64);
        }
        rect(xOffset + i * cellSize, yOffset + 10 + yOffsetStep * 2, cellSize, cellSize);
      }

      // Draw Sound Receiver Buffer
      fill(255);
      noStroke();
      text(`Agent ${agentIndex + 1} Sound RX:`, xOffset, yOffset + yOffsetStep * 3);
      strokeWeight(1);
      stroke(128);
      for (let i = 0; i < agent.soundReceiver.buffer.length; i++) {
        const index =
          (agent.soundReceiver.bufferIndex - 1 - i + agent.soundReceiver.bufferSize) %
          agent.soundReceiver.bufferSize;
        if (agent.soundReceiver.buffer[index] === 1) {
          fill(0, 0, 255);
        } else {
          fill(64);
        }
        rect(xOffset + i * cellSize, yOffset + 10 + yOffsetStep * 3, cellSize, cellSize);
      }
    });
  }
}

/**
 * Message class for encapsulating pulse data.
 */
class Message {
  constructor(
    type,
    content,
    sourceId,
    sourcePosition,
    sourceVector,
    strength,
    timestamp,
    fieldOfView,
    frequency = null
  ) {
    this.type = type; // Type of pulse, e.g., 'sound' or 'light'
    this.content = content; // The actual pulse data being transmitted
    this.sourceId = sourceId; // Identifier for the transmitting entity
    this.sourcePosition = sourcePosition; // Position of the transmitter
    this.sourceVector = sourceVector; // Direction in which the message is sent
    this.strength = strength; // Signal strength
    this.timestamp = timestamp; // Time at which the message was sent
    this.fieldOfView = fieldOfView; // The angular spread of the signal
    this.frequency = frequency; // Optional frequency of the signal
  }
}

const patterns = {
  I_O: [
    1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1,
  ],
  I_P: [
    1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 0, 0, 0, 0,
  ],
  I_OP: [
    1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1,
    0, 0, 0, 0, 1, 1, 1, 1,
  ],
  II_O: [
    1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 0, 0,
  ],
  II_P: [
    1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 1, 1, 1,
  ],
  II_OP: [
    1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0,
    1, 1, 1, 1, 0, 0, 0, 0,
  ],
  I_R: [
    1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 1, 1, 1, 1,
  ],
  II_R: [
    1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
  ],
  E: [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1,
  ],
  rejection: [
    1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0,
    1, 1, 1, 1, 0, 0, 0, 0,
  ],
};

let environment;
let renderer;

function setup() {
  createCanvas(800, 800); // Increased canvas size for better spacing

  environment = new Environment();

  const agent1 = new Agent('Agent1', createVector(100, 200, 0), createVector(1, 0, 0), patterns);
  agent1.lightTransmitter.pattern = patterns['II_P'];

  const agent2 = new Agent('Agent2', createVector(300, 200, 0), createVector(-1, 0, 0), patterns);
  const agent3 = new Agent('Agent3', createVector(200, 300, 0), createVector(0, 1, 0), patterns);

  environment.registerAgent(agent1);
  environment.registerAgent(agent2);
  environment.registerAgent(agent3);

  renderer = new Renderer(environment);

  frameRate(20); // 20 frames per second, corresponding to a 50ms interval
}

function draw() {
  background(0);

  // Start the new cycle
  environment.nextCycle();

  // Each agent acts in the environment
  environment.agents[0].act(environment);

  // Each agent acts in the environment
  // environment.agents.forEach(agent => {
  //   agent.act(environment);
  // });

  // Draw buffers using the Renderer
  renderer.drawBuffers();
}
