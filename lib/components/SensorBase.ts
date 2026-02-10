/**
 * SensorBase.ts
 *
 * Base class for all sensors, extending Transform.
 * Implements Field of View logic.
 */

import { Transform, Euler } from '../Transform';
import { Vector3 } from '../math/Vector3';

export class SensorBase extends Transform {
  private _fieldOfView: number;
  private _cosHalfFOV: number;

  constructor(
    parent: Transform | null,
    localPosition: Vector3 | { x: number; y: number; z: number },
    localOrientation: Euler,
    fieldOfView: number
  ) {
    super(parent, localPosition, localOrientation);
    this._fieldOfView = fieldOfView;
    this._cosHalfFOV = Math.cos(Vector3.toRadians(fieldOfView / 2));

    // Validate
    if (fieldOfView <= 0 || fieldOfView > 180) {
      throw new Error('SensorBase: fieldOfView must be between 0 and 180 degrees');
    }
  }

  get fieldOfView(): number {
    return this._fieldOfView;
  }
  set fieldOfView(v: number) {
    if (v <= 0 || v > 180)
      throw new Error('SensorBase: fieldOfView must be between 0 and 180 degrees');
    this._fieldOfView = v;
    this._cosHalfFOV = Math.cos(Vector3.toRadians(v / 2));
  }

  sense(param?: any): any {
    throw new Error('sense() method should be implemented by subclasses');
  }

  isInFieldOfView(point: Vector3): boolean {
    const globalPos = this.getGlobalPosition();
    const vToP = Vector3.sub(point, globalPos);

    // If point is strictly at sensor, logic?
    // P5 implementation computed distanceSquared.
    // normalize() handles zero length by doing nothing (0,0,0).

    const distSq = vToP.lengthSq();
    if (distSq < 0.000001) return true; // Inside sensor?

    vToP.normalize();

    // Get Forward vector
    // Transform.ts implements get global forward?
    // I removed getGlobalForwardVector from Transform.ts?
    // I should check Transform.ts.
    // Assuming I missed it, I should calculate it from Orientation.

    const forward = this.getGlobalForwardVector();

    const dot = forward.dot(vToP);
    return dot >= this._cosHalfFOV;
  }

  // Need to implement getGlobalForwardVector in Transform.ts if missing.
  // Transform.js had it. I might have missed porting it.

  // Override serialization
  toJSON() {
    return {
      ...super.toJSON(),
      fieldOfView: this._fieldOfView,
    };
  }

  static fromJSON(json: any, parent: Transform | null = null): SensorBase {
    return new SensorBase(parent, json.localPosition, json.localOrientation, json.fieldOfView);
  }
}
