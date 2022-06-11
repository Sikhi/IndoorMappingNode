import * as EventEmitter from 'node:events';

export class TBase extends EventEmitter {
  _options: any;
  
  constructor(options:any) {
    super(options);
    this._options = options || {};
    Object.assign(this, options);
  }
}
