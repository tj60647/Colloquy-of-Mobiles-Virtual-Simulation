//import classes
import { DriveSubsystem as DriveManager, LegacyDriveState as DriveState } from './DriveSubsystem.js';

/**
 * Class representing the visualization of a DriveManager.
 * The DriveVisualization class provides a visual representation of the states and values
 * of two drives managed by a DriveManager. It displays the drives' history,
 * their operational zones, and highlights their current state on a 2D grid.
 * The visualization is customizable by setting the position and size of the rendered square.
 * Additionally, it optimizes rendering by caching static elements like gridlines and axis labels.
 */
export class DriveVisualization {
  /**
   * Create a DriveVisualization.
   * @param {DriveManager} driveManager - The DriveManager instance to visualize.
   * @param {number} x - The x-coordinate for the visualization's position.
   * @param {number} y - The y-coordinate for the visualization's position.
   * @param {number} size - The size of the square visualization.
   */
  constructor(driveManager, x, y, size) {
    this.driveManager = driveManager;
    this.x = x;
    this.y = y;
    this.size = size;
    this.staticImage = null; // To store the pre-rendered image of static elements
  }

  /**
   * Static method to get the color based on drive state.
   * This method maps specific drive states to corresponding colors for visualization purposes.
   * @param {string} driveState - The current drive state.
   * @returns {string} The hex color associated with the given drive state.
   */
  static getDriveStateColor(driveState) {
    const colors = {
      satisfied_and_indifferent: '#7EFF00', // Greenish color
      O_satisfaction_search: '#FF9C20', // Orange color
      P_satisfaction_search: '#B9CC22', // Yellow-green color
      either_O_or_P_satisfaction_search: '#FF4347', // Red color
      grid_line: '#808080', // Grey color for grid lines
      unknown: '#646464', // Grey color for unknown states
    };
    return colors[driveState] || colors.unknown; // Return the color or default to 'unknown'
  }

  /**
   * Main render function that draws the visualization.
   * This function is responsible for rendering the grid, drive zones,
   * and the drive history on the canvas. Static elements such as the grid and axis labels
   * are pre-rendered and cached to optimize performance.
   */
  render() {
    push();
    translate(this.x, this.y + this.size);
    scale(1, -1);

    // Draw a rectangle around the visualization
    noFill();
    stroke(0); // Set the stroke color to black or any other desired color
    strokeWeight(1); // Set the thickness of the rectangle border
    rect(0, 0, this.size, this.size); // Draw the rectangle

    rect(-30, -30, this.size + 60, this.size + 70); // Draw the rectangle

    if (!this.staticImage) {
      this.staticImage = this.createStaticImage(); // Create and cache the static image
    }

    image(this.staticImage, 0, 0); // Draw the cached static image

    this.renderAxisLabels(); // Render axis labels directly on the canvas
    this.renderDriveLimitLabels(); // Render drive limit labels directly on the canvas
    this.renderCurrentDriveLines();
    this.renderDriveHistory();

    this.renderDriveStateLabel();

    pop();
  }

  /**
   * Creates an off-screen graphics buffer containing static elements like grid lines and zones.
   * This method draws the background grid, colors the zones based on the operational limits of the drives,
   * and caches these elements to improve performance by avoiding redundant rendering.
   * @returns {p5.Graphics} The graphics buffer containing the static elements.
   */
  createStaticImage() {
    let pg = createGraphics(this.size, this.size);
    pg.push();

    pg.noStroke();

    let viz_x = 0;
    let viz_y = 0;
    let viz_width = this.size;
    let viz_height = this.size;

    // Map drive limits to the section's coordinates
    let O_floorX = map(
      this.driveManager.ODriveFloor,
      this.driveManager.ODriveFloor,
      this.driveManager.ODriveMax,
      viz_x,
      viz_x + viz_width
    );
    let O_lowerLimitX = map(
      this.driveManager.ODriveLowerLimit,
      this.driveManager.ODriveFloor,
      this.driveManager.ODriveMax,
      viz_x,
      viz_x + viz_width
    );
    let O_upperLimitX = map(
      this.driveManager.ODriveUpperLimit,
      this.driveManager.ODriveFloor,
      this.driveManager.ODriveMax,
      viz_x,
      viz_x + viz_width
    );
    let O_MAXX = map(
      this.driveManager.ODriveMax,
      this.driveManager.ODriveFloor,
      this.driveManager.ODriveMax,
      viz_x,
      viz_x + viz_width
    );

    let P_floorY = map(
      this.driveManager.PDriveFloor,
      this.driveManager.PDriveFloor,
      this.driveManager.PDriveMax,
      viz_y,
      viz_y + viz_height
    );
    let P_lowerLimitY = map(
      this.driveManager.PDriveLowerLimit,
      this.driveManager.PDriveFloor,
      this.driveManager.PDriveMax,
      viz_y,
      viz_y + viz_height
    );
    let P_upperLimitY = map(
      this.driveManager.PDriveUpperLimit,
      this.driveManager.PDriveFloor,
      this.driveManager.PDriveMax,
      viz_y,
      viz_y + viz_height
    );
    let P_MAXY = map(
      this.driveManager.PDriveMax,
      this.driveManager.PDriveFloor,
      this.driveManager.PDriveMax,
      viz_y,
      viz_y + viz_height
    );

    // Draw the satisfied and indifferent zone
    pg.fill(
      lerpColor(
        this.hexToP5Color(DriveVisualization.getDriveStateColor('satisfied_and_indifferent')),
        color(255),
        0.7
      )
    );
    pg.beginShape();
    pg.vertex(O_floorX, P_floorY);
    pg.vertex(O_lowerLimitX, P_floorY);
    pg.vertex(O_lowerLimitX, P_lowerLimitY);
    pg.vertex(O_floorX, P_lowerLimitY);
    pg.endShape(CLOSE);

    // Draw O satisfaction search zone
    pg.fill(
      lerpColor(
        this.hexToP5Color(DriveVisualization.getDriveStateColor('O_satisfaction_search')),
        color(255),
        0.7
      )
    );
    pg.beginShape();
    pg.vertex(O_lowerLimitX, P_floorY);
    pg.vertex(O_MAXX, P_floorY);
    pg.vertex(O_MAXX, P_upperLimitY);
    pg.vertex(O_upperLimitX, P_upperLimitY);
    pg.vertex(O_lowerLimitX, P_lowerLimitY);
    pg.endShape(CLOSE);

    // Draw P satisfaction search zone
    pg.fill(
      lerpColor(
        this.hexToP5Color(DriveVisualization.getDriveStateColor('P_satisfaction_search')),
        color(255),
        0.7
      )
    );
    pg.beginShape();
    pg.vertex(O_floorX, P_lowerLimitY);
    pg.vertex(O_floorX, P_MAXY);
    pg.vertex(O_upperLimitX, P_MAXY);
    pg.vertex(O_upperLimitX, P_upperLimitY);
    pg.vertex(O_lowerLimitX, P_lowerLimitY);
    pg.endShape(CLOSE);

    // Draw either O or P satisfaction search zone
    pg.fill(
      lerpColor(
        this.hexToP5Color(
          DriveVisualization.getDriveStateColor('either_O_or_P_satisfaction_search')
        ),
        color(255),
        0.7
      )
    );
    pg.beginShape();
    pg.vertex(O_upperLimitX, P_upperLimitY);
    pg.vertex(O_upperLimitX, P_MAXY);
    pg.vertex(O_MAXX, P_MAXY);
    pg.vertex(O_MAXX, P_upperLimitY);
    pg.endShape(CLOSE);

    // Draw limit lines and grid lines
    pg.stroke(this.hexToP5Color(DriveVisualization.getDriveStateColor('grid_line')));
    pg.line(O_lowerLimitX, viz_y, O_lowerLimitX, viz_y + viz_height);
    pg.line(O_upperLimitX, viz_y, O_upperLimitX, viz_y + viz_height);
    pg.line(viz_x, P_lowerLimitY, viz_x + viz_width, P_lowerLimitY);
    pg.line(viz_x, P_upperLimitY, viz_x + viz_width, P_upperLimitY);

    // Draw dashed diagonal line
    pg.drawingContext.setLineDash([5, 5]);
    pg.line(O_lowerLimitX, P_lowerLimitY, O_upperLimitX, P_upperLimitY);
    pg.drawingContext.setLineDash([]);
    pg.pop();

    return pg;
  }

  /**
   * Function to render the grid lines, zones, and axis labels.
   * This method was used to draw the background grid, colors the zones based on the operational limits of the drives,
   * and labels the horizontal and vertical axes with "O Drive" and "P Drive" respectively.
   * It is now integrated within the createStaticImage method for better performance.
   */
  renderGridLines() {
    // This function is no longer called directly since grid lines and zones are now drawn in createStaticImage().
  }

  /**
   * Function to render the labels for the axes.
   * This method draws "O Drive" on the horizontal axis and "P Drive" on the vertical axis.
   */
  renderAxisLabels() {
    push();
    scale(1, -1);

    noStroke();
    fill(0);
    textSize(14); // Set the text size

    // Label for O Drive (horizontal axis)
    textAlign(LEFT, TOP);
    text('O Drive', 0, 12); // Move closer to the origin and graph

    // Label for P Drive (vertical axis)
    textAlign(LEFT, BOTTOM);
    translate(-12, 0); // Adjust position closer to the origin and graph
    rotate(-PI / 2); // Rotate text 90 degrees to display vertically, then flip it
    text('P Drive', 0, 0);

    pop();
  }

  /**
   * Function to render labels for the min (floor), lower limit, upper limit, and max values of O and P drives.
   * These labels are displayed on their respective axes to provide context about the operational ranges.
   */
  renderDriveLimitLabels() {
    push();
    scale(1, -1);
    textSize(10);
    fill(0);
    noStroke();

    // Positions along the O Drive (X-axis)
    const O_positions = [
      {
        value: this.driveManager.ODriveFloor,
        mapFunc: (val) =>
          map(val, this.driveManager.ODriveFloor, this.driveManager.ODriveMax, 0, this.size),
      },
      {
        value: this.driveManager.ODriveLowerLimit,
        mapFunc: (val) =>
          map(val, this.driveManager.ODriveFloor, this.driveManager.ODriveMax, 0, this.size),
      },
      {
        value: this.driveManager.ODriveUpperLimit,
        mapFunc: (val) =>
          map(val, this.driveManager.ODriveFloor, this.driveManager.ODriveMax, 0, this.size),
      },
      {
        value: this.driveManager.ODriveMax,
        mapFunc: (val) =>
          map(val, this.driveManager.ODriveFloor, this.driveManager.ODriveMax, 0, this.size),
      },
    ];

    // Positions along the P Drive (Y-axis)
    const P_positions = [
      {
        value: this.driveManager.PDriveFloor,
        mapFunc: (val) =>
          map(val, this.driveManager.PDriveFloor, this.driveManager.PDriveMax, 0, this.size),
      },
      {
        value: this.driveManager.PDriveLowerLimit,
        mapFunc: (val) =>
          map(val, this.driveManager.PDriveFloor, this.driveManager.PDriveMax, 0, this.size),
      },
      {
        value: this.driveManager.PDriveUpperLimit,
        mapFunc: (val) =>
          map(val, this.driveManager.PDriveFloor, this.driveManager.PDriveMax, 0, this.size),
      },
      {
        value: this.driveManager.PDriveMax,
        mapFunc: (val) =>
          map(val, this.driveManager.PDriveFloor, this.driveManager.PDriveMax, 0, this.size),
      },
    ];

    // Render labels for O Drive (X-axis) at the bottom
    O_positions.forEach((pos) => {
      const x = pos.mapFunc(pos.value);
      textAlign(CENTER, TOP);
      text(`${pos.value}`, x, 1); // Slight offset from the axis
    });

    rotate(-PI / 2); // Rotate text 90 degrees to display vertically, then flip it

    // Render labels for P Drive (Y-axis) on the left
    P_positions.forEach((pos) => {
      const y = pos.mapFunc(pos.value);
      textAlign(CENTER, BOTTOM);
      text(`${pos.value}`, y, -1); // Slight offset from the axis
    });

    pop();
  }

  /**
   * Function to render the drive history as a polyline with each segment colored according to the drive state.
   * This method visualizes the history of drive values over time, with color-coding to indicate different states.
   */
  renderDriveHistory() {
    const history = this.driveManager.getHistory();

    strokeWeight(3);
    noFill();

    for (let i = 0; i < history.length - 1; i++) {
      let x1 = map(
        history[i].O_drive,
        this.driveManager.ODriveFloor,
        this.driveManager.ODriveMax,
        0,
        this.size
      );
      let y1 = map(
        history[i].P_drive,
        this.driveManager.PDriveFloor,
        this.driveManager.PDriveMax,
        0,
        this.size
      );
      let x2 = map(
        history[i + 1].O_drive,
        this.driveManager.ODriveFloor,
        this.driveManager.ODriveMax,
        0,
        this.size
      );
      let y2 = map(
        history[i + 1].P_drive,
        this.driveManager.PDriveFloor,
        this.driveManager.PDriveMax,
        0,
        this.size
      );

      let col = this.hexToP5Color(DriveVisualization.getDriveStateColor(history[i].driveState));
      stroke(col);

      line(x1, y1, x2, y2);
    }

    if (history.length > 0) {
      const recentO = map(
        history[history.length - 1].O_drive,
        this.driveManager.ODriveFloor,
        this.driveManager.ODriveMax,
        0,
        this.size
      );
      const recentP = map(
        history[history.length - 1].P_drive,
        this.driveManager.PDriveFloor,
        this.driveManager.PDriveMax,
        0,
        this.size
      );
      const recentCol = this.hexToP5Color(
        DriveVisualization.getDriveStateColor(history[history.length - 1].driveState)
      );

      fill(recentCol);
      stroke(0);
      ellipse(recentO, recentP, 10, 10);
    }
  }

  /**
   * Function to render black lines corresponding to the current O and P drive values.
   * This method draws horizontal and vertical lines at the current O and P drive values
   * and displays these values on the respective axes.
   */
  renderCurrentDriveLines() {
    const currentO = map(
      this.driveManager.getDriveValues().O_drive,
      this.driveManager.ODriveFloor,
      this.driveManager.ODriveMax,
      0,
      this.size
    );
    const currentP = map(
      this.driveManager.getDriveValues().P_drive,
      this.driveManager.PDriveFloor,
      this.driveManager.PDriveMax,
      0,
      this.size
    );

    strokeCap(SQUARE);
    strokeWeight(5);
    stroke(255);
    line(currentO, 0, currentO, this.size);
    line(0, currentP, this.size, currentP);

    strokeWeight(2);
    // get the O color
    stroke(DriveVisualization.getDriveStateColor(DriveState.O_SATISFACTION_SEARCH));
    line(currentO, 0, currentO, this.size);

    // get the P color
    stroke(DriveVisualization.getDriveStateColor(DriveState.P_SATISFACTION_SEARCH));
    line(0, currentP, this.size, currentP);

    push();
    scale(1, -1);

    noStroke();
    fill(0);

    textAlign(LEFT, CENTER);
    text('P: ' + this.driveManager.getDriveValues().P_drive.toFixed(0), 2, -(currentP + 7));

    textAlign(LEFT, CENTER);
    rotate(-PI / 2);
    text('O: ' + this.driveManager.getDriveValues().O_drive.toFixed(0), 2, currentO - 7);

    pop();
  }

  /**
   * Function to render the current drive state label in the lower left-hand corner.
   * This method displays the label with the current drive state text.
   */
  renderDriveStateLabel() {
    const driveState = this.driveManager.getDriveState();

    push();
    scale(1, -1);

    noStroke();
    fill(0);
    textAlign(LEFT, BOTTOM);
    textSize(12);

    text(`State: ${driveState}`, 0, -(this.size + 15));

    pop();
  }

  /**
   * Helper function to convert hex color to p5.js color object.
   * This utility function is used to convert color codes from hex format to p5.js color objects.
   * @param {string} hex - The hex color string.
   * @returns {p5.Color} The p5.js color object.
   */
  hexToP5Color(hex) {
    return color(hex);
  }

  /**
   * Convert the current state of the DriveVisualization to a JSON object.
   * This method serializes the necessary parameters to recreate the visualization's state.
   * @returns {Object} A JSON representation of the DriveVisualization's state.
   */
  toJSON() {
    return {
      driveManager: this.driveManager.toJSON(),
      x: this.x,
      y: this.y,
      size: this.size,
    };
  }

  /**
   * Creates a DriveVisualization instance from a JSON object.
   * This static method allows for deserializing a JSON object back into a DriveVisualization instance.
   * @param {Object} json - A JSON object representing a DriveVisualization.
   * @return {DriveVisualization} A new DriveVisualization instance.
   */
  static fromJSON(json) {
    const driveManager = DriveManager.fromJSON(json.driveManager);
    return new DriveVisualization(driveManager, json.x, json.y, json.size);
  }
}
