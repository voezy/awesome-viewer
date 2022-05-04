import { writable, get } from 'svelte/store';
import { tweened } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';

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

  tweened(value: T) {
    const tweenedValue = tweened(this.value, {
      duration: 350,
      easing: cubicOut
    });
    tweenedValue.subscribe(() => {
      this.set(get(tweenedValue));
    });
    void tweenedValue.set(value);
  }
}

export function createState<T>(value: T): StateValue<T> {
  return new StateValue(value);
}
