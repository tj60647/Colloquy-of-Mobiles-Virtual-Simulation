/**
 * SoundSensor.ts
 *
 * Sensor that detects sound intensity within its field of view.
 */

import { SensorBase } from './SensorBase';
import { Transform, Euler } from '../Transform';
import { Vector3 } from '../math/Vector3';

export class SoundSensor extends SensorBase {
  constructor(
    parent: Transform | null,
    localPosition: Vector3 | { x: number; y: number; z: number },
    localOrientation: Euler,
    fieldOfView: number
  ) {
    super(parent, localPosition, localOrientation, fieldOfView);
  }

  /**
   * Senses the sound level using the provided callback.
   */
  sense(getSoundLevelCallback: (sensor: SoundSensor) => number): number {
    if (typeof getSoundLevelCallback !== 'function') {
      throw new Error('A valid callback function must be provided to sense sound level.');
    }
    return getSoundLevelCallback(this);
  }
}
