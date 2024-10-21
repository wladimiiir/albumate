import { EventEmitter } from 'events';

export class EventManager extends EventEmitter {}

export const eventManager = new EventManager();
