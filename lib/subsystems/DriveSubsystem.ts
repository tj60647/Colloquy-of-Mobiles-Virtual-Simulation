/**
 * DriveSubsystem.ts
 *
 * Manages the internal "Drives" (Orange and Puce) for a Mobile.
 * Drives represent the energy/hunger levels of the Mobile, driving its behavior.
 *
 * Each Mobile has two independent drive variables:
 * - O Drive (Orange)
 * - P Drive (Puce)
 *
 * The DriveSubsystem increments entropy over time (hunger) and handles
 * the logic for determining the current behavioral state (Satisfied, Searching, etc.).
 *
 * @see docs/terminology.md
 * @see docs/reference/mcleish/system-design/
 */

import { Drive } from './Drive';
import {
  DriveSystemConfig,
  DriveConfig,
  LegacyDriveState,
  LegacyDriveStateType,
} from '../types/drives';

export class DriveSubsystem {
  private _ODrive: Drive;
  private _PDrive: Drive;
  private _config: DriveSystemConfig;

  // History buffer for visualization
  private _history: Array<{ O: number; P: number; state: LegacyDriveStateType }>;
  private _timer: NodeJS.Timeout | null = null;

  /**
   * Create a new DriveSubsystem.
   * @param config - Configuration for both drives and the system update interval.
   */
  constructor(config: DriveSystemConfig) {
    this._config = config;

    // Initialize Drives
    this._ODrive = new Drive(
      config.O.initialValue,
      config.O.floor,
      config.O.lowerLimit,
      config.O.upperLimit,
      config.O.max
    );

    this._PDrive = new Drive(
      config.P.initialValue,
      config.P.floor,
      config.P.lowerLimit,
      config.P.upperLimit,
      config.P.max
    );

    // Initialize History
    this._history = [
      {
        O: config.O.initialValue,
        P: config.P.initialValue,
        state: this.getDriveState(),
      },
    ];

    // Start internal timer? (Legacy behavior: yes)
    // Ideally this should be run by the SimulationLoop, but keeping legacy compatibility for now.
    this.startTimer();
  }

  /**
   * Get the current behavioral state based on drive values.
   * Logic derived from 2018 reconstruction.
   */
  getDriveState(): LegacyDriveStateType {
    const O = this._ODrive.currentValue;
    const P = this._PDrive.currentValue;
    const O_low = this._ODrive.lowerLimit;
    const P_low = this._PDrive.lowerLimit;
    const O_high = this._ODrive.upperLimit;
    const P_high = this._PDrive.upperLimit;

    if (O < O_low && P < P_low) {
      return LegacyDriveState.SATISFIED_AND_INDIFFERENT;
    }

    if (O > O_high && P > P_high) {
      return LegacyDriveState.EITHER_O_OR_P_SATISFACTION_SEARCH;
    }

    // Priority logic: If both > low, higher one dominates?
    // Following legacy DriveManager.js logic exactly:

    if (O > O_low && O > P) {
      return LegacyDriveState.O_SATISFACTION_SEARCH;
    }

    if (P > P_low && P > O) {
      return LegacyDriveState.P_SATISFACTION_SEARCH;
    }

    if (O === P && O > O_low) {
      // Edge case where equal and above threshold
      return LegacyDriveState.EITHER_O_OR_P_SATISFACTION_SEARCH;
    }

    return LegacyDriveState.UNKNOWN;
  }

  /**
   * Increment both drives by their configured increment value (Entropy increase).
   */
  incrementDrives(): void {
    this._ODrive.increment(this._config.O.increment);
    this._PDrive.increment(this._config.P.increment);
    this.updateHistory();
  }

  /**
   * Decrement O Drive (Satisfaction).
   */
  decrementODrive(): void {
    this._ODrive.decrement(this._config.O.decrement);
    this.updateHistory();
  }

  /**
   * Decrement P Drive (Satisfaction).
   */
  decrementPDrive(): void {
    this._PDrive.decrement(this._config.P.decrement);
    this.updateHistory();
  }

  /**
   * Log current state to history buffer.
   */
  private updateHistory(): void {
    this._history.push({
      O: this._ODrive.currentValue,
      P: this._PDrive.currentValue,
      state: this.getDriveState(),
    });

    if (this._history.length > this._config.maxHistorySamples) {
      this._history.shift();
    }
  }

  /**
   * Start the simplified internal timer.
   * @deprecated Use external SimulationLoop instead.
   */
  startTimer(): void {
    if (!this._timer) {
      this._timer = setInterval(() => this.incrementDrives(), this._config.interval);
    }
  }

  /**
   * Stop the internal timer.
   */
  stopTimer(): void {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  // Getters for individual drives
  get ODrive(): Drive {
    return this._ODrive;
  }
  get PDrive(): Drive {
    return this._PDrive;
  }

  get history() {
    return this._history;
  }

  // Legacy compatibility getters (aliases for visualization)
  get ODriveFloor() {
    return this._ODrive.floor;
  }
  get ODriveLowerLimit() {
    return this._ODrive.lowerLimit;
  }
  get ODriveUpperLimit() {
    return this._ODrive.upperLimit;
  }
  get ODriveMax() {
    return this._ODrive.max;
  }

  get PDriveFloor() {
    return this._PDrive.floor;
  }
  get PDriveLowerLimit() {
    return this._PDrive.lowerLimit;
  }
  get PDriveUpperLimit() {
    return this._PDrive.upperLimit;
  }
  get PDriveMax() {
    return this._PDrive.max;
  }

  /**
   * Serialize state.
   */
  toJSON() {
    return {
      config: this._config,
      state: {
        O: this._ODrive.toJSON(),
        P: this._PDrive.toJSON(),
        history: this._history,
      },
    };
  }

  /**
   * Deserialize state.
   */
  static fromJSON(json: any): DriveSubsystem {
    const subsystem = new DriveSubsystem(json.config);

    // Restore drive states
    subsystem._ODrive = Drive.fromJSON(json.state.O);
    subsystem._PDrive = Drive.fromJSON(json.state.P);
    subsystem._history = json.state.history || [];

    return subsystem;
  }

  /**
   * Deserialize.
   * Note: This implementation differs from legacy constructor-based hydration.
   * It assumes you pass the standard config object.
   */
  static fromConfig(config: DriveSystemConfig): DriveSubsystem {
    return new DriveSubsystem(config);
  }
}
