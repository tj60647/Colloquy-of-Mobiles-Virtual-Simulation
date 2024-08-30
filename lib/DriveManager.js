//import classes
import { Drive } from "./Drive.js";

/**
 * Enum for drive states.
 * @readonly
 * @enum {string}
 */
export const DriveState = {
  SATISFIED_AND_INDIFFERENT: "satisfied_and_indifferent",
  O_SATISFACTION_SEARCH: "O_satisfaction_search",
  P_SATISFACTION_SEARCH: "P_satisfaction_search",
  EITHER_O_OR_P_SATISFACTION_SEARCH: "either_O_or_P_satisfaction_search",
  UNKNOWN: "unknown",
};

/**
 * Class representing a manager for two drives (O_drive and P_drive).
 * The DriveManager is responsible for managing the states and behaviors
 * of two drives, O_drive and P_drive, which operate within specified
 * limits and constraints. The manager allows for incrementing and
 * decrementing the drives' values and maintains a history of their states
 * over time. It also manages a timer that periodically increments the drives
 * to simulate ongoing changes.
 */
export class DriveManager {
  /**
   * Create a DriveManager.
   * @param {number} O_initialValue - The initial value for the O drive.
   * @param {number} O_floor - The minimum value for the O drive.
   * @param {number} O_lowerLimit - The lower operational limit for the O drive.
   * @param {number} O_upperLimit - The upper operational limit for the O drive.
   * @param {number} O_max - The maximum value for the O drive.
   * @param {number} P_initialValue - The initial value for the P drive.
   * @param {number} P_floor - The minimum value for the P drive.
   * @param {number} P_lowerLimit - The lower operational limit for the P drive.
   * @param {number} P_upperLimit - The upper operational limit for the P drive.
   * @param {number} P_max - The maximum value for the P drive.
   * @param {number} increment - The amount to increment both drives.
   * @param {number} decrement - The amount to decrement both drives.
   * @param {number} interval - The interval for the timer in milliseconds. Default is 50 ms.
   * @param {number} [maxHistorySamples=1000] - The maximum number of history samples to store.
   * @throws {Error} Throws an error if any of the input values are invalid.
   */
  constructor(
    O_initialValue,
    O_floor,
    O_lowerLimit,
    O_upperLimit,
    O_max,
    P_initialValue,
    P_floor,
    P_lowerLimit,
    P_upperLimit,
    P_max,
    increment,
    decrement,
    interval = 50,
    maxHistorySamples = 60
  ) {
    // Validate input parameters
    this.validateDriveParameters(
      O_initialValue,
      O_floor,
      O_lowerLimit,
      O_upperLimit,
      O_max,
      "O"
    );
    this.validateDriveParameters(
      P_initialValue,
      P_floor,
      P_lowerLimit,
      P_upperLimit,
      P_max,
      "P"
    );
    this.validateIncrementDecrement(increment, "increment");
    this.validateIncrementDecrement(decrement, "decrement");

    // Initialize drives
    this.O_drive = new Drive(
      O_initialValue,
      O_floor,
      O_lowerLimit,
      O_upperLimit,
      O_max
    );
    this.P_drive = new Drive(
      P_initialValue,
      P_floor,
      P_lowerLimit,
      P_upperLimit,
      P_max
    );

    // Store configuration parameters
    this.incrementValue = increment;
    this.decrementValue = decrement;
    this.interval = interval;
    this.maxHistorySamples = maxHistorySamples;

    // Initialize history with the first data point
    this.history = [
      {
        O_drive: O_initialValue,
        P_drive: P_initialValue,
        driveState: this.getDriveState(),
      },
    ];

    this.timer = null; // Initialize the timer as null

    // Start the timer initially
    this.startTimer();
  }

  /**
   * Increment the values of both O_drive and P_drive by the increment value.
   */
  incrementDrives() {
    this.O_drive.increment(this.incrementValue);
    this.P_drive.increment(this.incrementValue);
    this.updateHistory();
  }

  /**
   * Decrement the value of the O_drive by the decrement value.
   */
  decrementODrive() {
    this.O_drive.decrement(this.decrementValue);
    this.updateHistory();
  }

  /**
   * Decrement the value of the P_drive by the decrement value.
   */
  decrementPDrive() {
    this.P_drive.decrement(this.decrementValue);
    this.updateHistory();
  }

  /**
   * Update the history with the current drive values and state.
   * The history is a record of drive values and states over time,
   * which can be used for analysis or debugging.
   */
  updateHistory() {
    // Add the current drive values and state to the history
    this.history.push({
      O_drive: this.O_drive.currentValue,
      P_drive: this.P_drive.currentValue,
      driveState: this.getDriveState(),
    });

    // Ensure the history does not exceed the maximum number of samples
    if (this.history.length > this.maxHistorySamples) {
      this.history.shift(); // Remove the oldest entry if history exceeds maxHistorySamples
    }
  }

  /**
   * Get the current state of the drives.
   * This method evaluates the current values of O_drive and P_drive and returns a
   * state that reflects their relationship to the defined operational limits.
   * @returns {string} The current state of the drives.
   */
  getDriveState() {
    const O_drive = this.O_drive.currentValue;
    const P_drive = this.P_drive.currentValue;

    if (
      O_drive < this.O_drive.lowerLimit &&
      P_drive < this.P_drive.lowerLimit
    ) {
      return DriveState.SATISFIED_AND_INDIFFERENT;
    } else if (
      O_drive > this.O_drive.upperLimit &&
      P_drive > this.P_drive.upperLimit
    ) {
      return DriveState.EITHER_O_OR_P_SATISFACTION_SEARCH;
    } else if (O_drive > this.O_drive.lowerLimit && O_drive > P_drive) {
      return DriveState.O_SATISFACTION_SEARCH;
    } else if (P_drive > this.P_drive.lowerLimit && P_drive > O_drive) {
      return DriveState.P_SATISFACTION_SEARCH;
    } else if (O_drive === P_drive) {
      return DriveState.EITHER_O_OR_P_SATISFACTION_SEARCH;
    }

    return DriveState.UNKNOWN;
  }

  /**
   * Get the current values of the O_drive and P_drive.
   * This method returns an object containing the current values of both drives.
   * @returns {Object} An object containing the current values of O_drive and P_drive.
   */
  getDriveValues() {
    return {
      O_drive: this.O_drive.currentValue,
      P_drive: this.P_drive.currentValue,
    };
  }

  /**
   * Get the history of the drive values and states.
   * The history provides a record of how the drive values and states have changed over time.
   * @returns {Array<Object>} The history of the drive values and states.
   */
  getHistory() {
    return this.history;
  }

  // Getters and Setters for O_drive

  /**
   * Get the floor (minimum value) for the O_drive.
   * @returns {number} The floor value of the O_drive.
   */
  get ODriveFloor() {
    return this.O_drive.floor;
  }

  /**
   * Set the floor (minimum value) for the O_drive.
   * The current value is constrained within the new limits.
   * @param {number} value - The new floor value.
   */
  set ODriveFloor(value) {
    this.validateBoundaryValue(value, "floor");
    this.O_drive.floor = value;
  }

  /**
   * Get the lower operational limit for the O_drive.
   * @returns {number} The lower operational limit of the O_drive.
   */
  get ODriveLowerLimit() {
    return this.O_drive.lowerLimit;
  }

  /**
   * Set the lower operational limit for the O_drive.
   * @param {number} value - The new lower operational limit.
   */
  set ODriveLowerLimit(value) {
    this.validateBoundaryValue(value, "lower limit");
    this.O_drive.lowerLimit = value;
  }

  /**
   * Get the upper operational limit for the O_drive.
   * @returns {number} The upper operational limit of the O_drive.
   */
  get ODriveUpperLimit() {
    return this.O_drive.upperLimit;
  }

  /**
   * Set the upper operational limit for the O_drive.
   * @param {number} value - The new upper operational limit.
   */
  set ODriveUpperLimit(value) {
    this.validateBoundaryValue(value, "upper limit");
    this.O_drive.upperLimit = value;
  }

  /**
   * Get the maximum value for the O_drive.
   * @returns {number} The maximum value of the O_drive.
   */
  get ODriveMax() {
    return this.O_drive.max;
  }

  /**
   * Set the maximum value for the O_drive.
   * The current value is constrained within the new limits.
   * @param {number} value - The new maximum value.
   */
  set ODriveMax(value) {
    this.validateBoundaryValue(value, "max");
    this.O_drive.max = value;
  }

  // Getters and Setters for P_drive

  /**
   * Get the floor (minimum value) for the P_drive.
   * @returns {number} The floor value of the P_drive.
   */
  get PDriveFloor() {
    return this.P_drive.floor;
  }

  /**
   * Set the floor (minimum value) for the P_drive.
   * The current value is constrained within the new limits.
   * @param {number} value - The new floor value.
   */
  set PDriveFloor(value) {
    this.validateBoundaryValue(value, "floor");
    this.P_drive.floor = value;
  }

  /**
   * Get the lower operational limit for the P_drive.
   * @returns {number} The lower operational limit of the P_drive.
   */
  get PDriveLowerLimit() {
    return this.P_drive.lowerLimit;
  }

  /**
   * Set the lower operational limit for the P_drive.
   * @param {number} value - The new lower operational limit.
   */
  set PDriveLowerLimit(value) {
    this.validateBoundaryValue(value, "lower limit");
    this.P_drive.lowerLimit = value;
  }

  /**
   * Get the upper operational limit for the P_drive.
   * @returns {number} The upper operational limit of the P_drive.
   */
  get PDriveUpperLimit() {
    return this.P_drive.upperLimit;
  }

  /**
   * Set the upper operational limit for the P_drive.
   * @param {number} value - The new upper operational limit.
   */
  set PDriveUpperLimit(value) {
    this.validateBoundaryValue(value, "upper limit");
    this.P_drive.upperLimit = value;
  }

  /**
   * Get the maximum value for the P_drive.
   * @returns {number} The maximum value of the P_drive.
   */
  get PDriveMax() {
    return this.P_drive.max;
  }

  /**
   * Set the maximum value for the P_drive.
   * The current value is constrained within the new limits.
   * @param {number} value - The new maximum value.
   */
  set PDriveMax(value) {
    this.validateBoundaryValue(value, "max");
    this.P_drive.max = value;
  }

  /**
   * Validate drive parameters.
   * Ensures that all drive parameters are valid numbers and within logical ranges.
   * @param {number} initialValue - The initial value for the drive.
   * @param {number} floor - The minimum value for the drive.
   * @param {number} lowerLimit - The lower operational limit for the drive.
   * @param {number} upperLimit - The upper operational limit for the drive.
   * @param {number} max - The maximum value for the drive.
   * @param {string} driveName - The name of the drive being validated ('O' or 'P').
   * @throws {Error} Throws an error if any of the parameters are invalid.
   */
  validateDriveParameters(
    initialValue,
    floor,
    lowerLimit,
    upperLimit,
    max,
    driveName
  ) {
    if (
      typeof initialValue !== "number" ||
      typeof floor !== "number" ||
      typeof lowerLimit !== "number" ||
      typeof upperLimit !== "number" ||
      typeof max !== "number"
    ) {
      throw new Error(`${driveName} drive parameters must all be numbers.`);
    }
    if (initialValue < floor || initialValue > max) {
      throw new Error(
        `${driveName} drive initial value must be between floor and max.`
      );
    }
    if (floor < 0) {
      throw new Error(
        `${driveName} drive floor must be greater than or equal to 0.`
      );
    }
    if (lowerLimit <= floor || upperLimit >= max || lowerLimit >= upperLimit) {
      throw new Error(
        `${driveName} drive limits must be logically ordered: floor < lowerLimit < upperLimit < max.`
      );
    }
  }

  /**
   * Validate increment and decrement values.
   * Ensures that the increment and decrement values are positive numbers.
   * @param {number} value - The value to validate (either increment or decrement).
   * @param {string} valueName - The name of the value being validated.
   * @throws {Error} Throws an error if the value is not a positive number.
   */
  validateIncrementDecrement(value, valueName) {
    if (typeof value !== "number" || value <= 0) {
      throw new Error(`${valueName} must be a positive number.`);
    }
  }

  /**
   * Validate boundary values for the drive properties.
   * Ensures that boundary values like floor, lower limit, upper limit, and max are valid.
   * @param {number} value - The value to validate.
   * @param {string} propertyName - The name of the property being validated.
   * @throws {Error} Throws an error if the value is not a number or is negative.
   */
  validateBoundaryValue(value, propertyName) {
    if (typeof value !== "number" || value < 0) {
      throw new Error(`${propertyName} must be a non-negative number.`);
    }
  }

  /**
   * Convert the current state of the DriveManager to a JSON object.
   * This method serializes the necessary parameters to recreate the drives and their state.
   * @returns {Object} A JSON representation of the DriveManager's state.
   */
  toJSON() {
    return {
      O_initialValue: this.O_drive.currentValue,
      O_floor: this.O_drive.floor,
      O_lowerLimit: this.O_drive.lowerLimit,
      O_upperLimit: this.O_drive.upperLimit,
      O_max: this.O_drive.max,
      P_initialValue: this.P_drive.currentValue,
      P_floor: this.P_drive.floor,
      P_lowerLimit: this.P_drive.lowerLimit,
      P_upperLimit: this.P_drive.upperLimit,
      P_max: this.P_drive.max,
      increment: this.incrementValue,
      decrement: this.decrementValue,
      interval: this.interval,
      maxHistorySamples: this.maxHistorySamples,
    };
  }

  /**
   * Creates a DriveManager instance from a JSON object.
   * This static method allows for deserializing a JSON object back into a DriveManager instance.
   * @param {Object} json - A JSON object representing a DriveManager.
   * @return {DriveManager} A new DriveManager instance.
   */
  static fromJSON(json) {
    return new DriveManager(
      json.O_initialValue,
      json.O_floor,
      json.O_lowerLimit,
      json.O_upperLimit,
      json.O_max,
      json.P_initialValue,
      json.P_floor,
      json.P_lowerLimit,
      json.P_upperLimit,
      json.P_max,
      json.increment,
      json.decrement,
      json.interval,
      json.maxHistorySamples
    );
  }

  /**
   * Start the timer if it's not already running.
   * The timer increments the drive values at a set interval.
   */
  startTimer() {
    if (this.timer === null) {
      // Only start the timer if it's not already running
      this.timer = setInterval(() => this.incrementDrives(), this.interval);
    }
  }

  /**
   * Stop the timer if it's running.
   */
  stopTimer() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null; // Set the timer to null to indicate it's stopped
    }
  }
}
