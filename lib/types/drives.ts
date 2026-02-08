/**
 * Drive System Configuration Types
 * 
 * Based on canonical terminology from docs/terminology.md
 * 
 * These types define the configuration schema for the Drive Subsystem,
 * which models Pask's "Entropy Drives" (Orange and Puce).
 * 
 * @see DriveSubsystem.ts - Runtime implementation
 * @see Drive.ts - Individual drive implementation
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

// Temporary compatibility enum for legacy visualization code
export const LegacyDriveState = {
  SATISFIED_AND_INDIFFERENT: 'satisfied_and_indifferent',
  O_SATISFACTION_SEARCH: 'O_satisfaction_search',
  P_SATISFACTION_SEARCH: 'P_satisfaction_search',
  EITHER_O_OR_P_SATISFACTION_SEARCH: 'either_O_or_P_satisfaction_search',
  UNKNOWN: 'unknown',
} as const;

export type LegacyDriveStateType = typeof LegacyDriveState[keyof typeof LegacyDriveState];
