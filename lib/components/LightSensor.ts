/**
 * LightSensor.ts
 *
 * Sensor that detects light intensity within its field of view.
 */

import { SensorBase } from './SensorBase';
import { Transform, Euler } from '../Transform';
import { Vector3 } from '../math/Vector3';

export class LightSensor extends SensorBase {
  constructor(
    parent: Transform | null,
    localPosition: Vector3 | { x: number; y: number; z: number },
    localOrientation: Euler,
    fieldOfView: number
  ) {
    super(parent, localPosition, localOrientation, fieldOfView);
  }

  /**
   * Senses the light intensity using the provided callback.
   * The callback abstracts the environment query logic.
   */
  sense(getLightIntensityCallback: (sensor: LightSensor) => number): number {
    if (typeof getLightIntensityCallback !== 'function') {
      throw new Error('A valid callback function must be provided to sense light intensity.');
    }
    return getLightIntensityCallback(this);
  }
}
