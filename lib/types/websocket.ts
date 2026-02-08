/**
 * WebSocket Message Types
 * 
 * Defines the message protocol for communication between:
 * - **Sensor Stations** (physical hardware) → Server (sensor events)
 * - **Server** → Viewing Lenses (state updates)
 * - **Dashboard** ↔ Server (monitoring/control)
 * 
 * Architecture:
 * ```
 * [Sensor Stations] --sensor_event--> [Simulation Server] --state_update--> [Viewing Lenses]
 *                                            ↕
 *                                       [Dashboard]
 * ```
 * 
 * @see types/events.ts - Sensor event payloads
 * @see types/state.ts - Simulation state structure
 */

import { SensorEvent } from './events';
import { SimulationState } from './state';

export type ClientType = 'sensor' | 'renderer' | 'dashboard';

export interface ClientRegistration {
  type: 'register';
  clientType: ClientType;
  clientId: string;
}

export interface SensorMessage {
  type: 'sensor_event';
  event: SensorEvent;
}

export interface StateUpdateMessage {
  type: 'state_update';
  state: SimulationState;
}

export interface ErrorMessage {
  type: 'error';
  message: string;
  code?: string;
}

export type WebSocketMessage =
  | ClientRegistration
  | SensorMessage
  | StateUpdateMessage
  | ErrorMessage;
