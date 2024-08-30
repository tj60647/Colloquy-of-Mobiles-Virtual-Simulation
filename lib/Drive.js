/**
 * Class representing a drive with constraints.
 * The Drive class models a variable with a value that is constrained by
 * a defined minimum (floor), maximum (max), and operational limits
 * (lowerLimit and upperLimit). The value can be incremented or decremented
 * within these constraints, making it useful for simulations where
 * bounded values are required.
 */
export class Drive {
  /**
   * Create a Drive instance.
   * @param {number} initialValue - The initial value of the drive.
   * @param {number} floor - The minimum value for the drive.
   * @param {number} lowerLimit - The lower operational limit for the drive.
   * @param {number} upperLimit - The upper operational limit for the drive.
   * @param {number} max - The maximum value for the drive.
   */
  constructor(initialValue, floor, lowerLimit, upperLimit, max) {
    this._initialValue = initialValue; // Store the initial value separately
    this._floor = floor; // The minimum possible value for the drive
    this._lowerLimit = lowerLimit; // The lower operational limit for the drive
    this._upperLimit = upperLimit; // The upper operational limit for the drive
    this._max = max; // The maximum possible value for the drive
    this.currentValue = initialValue; // Set current value using the setter
  }

  /**
   * Increment the drive's value by a specified amount.
   * @param {number} value - The value to increment by.
   */
  increment(value) {
    this.currentValue += value; // The setter will constrain the value within the limits
  }

  /**
   * Decrement the drive's value by a specified amount.
   * @param {number} value - The value to decrement by.
   */
  decrement(value) {
    this.currentValue -= value; // The setter will constrain the value within the limits
  }

  /**
   * Get the current value of the drive.
   * @returns {number} The current value of the drive.
   */
  get currentValue() {
    return this._currentValue;
  }

  /**
   * Set the current value of the drive.
   * This setter ensures the value is within the defined constraints.
   * @param {number} value - The new value to set as current value.
   */
  set currentValue(value) {
    this._currentValue = constrain(value, this._floor, this._max); // Constrain the value within the limits
  }

  /**
   * Get the initial value of the drive.
   * @returns {number} The initial value of the drive.
   */
  get initialValue() {
    return this._initialValue;
  }

  /**
   * Set the initial value of the drive.
   * This setter allows changing the initial value, but does not affect the current value.
   * @param {number} value - The new initial value.
   */
  set initialValue(value) {
    this._initialValue = value;
  }

  // Getters

  /**
   * Get the floor (minimum value) of the drive.
   * @returns {number} The floor value of the drive.
   */
  get floor() {
    return this._floor;
  }

  /**
   * Get the lower operational limit of the drive.
   * @returns {number} The lower operational limit of the drive.
   */
  get lowerLimit() {
    return this._lowerLimit;
  }

  /**
   * Get the upper operational limit of the drive.
   * @returns {number} The upper operational limit of the drive.
   */
  get upperLimit() {
    return this._upperLimit;
  }

  /**
   * Get the maximum value of the drive.
   * @returns {number} The maximum value of the drive.
   */
  get max() {
    return this._max;
  }

  // Setters

  /**
   * Set the floor (minimum value) of the drive.
   * The current value is constrained within the new limits.
   * @param {number} value - The new floor value.
   */
  set floor(value) {
    this._floor = value;
    this.currentValue = this._currentValue; // Trigger setter to reapply constraints
  }

  /**
   * Set the lower operational limit of the drive.
   * @param {number} value - The new lower operational limit.
   */
  set lowerLimit(value) {
    this._lowerLimit = value;
  }

  /**
   * Set the upper operational limit of the drive.
   * @param {number} value - The new upper operational limit.
   */
  set upperLimit(value) {
    this._upperLimit = value;
  }

  /**
   * Set the maximum value of the drive.
   * The current value is constrained within the new limits.
   * @param {number} value - The new maximum value.
   */
  set max(value) {
    this._max = value;
    this.currentValue = this._currentValue; // Trigger setter to reapply constraints
  }

  /**
   * Convert the current state of the drive to a JSON object.
   * This method serializes the necessary parameters to recreate the drive instance.
   * @returns {Object} A JSON representation of the drive's state.
   */
  toJSON() {
    return {
      initialValue: this._initialValue, // Store the initial value separately
      currentValue: this._currentValue, // Store the current value
      floor: this._floor,
      lowerLimit: this._lowerLimit,
      upperLimit: this._upperLimit,
      max: this._max,
    };
  }

  /**
   * Creates a Drive instance from a JSON object.
   * This static method allows for deserializing a JSON object back into a Drive instance.
   * @param {Object} json - A JSON object representing a Drive.
   * @return {Drive} A new Drive instance.
   */
  static fromJSON(json) {
    const drive = new Drive(
      json.initialValue,
      json.floor,
      json.lowerLimit,
      json.upperLimit,
      json.max
    );
    drive.currentValue = json.currentValue; // Restore the current value
    return drive;
  }
}
