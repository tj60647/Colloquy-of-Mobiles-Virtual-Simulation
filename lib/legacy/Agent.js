import { HorizontalControlSubsystem as Oscillator } from './HorizontalControlSubsystem.js';

export class Agent {
  constructor(name, frameRate, x = 0, y = 0, z = 0, initialRotationX = 0) {
    // Log initial values to the console
    //console.log(`Initializing Agent with name: ${name}`);
    //console.log(`Initial position: x=${x}, y=${y}, z=${z}`);
    //console.log(`Frame rate: ${frameRate}`);
    //console.log(`Initial rotation around the X-axis: ${initialRotationX} degrees`);

    // Assign values
    this.name = name;
    this.position = createVector(x, y, z); // Use a vector for position

    // Set the initial orientation based on the initialRotationX (rotation around the x-axis in degrees)
    this.initialRotationRadians = radians(initialRotationX); // Store the initial orientation in radians
    this.orientation = createVector(1, 0, 0).rotate(this.initialRotationRadians); // Apply initial rotation

    // Initialize the Horizontal Control Subsystem (Oscillator)
    this.HorizontalControlSubsystem = new Oscillator(-60, 60, 0, 1.0, frameRate); // Define min, max, and reinforcement positions

    //console.log(`HorizontalControlSubsystem initialized with maxVelocity: ${this.HorizontalControlSubsystem.maxVelocity}, maxAcceleration: ${this.HorizontalControlSubsystem.maxAcceleration}`);
  }

  setMotionRequest(action) {
    //console.log(`Motion request set to: ${action}`);
    this.HorizontalControlSubsystem.setMotion(action);
  }

  update() {
    //console.log('Updating agent...');
    this.HorizontalControlSubsystem.act();
    this.updateOrientationBasedOnSubsystem(); // Update orientation based on HorizontalControlSubsystem
    //console.log(`Updated orientation vector: ${this.orientation}`);
  }

  updateOrientationBasedOnSubsystem() {
    // Use the HorizontalControlSubsystem's position as the additional angle in degrees
    const additionalAngleInDegrees = this.HorizontalControlSubsystem.sensePosition();
    const additionalAngleInRadians = radians(additionalAngleInDegrees); // Convert degrees to radians

    // Combine the initial orientation with the oscillator's output
    const combinedAngle = this.initialRotationRadians + additionalAngleInRadians;

    // Update the orientation vector based on the combined angle
    this.orientation = p5.Vector.fromAngle(combinedAngle);
    //console.log(`Orientation updated to: ${this.orientation} (Initial: ${this.initialRotationRadians}, Oscillator: ${additionalAngleInRadians})`);
  }

  render() {
    push(); // Save the current transformation matrix

    // Translate to the agent's position
    translate(this.position.x, this.position.y);

    // Rotate the agent based on its orientation
    const angleInRadians = atan2(this.orientation.y, this.orientation.x);
    rotate(angleInRadians);

    // Draw the agent (centered at its local origin)
    this.drawAgent();

    pop(); // Restore the previous transformation matrix
    //console.log('Agent rendered.');
  }

  drawAgent() {
    // Draw the agent as a triangle pointing forward
    fill(255, 0, 0);
    noStroke();
    beginShape();
    vertex(10, 0); // Tip of the triangle
    vertex(-10, 5); // Bottom left of the triangle
    vertex(-10, -5); // Bottom right of the triangle
    endShape(CLOSE);
    //console.log('Agent shape drawn.');
  }

  getPosition() {
    return this.position;
  }

  setPosition(position) {
    //console.log(`Position set to: ${position}`);
    this.position = position;
  }

  getOrientation() {
    return this.orientation;
  }

  setOrientation(orientation) {
    //console.log(`Orientation set to: ${orientation}`);
    this.orientation = orientation;
  }
}
