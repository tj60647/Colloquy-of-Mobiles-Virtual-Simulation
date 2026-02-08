/**
 * Sensor Event Types
 * Events published by sensor stations to the simulation server
 */

export interface LightEvent {
  type: 'light';
  sensorId: string;
  intensity: number; // 0-1, normalized brightness
  zone?: number; // Optional zone identifier for multi-zone sensors
  timestamp: number; // Unix timestamp in milliseconds
}

export interface SoundEvent {
  type: 'sound';
  sensorId: string;
  frequencies: FrequencyPeak[]; // FFT frequency analysis results
  timestamp: number;
}

export interface FrequencyPeak {
  frequency: number; // Hz
  amplitude: number; // 0-1, normalized amplitude
}

export type SensorEvent = LightEvent | SoundEvent;
