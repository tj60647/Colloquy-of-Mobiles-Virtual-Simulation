/**
 * Mobile State Types
 * Based on canonical terminology from docs/terminology.md
 *
 * These types represent the JSON serialization format for network communication
 * and state snapshots. They should align with the toJSON() output of runtime classes.
 */

import { Vector3 } from '../math/Vector3';

export interface TransformState {
  id: number;
  name: string;
  position: { x: number; y: number; z: number };
  rotation: { yaw: number; pitch: number; roll: number };
  scale?: { x: number; y: number; z: number };
  parentId: number | null;
}

export type MobileType = 'Male' | 'Female' | 'Bar';

export type BehavioralState = 'SatisfiedAndInert' | 'SatisfactionSearch' | 'EngagingPartner';

export type DriveState = 'Satisfied' | 'Unsatisfied';

export interface DriveValues {
  O: number; // Orange drive (0-max)
  P: number; // Puce drive (0-max)
}

export interface MobileState {
  id: number;
  name: string;
  localPosition: { x: number; y: number; z: number };
  localOrientation: { yaw: number; pitch: number; roll: number };
  parentId: number | null;
  drives: any; // DriveSubsystem state
  horizontalControl: any; // HorizontalControlSubsystem state
  verticalControl?: any; // VerticalControlSubsystem state (Females only)
  sensors: any[];
  actuators: any[];
  // Computed properties for convenience
  transform?: TransformState; // Full transform state if needed
  type?: MobileType;
  behavioralState?: BehavioralState;
  dominantDrive?: 'O' | 'P';
}

export interface SimulationState {
  mobiles: MobileState[];
  interactions: Interaction[];
  timestamp: number;
}

export interface Interaction {
  mobileA: string; // Mobile ID
  mobileB: string; // Mobile ID
  type: 'O' | 'P'; // Which drive is being satisfied
  startTime: number;
  active: boolean;
}
