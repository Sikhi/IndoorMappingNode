import { EventEmitter } from 'node:events';

export class TEventEmitter extends EventEmitter {
    enable: () => void;
    disable: () => void;
    //FIX IT. "any"
    indexOfTouch: (touch:any) => number;
}