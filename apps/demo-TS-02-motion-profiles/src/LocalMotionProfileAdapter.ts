import { MotionProfile, MotionPoint } from '../../../lib/subsystems/MotionProfile';
import type { MotionProfileListener, MotionProfileParams, MotionProfileSnapshot } from './motionProfileContracts';

export class LocalMotionProfileAdapter {
  private params: MotionProfileParams;
  private profile: MotionPoint[] = [];
  private currentIndex = 0;
  private isPaused = false;
  private listeners: MotionProfileListener[] = [];

  constructor(initialParams?: Partial<MotionProfileParams>) {
    this.params = {
      totalDistance: 120,
      maxVelocity: 15,
      maxAcceleration: 15,
      timestep: 1 / 40,
      yoyoMode: true,
      ...initialParams,
    };

    this.regenerateProfile();
  }

  subscribe(listener: MotionProfileListener): () => void {
    this.listeners.push(listener);
    listener(this.getSnapshot());

    return () => {
      this.listeners = this.listeners.filter((candidate) => candidate !== listener);
    };
  }

  getSnapshot(): MotionProfileSnapshot {
    return {
      params: { ...this.params },
      profile: this.profile,
      currentIndex: this.currentIndex,
      isPaused: this.isPaused,
    };
  }

  setDistance(totalDistance: number): void {
    this.params.totalDistance = totalDistance;
    this.regenerateProfile();
  }

  setMaxVelocity(maxVelocity: number): void {
    this.params.maxVelocity = maxVelocity;
    this.regenerateProfile();
  }

  setMaxAcceleration(maxAcceleration: number): void {
    this.params.maxAcceleration = maxAcceleration;
    this.regenerateProfile();
  }

  setYoyoMode(yoyoMode: boolean): void {
    this.params.yoyoMode = yoyoMode;
    this.reset();
  }

  togglePause(): void {
    this.isPaused = !this.isPaused;
    this.emit();
  }

  setPaused(isPaused: boolean): void {
    this.isPaused = isPaused;
    this.emit();
  }

  reset(): void {
    this.currentIndex = 0;
    this.regenerateProfile();
  }

  step(): void {
    if (this.isPaused || this.profile.length === 0) {
      return;
    }

    this.currentIndex += 1;
    if (this.currentIndex >= this.profile.length) {
      this.currentIndex = 0;
    }

    this.emit();
  }

  private regenerateProfile(): void {
    const { totalDistance, maxVelocity, maxAcceleration, timestep, yoyoMode } = this.params;

    if (yoyoMode) {
      const forward = new MotionProfile(totalDistance, maxVelocity, maxAcceleration, 0.0, timestep, 0.0);
      const reverse = new MotionProfile(totalDistance, maxVelocity, maxAcceleration, 0.0, timestep, 0.0);

      const combinedProfile: MotionPoint[] = [];

      forward.profile.forEach((point) => {
        combinedProfile.push({ ...point });
      });

      reverse.profile.forEach((point) => {
        combinedProfile.push({
          position: totalDistance - point.position,
          velocity: -point.velocity,
          acceleration: -point.acceleration,
          jerk: -point.jerk,
        });
      });

      this.profile = combinedProfile;
    } else {
      const profile = new MotionProfile(totalDistance, maxVelocity, maxAcceleration, 0.0, timestep, 0.0);
      this.profile = profile.profile;
    }

    this.currentIndex = 0;
    this.emit();
  }

  private emit(): void {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  }
}
