/**
 * WebSocket Message Types
 * For communication between sensor stations, simulation server, and viewing lenses
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
