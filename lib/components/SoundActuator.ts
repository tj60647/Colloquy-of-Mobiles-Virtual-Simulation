/**
 * SoundActuator.ts
 *
 * Actuator that simulates emitting sound with a specific intensity.
 * Used for audio feedback and interaction.
 */

import { ActuatorBase } from './ActuatorBase';
import { Transform, Euler } from '../Transform';
import { Vector3 } from '../math/Vector3';

export class SoundActuator extends ActuatorBase {
  private _soundIntensity: number = 1.0;

  constructor(
    parent: Transform | null,
    localPosition: Vector3 | { x: number; y: number; z: number },
    localOrientation: Euler,
    fieldOfView: number
  ) {
    super(parent, localPosition, localOrientation, fieldOfView);
  }

  get soundIntensity(): number {
    return this._soundIntensity;
  }
  set soundIntensity(v: number) {
    if (v < 0 || v > 1) throw new Error('SoundActuator: soundIntensity must be between 0 and 1');
    this._soundIntensity = v;
  }

  emitSound(): number {
    return this._soundIntensity;
  }

  // Abstract implementation
  act(): void {
    // Placeholder for audio emission logic
  }

  toJSON() {
    return {
      ...super.toJSON(),
      soundIntensity: this._soundIntensity,
    };
  }

  static fromJSON(json: any, parent: Transform | null = null): SoundActuator {
    const actuator = new SoundActuator(
      parent,
      json.localPosition,
      json.localOrientation,
      json.fieldOfView
    );
    actuator.soundIntensity = json.soundIntensity;
    return actuator;
  }
}
