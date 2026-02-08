/**
 * Drive System Types
 * Based on canonical terminology from docs/terminology.md
 */

export interface DriveConfig {
  initialValue: number;
  floor: number; // Absolute minimum
  lowerLimit: number; // Threshold for "Unsatisfied" state
  upperLimit: number; // Upper operational limit
  max: number; // Absolute maximum
  increment: number; // Entropy increment per tick
  decrement: number; // Satisfaction decrement on successful interaction
}

export interface DriveSystemConfig {
  O: DriveConfig; // Orange drive configuration
  P: DriveConfig; // Puce drive configuration
  interval: number; // Update interval in milliseconds
  maxHistorySamples: number; // How many history samples to keep
}

export interface DriveHistoryEntry {
  timestamp: number;
  O: number;
  P: number;
  state: string; // Drive state at this point in time
}
