import type { MotionPoint } from '../../../lib/subsystems/MotionProfile';

export interface MotionProfileParams {
  totalDistance: number;
  maxVelocity: number;
  maxAcceleration: number;
  timestep: number;
  yoyoMode: boolean;
}

export interface MotionProfileSnapshot {
  params: MotionProfileParams;
  profile: MotionPoint[];
  currentIndex: number;
  isPaused: boolean;
}

export type MotionProfileListener = (snapshot: MotionProfileSnapshot) => void;
