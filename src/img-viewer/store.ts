import { writable, get } from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { Unsubscriber } from './index.d';

export class StateValue<T> {
  _value: Writable<T>

  constructor(value: T) {
    this._value = writable(value);
  }

  get value() {
    return get(this._value);
  }

  set value(newValue: T) {
    this.set(newValue);
  }

  set(value: T) {
    this._value.set(value);
  }

  subscribe(cb: (value: T) => unknown): Unsubscriber {
    return this._value.subscribe(cb);
  }
}

export function createState<T>(value: T): StateValue<T> {
  return new StateValue(value);
}
