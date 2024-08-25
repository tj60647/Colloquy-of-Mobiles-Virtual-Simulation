class Render3Dp5 {
  /**
   * Draws a line from the parent transform to the specified transform.
   * If the transform has no parent, the line is drawn from the origin.
   * @param {Transform} transform - The Transform object to which the line is drawn.
   */
  static drawLineToTransform(transform) {
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
  static drawTransform(transform) {
    const pos = transform.getGlobalPosition();
    const ori = transform.getGlobalOrientation();
    const forwardVector = transform.getLocalForwardVector();
    const radius = 30; // Length of the lines
    push(); // Start a new drawing state
    translate(pos.x, pos.y, pos.z); // Move to the global position of the transform

    // Draw the transform as a small sphere
    stroke("#878787"); // Red color for the sphere
    sphere(2); // Sphere size

    // Apply orientation to the local axes
    rotateZ(radians(ori.roll));
    rotateX(radians(ori.pitch));
    rotateY(radians(-ori.yaw));

    const length = 15;
    // Draw local coordinate axes
    strokeWeight(1);
    stroke(255, 0, 0); // X-axis in red
    line(0, 0, 0, length, 0, 0);
    stroke(0, 255, 0); // Y-axis in green
    line(0, 0, 0, 0, length, 0);
    stroke(0, 0, 255); // Z-axis in blue
    line(0, 0, 0, 0, 0, length);

    // Draw axis labels
    textSize(8);
    fill(255, 0, 0);
    text("X", length + 2, 0, 0);
    fill(0, 255, 0);
    text("Y", 0, length + 2, 0);
    fill(0, 0, 255);
    text("Z", 0, 0, length + 2);

    // Draw the forward vector as a dashed line
    stroke(255, 255, 0); // Yellow color for the forward vector
    strokeCap(SQUARE);
    strokeWeight(1);
    Render3Dp5.drawDashedLine(
      forwardVector.x * length,
      forwardVector.y * length,
      forwardVector.z * length,
      forwardVector.x * radius,
      forwardVector.y * radius,
      forwardVector.z * radius,
      2.5,
      2.5
    );

    pop(); // Restore original drawing state
  }

  /**
   * Draws a dashed line between two points in 3D space.
   * @param {number} x1 - The x-coordinate of the start point.
   * @param {number} y1 - The y-coordinate of the start point.
   * @param {number} z1 - The z-coordinate of the start point.
   * @param {number} x2 - The x-coordinate of the end point.
   * @param {number} y2 - The y-coordinate of the end point.
   * @param {number} z2 - The z-coordinate of the end point.
   * @param {number} dashLength - The length of each dash.
   * @param {number} gapLength - The length of each gap between dashes.
   */
  static drawDashedLine(x1, y1, z1, x2, y2, z2, dashLength, gapLength) {
    const totalLength = dist(x1, y1, z1, x2, y2, z2);
    const numDashes = totalLength / (dashLength + gapLength);
    const dashVector = createVector(x2 - x1, y2 - y1, z2 - z1)
      .normalize()
      .mult(dashLength);
    const gapVector = createVector(x2 - x1, y2 - y1, z2 - z1)
      .normalize()
      .mult(gapLength);

    let currentPos = createVector(x1, y1, z1);
    for (let i = 0; i < numDashes; i++) {
      const nextPos = p5.Vector.add(currentPos, dashVector);
      line(
        currentPos.x,
        currentPos.y,
        currentPos.z,
        nextPos.x,
        nextPos.y,
        nextPos.z
      );
      currentPos = p5.Vector.add(nextPos, gapVector);
    }
  }

  /**
   * Draws the field of view as a 3D cone using lines, arcs, and a circle.
   * @param {Transform} transform - The Transform object whose field of view is to be drawn.
   * @param {number} fieldOfView - The field of view in degrees.
   * @param {string} color - The color to use for drawing the field of view.
   * @param {number} radius - The radius of the field of view.
   */
  static drawFOV(transform, fieldOfView, color, radius = 30) {
    const pos = transform.getGlobalPosition();
    const ori = transform.getGlobalOrientation();
    const fov = radians(fieldOfView);

    let tempRadius = 0;
    let tempCenter = 0;

    push(); // Start a new drawing state
    translate(pos.x, pos.y, pos.z); // Move to the global position of the transform

    // Apply orientation to the local axes
    rotateZ(radians(ori.roll));
    rotateX(radians(ori.pitch));
    rotateY(radians(-ori.yaw));

    // Draw lines representing the field of view
    stroke(color);
    const angles = [-fov / 2, fov / 2];
    for (let angle of angles) {
      const x = radius * sin(angle);
      const y = radius * cos(angle);
      line(0, 0, 0, 0, y, x);
      line(0, 0, 0, x, y, 0);
      tempRadius = x;
      tempCenter = y;
    }

    // Draw arcs representing the field of view
    noFill();
    stroke(color);

    beginShape();
    for (let angle = -fov / 2; angle <= fov / 2; angle += PI / 24) {
      const x = radius * sin(angle);
      const y = radius * cos(angle);
      vertex(x, y, 0);
    }
    endShape();

    beginShape();
    for (let angle = -fov / 2; angle <= fov / 2; angle += PI / 24) {
      const x = radius * sin(angle);
      const y = radius * cos(angle);
      vertex(0, y, x);
    }
    endShape();

    // Draw the circle that touches each of the arc endpoints in the yz plane
    beginShape();
    for (let angle = 0; angle < TWO_PI; angle += PI / 12) {
      const y = tempRadius * cos(angle);
      const z = tempRadius * sin(angle);
      vertex(y, tempCenter, z);
    }
    endShape(CLOSE);

    pop(); // Restore original drawing state
  }

  /**
   * Draws the sensor's field of view as a 3D cone using lines, arcs, and a circle.
   * @param {Sensor} sensor - The Sensor object whose field of view is to be drawn.
   */
  static drawSensorFOV(sensor) {
    Render3Dp5.drawFOV(sensor, sensor.fieldOfView, "rgba(0, 0, 255, 100)", 30);
  }

  /**
   * Draws the actuator's field of view as a 3D cone using lines, arcs, and a circle.
   * @param {Actuator} actuator - The Actuator object whose field of view is to be drawn.
   */
  static drawActuatorFOV(actuator) {
    Render3Dp5.drawFOV(
      actuator,
      actuator.fieldOfView,
      "rgba(255, 0, 0, 100)",
      30
    );
  }

  /**
   * Draws the sensor's field of view as a 3D cone using lines, arcs, and a circle.
   * @param {Sensor} sensor - The Sensor object whose field of view is to be drawn.
   */
  static drawSensorFOV(sensor) {
    const pos = sensor.getGlobalPosition();
    const ori = sensor.getGlobalOrientation();
    const fov = radians(sensor.fieldOfView);
    const radius = 30; // Length of the lines

    let tempRadius = 0;
    let tempCenter = 0;

    push(); // Start a new drawing state
    translate(pos.x, pos.y, pos.z); // Move to the global position of the sensor

    // Apply orientation to the local axes
    rotateZ(radians(ori.roll));
    rotateX(radians(ori.pitch));
    rotateY(radians(-ori.yaw));

    // Draw lines representing the field of view
    stroke(0, 0, 255, 100); // Blue color with transparency
    const angles = [-fov / 2, fov / 2];
    for (let angle of angles) {
      const x = radius * sin(angle);
      const y = radius * cos(angle);
      line(0, 0, 0, 0, y, x);
      line(0, 0, 0, x, y, 0);
      tempRadius = x;
      tempCenter = y;
    }

    // Draw arcs representing the field of view
    noFill();
    stroke(0, 0, 255, 100); // Blue color with transparency

    beginShape();
    for (let angle = -fov / 2; angle <= fov / 2; angle += PI / 24) {
      const x = radius * sin(angle);
      const y = radius * cos(angle);
      vertex(x, y, 0);
    }
    endShape();

    beginShape();
    for (let angle = -fov / 2; angle <= fov / 2; angle += PI / 24) {
      const x = radius * sin(angle);
      const y = radius * cos(angle);
      vertex(0, y, x);
    }
    endShape();

    // Draw the circle that touches each of the arc endpoints in the yz plane
    beginShape();
    for (let angle = 0; angle < TWO_PI; angle += PI / 12) {
      const y = tempRadius * cos(angle);
      const z = tempRadius * sin(angle);
      vertex(y, tempCenter, z);
    }
    endShape(CLOSE);

    pop(); // Restore original drawing state
  }

  /**
   * Draws a test point and indicates whether it is within the sensor's field of view.
   * @param {{x: number, y: number, z: number}} point - The point to draw.
   * @param {boolean} isInFOV - Whether the point is within the field of view.
   */
  static drawTestPoint(point, isInFOV) {
    push(); // Start a new drawing state
    translate(point.x, point.y, point.z); // Move to the point's position

    // Draw the point as a small sphere
    stroke(isInFOV ? 0 : 255, isInFOV ? 255 : 0, 0); // Green if in FOV, red if out of FOV
    sphere(1); // Sphere size

    pop(); // Restore original drawing state
  }
}
