/**
 * ActuatorBase.ts
 *
 * Base class for all actuators, extending Transform.
 * Implements Field of View logic for interaction.
 */

import { Transform, Euler } from '../Transform';
import { Vector3 } from '../math/Vector3';

export class ActuatorBase extends Transform {
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
      throw new Error('ActuatorBase: fieldOfView must be between 0 and 180 degrees');
    }
  }

  get fieldOfView(): number {
    return this._fieldOfView;
  }
  set fieldOfView(v: number) {
    if (v <= 0 || v > 180)
      throw new Error('ActuatorBase: fieldOfView must be between 0 and 180 degrees');
    this._fieldOfView = v;
    this._cosHalfFOV = Math.cos(Vector3.toRadians(v / 2));
  }

  act(param?: any): any {
    throw new Error('act() method should be implemented by subclasses');
  }

  isInFieldOfView(point: Vector3): boolean {
    const globalPos = this.getGlobalPosition();
    const vToP = Vector3.sub(point, globalPos);

    const distSq = vToP.lengthSq();
    if (distSq < 0.000001) return true;

    vToP.normalize();

    const forward = this.getGlobalForwardVector();
    const dot = forward.dot(vToP);
    return dot >= this._cosHalfFOV;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      fieldOfView: this._fieldOfView,
    };
  }

  static fromJSON(json: any, parent: Transform | null = null): ActuatorBase {
    return new ActuatorBase(parent, json.localPosition, json.localOrientation, json.fieldOfView);
  }
}
