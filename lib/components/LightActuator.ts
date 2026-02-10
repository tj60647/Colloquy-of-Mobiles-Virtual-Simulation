/**
 * LightActuator.ts
 *
 * Actuator that simulates emitting light with a specific intensity.
 */

import { ActuatorBase } from './ActuatorBase';
import { Transform, Euler } from '../Transform';
import { Vector3 } from '../math/Vector3';

export class LightActuator extends ActuatorBase {
  private _lightIntensity: number = 1.0;

  constructor(
    parent: Transform | null,
    localPosition: Vector3 | { x: number; y: number; z: number },
    localOrientation: Euler,
    fieldOfView: number
  ) {
    super(parent, localPosition, localOrientation, fieldOfView);
  }

  get lightIntensity(): number {
    return this._lightIntensity;
  }
  set lightIntensity(v: number) {
    if (v < 0 || v > 1) throw new Error('LightActuator: lightIntensity must be between 0 and 1');
    this._lightIntensity = v;
  }

  emitLight(): number {
    return this._lightIntensity;
  }

  // Abstract implementation
  act(): void {
    // Placeholder for future logic (e.g. visualizing light emission)
  }

  toJSON() {
    return {
      ...super.toJSON(),
      lightIntensity: this._lightIntensity,
    };
  }

  static fromJSON(json: any, parent: Transform | null = null): LightActuator {
    const actuator = new LightActuator(
      parent,
      json.localPosition,
      json.localOrientation,
      json.fieldOfView
    );
    actuator.lightIntensity = json.lightIntensity;
    return actuator;
  }
}
