//import classes
import { DriveManager } from './DriveManager.js';
import { DriveVisualization } from './DriveVisualization.js';

export class Agent_DriveManager {
  constructor(x, y, size) {
    // Randomize the first and sixth variables (O_drive and P_drive)
    let randomO = round(random(0, 1200));
    let randomP = round(random(0, 1200));

    this.driveManager = new DriveManager(
      randomO,
      0,
      600,
      3600,
      4800, // O_drive parameters with randomized first value
      randomP,
      0,
      600,
      3600,
      4800, // P_drive parameters with randomized sixth value
      1,
      1 // increment and decrement values
    );

    this.visualization = new DriveVisualization(this.driveManager, x, y, size);
  }

  render() {
    this.visualization.render();
  }
}
