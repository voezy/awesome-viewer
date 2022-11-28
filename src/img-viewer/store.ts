import { writable, get } from 'svelte/store';
import { tweened } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';
import type { TweenedOptions } from './image-viewer';
import type { Tweened } from 'svelte/motion';

import type { Writable } from 'svelte/store';
import type { Unsubscriber } from './image-viewer';

export class StateValue<T> {
  _value: Writable<T>;

  _tweened: Tweened<T> | null = null;

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

  tweened(value: T, tweenedOptions?: TweenedOptions) {
    if (this._tweened && typeof this.value === 'number') {
      void this._tweened.set(this.value);
    }
    tweenedOptions = Object.assign({
      duration: 350,
      easing: cubicOut,
    }, tweenedOptions);
    const tweenedValue = tweened(this.value, tweenedOptions);
    tweenedValue.subscribe((newVal) => {
      this.set(newVal);
      if (newVal === value) {
        this._tweened = null;
      }
    });
    void tweenedValue.set(value);
    this._tweened = tweenedValue;
  }
}

export function createState<T>(value: T): StateValue<T> {
  return new StateValue(value);
}
