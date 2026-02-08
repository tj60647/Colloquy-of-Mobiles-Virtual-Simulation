/**
 * Mobile State Types
 * Based on canonical terminology from docs/terminology.md
 */

export type MobileType = 'Male' | 'Female' | 'Bar';

export type BehavioralState = 'SatisfiedAndInert' | 'SatisfactionSearch' | 'EngagingPartner';

export type DriveState = 'Satisfied' | 'Unsatisfied';

export interface DriveValues {
  O: number; // Orange drive (0-max)
  P: number; // Puce drive (0-max)
}

export interface MobileState {
  id: string;
  type: MobileType;
  position: Vector3D;
  orientation: Vector3D;
  behavioralState: BehavioralState;
  drives?: DriveValues; // Optional: Bar doesn't have drives
  dominantDrive?: 'O' | 'P'; // Which drive is higher
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
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
