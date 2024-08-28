/**
 * Class responsible for rendering agents in a 2D environment using p5.js.
 * The Render2Dp5 class visualizes various attributes of agents, such as position,
 * orientation, actions, target positions, velocities, and motion profiles.
 */
export class Render2Dp5 {
  /**
   * Creates an instance of Render2Dp5.
   * @param {Object} environment - The environment object containing agents to be rendered.
   */
  constructor(environment) {
    this.environment = environment;

    // Flags to control what is drawn
    /** @type {boolean} Whether to show the orientation vector of each agent. */
    this.showOrientation = true;
    /** @type {boolean} Whether to display the current action of each agent. */
    this.showAction = true;
    /** @type {boolean} Whether to display the target position of each agent. */
    this.showTargetPosition = true;
    /** @type {boolean} Whether to display the current acceleration of each agent. */
    this.showAcceleration = true;
    /** @type {boolean} Whether to display the current velocity of each agent. */
    this.showVelocity = true;
    /** @type {boolean} Whether to display the entire motion profile of each agent. */
    this.showMotionProfile = false;
    /** @type {boolean} Whether to display the basic statistics of the motion profile. */
    this.showProfileBasics = false;
  }

  /**
   * Renders all agents in the environment.
   * For each agent, various attributes are drawn based on the flags set in the constructor.
   */
  render() {
    this.environment.agents.forEach((agent) => {
      // Retrieve the position and orientation vector from the agent
      const position = agent.getPosition();
      const posX = position.x;
      const posY = position.y;
      const orientation = agent.getOrientation();
      const diameter = 80;

      // Draw the agent's position (as a circle)
      stroke(0);
      fill(255, 0, 0);
      ellipse(posX, posY, diameter, diameter);

      // Draw the agent's orientation vector (as a line from the agent's position)
      const arrowSize = diameter / 4;
      push();
      translate(posX, posY);
      rotate(orientation.heading());
      line(0, 0, arrowSize * 2, 0);
      line(arrowSize * 2, 0, arrowSize, arrowSize / 2);
      line(arrowSize * 2, 0, arrowSize, -arrowSize / 2);
      pop();

      if (this.showOrientation) {
        // Draw the HorizontalControlSubsystem position text
        fill(0);
        noStroke();
        textAlign(CENTER);
        text(
          `Orientation: ${agent.HorizontalControlSubsystem.sensePosition().toFixed(
            2
          )}`,
          posX,
          posY - diameter / 1.5
        );
      }

      // Retrieve the current state of the HorizontalControlSubsystem
      const currentProfile = agent.HorizontalControlSubsystem.motionProfile;
      if (!currentProfile || currentProfile.profile.length === 0) {
        // Handle missing or empty profile case
      } else {
        const currentProfileIndex =
          agent.HorizontalControlSubsystem.currentProfileIndex;
        const currentProfilePoint =
          currentProfile.profile[currentProfileIndex] || {};

        const currentAcceleration =
          currentProfilePoint.acceleration?.toFixed(2) || "N/A";
        const currentVelocity =
          currentProfilePoint.velocity?.toFixed(2) || "N/A";

        // Draw the agent name, current action, target position, current acceleration, and current velocity
        fill(0);
        noStroke();
        textAlign(LEFT);
        text(`${agent.name}`, posX - 10, posY + 30);

        if (this.showAction) {
          text(
            `Action: ${agent.HorizontalControlSubsystem.currentMotionRequest}`,
            posX - 10,
            posY + 45
          );
        }

        if (this.showTargetPosition) {
          text(
            `Target: ${
              agent.HorizontalControlSubsystem.targetPosition?.toFixed(2) ||
              "N/A"
            }`,
            posX - 10,
            posY + 60
          );
        }

        if (this.showAcceleration) {
          text(`Acceleration: ${currentAcceleration}`, posX - 10, posY + 75);
        }

        if (this.showVelocity) {
          text(`Velocity: ${currentVelocity}`, posX - 10, posY + 90);
        }

        if (this.showMotionProfile) {
          // Draw the motion profile
          this.drawMotionProfile(currentProfile);
        }

        if (this.showProfileBasics) {
          // Print the profile basics using the toString method
          this.printProfileBasics(currentProfile.toString());
        }
      }
    });
  }

  /**
   * Draws the motion profile of an agent on the canvas.
   * The motion profile is represented as a line graph.
   * @param {Object} motionProfile - The motion profile object of the agent.
   */
  drawMotionProfile(motionProfile) {
    if (!motionProfile || motionProfile.profile.length === 0) return;

    stroke(0);
    noFill();
    beginShape();

    const minPosition = motionProfile.profile_minPosition;
    const maxPosition = motionProfile.profile_maxPosition;

    // Draw the profile points
    for (let i = 0; i < motionProfile.profile.length; i += 10) {
      let x = map(i, 0, motionProfile.profile.length, 0, width);
      let y = map(
        motionProfile.profile[i].position,
        minPosition,
        maxPosition,
        height,
        0
      ); // Using position as y-coordinate
      vertex(x, y);
    }
    endShape();

    // Display the length of the profile
    fill(0);
    noStroke();
    textAlign(RIGHT);
    text(
      `Profile Length: ${motionProfile.profile.length}`,
      width - 10,
      height - 10
    );
  }

  /**
   * Prints the basic statistics of the motion profile on the canvas.
   * @param {string} profileString - The string representation of the motion profile.
   */
  printProfileBasics(profileString) {
    fill(0);
    noStroke();
    textAlign(LEFT);
    textSize(12);

    const profileLines = profileString.split("\n");
    let yOffset = 20; // Start offset for printing profile basics
    profileLines.forEach((line, index) => {
      text(line, 10, yOffset + index * 15);
    });
  }
}
