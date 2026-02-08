/**
 * Drive.ts
 * 
 * Represents a constrained numerical value used for Mobiles' Drives (Orange and Puce).
 * A Drive models a variable with a value that is constrained by a defined minimum
 * (floor), maximum (max), and operational limits.
 * 
 * Based on Gordon Pask's original 1968 cybernetic art installation and
 * the 2018 physical reconstruction by McLeish.
 * 
 * @see docs/terminology.md for canonical terminology
 * @see docs/reference/mcleish/system-design/ for technical specifications
 */

export interface DriveState {
    initialValue: number;
    currentValue: number;
    floor: number;
    lowerLimit: number;
    upperLimit: number;
    max: number;
}

export class Drive {
    private _initialValue: number;
    private _floor: number;
    private _lowerLimit: number;
    private _upperLimit: number;
    private _max: number;
    private _currentValue: number;

    /**
     * Create a Drive instance.
     * @param initialValue - The initial value of the drive.
     * @param floor - The absolute minimum value for the drive.
     * @param lowerLimit - The lower operational limit for the drive.
     * @param upperLimit - The upper operational limit for the drive.
     * @param max - The absolute maximum value for the drive.
     */
    constructor(
        initialValue: number,
        floor: number,
        lowerLimit: number,
        upperLimit: number,
        max: number
    ) {
        this._initialValue = initialValue;
        this._floor = floor;
        this._lowerLimit = lowerLimit;
        this._upperLimit = upperLimit;
        this._max = max;
        this._currentValue = initialValue; // Initialize current value

        // Apply constraints immediately
        this.currentValue = initialValue;
    }

    /**
     * Increment the drive's value by a specified amount.
     * @param value - The value to increment by.
     */
    increment(value: number): void {
        this.currentValue += value;
    }

    /**
     * Decrement the drive's value by a specified amount.
     * @param value - The value to decrement by.
     */
    decrement(value: number): void {
        this.currentValue -= value;
    }

    /**
     * Get the current value of the drive.
     */
    get currentValue(): number {
        return this._currentValue;
    }

    /**
     * Set the current value of the drive.
     * This setter ensures the value is within the defined constraints.
     */
    set currentValue(value: number) {
        // Replaces global p5.js constrain() with Math.min/max
        this._currentValue = Math.min(Math.max(value, this._floor), this._max);
    }

    /**
     * Get the initial value of the drive.
     */
    get initialValue(): number {
        return this._initialValue;
    }

    set initialValue(value: number) {
        this._initialValue = value;
    }

    // Getters

    get floor(): number {
        return this._floor;
    }

    get lowerLimit(): number {
        return this._lowerLimit;
    }

    get upperLimit(): number {
        return this._upperLimit;
    }

    get max(): number {
        return this._max;
    }

    // Setters - Updates trigger re-constraint of current value

    set floor(value: number) {
        this._floor = value;
        this.currentValue = this._currentValue; // Trigger setter to reapply constraints
    }

    set lowerLimit(value: number) {
        this._lowerLimit = value;
    }

    set upperLimit(value: number) {
        this._upperLimit = value;
    }

    set max(value: number) {
        this._max = value;
        this.currentValue = this._currentValue; // Trigger setter to reapply constraints
    }

    /**
     * Convert the current state of the drive to a JSON object.
     */
    toJSON(): DriveState {
        return {
            initialValue: this._initialValue,
            currentValue: this._currentValue,
            floor: this._floor,
            lowerLimit: this._lowerLimit,
            upperLimit: this._upperLimit,
            max: this._max,
        };
    }

    /**
     * Creates a Drive instance from a JSON object.
     */
    static fromJSON(json: DriveState): Drive {
        const drive = new Drive(
            json.initialValue,
            json.floor,
            json.lowerLimit,
            json.upperLimit,
            json.max
        );
        drive.currentValue = json.currentValue;
        return drive;
    }
}
