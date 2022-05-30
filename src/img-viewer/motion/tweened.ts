import { get } from 'svelte/store';
import { tweened } from 'svelte/motion';
import type { Tweened } from 'svelte/motion';
import type { TweenedOptions } from '../index.d';

type OnUpdate = (value: number) => void;
type OnFinish = (value: number) => void;

interface TweendMotionOptions {
  value: number;
  onUpdate: OnUpdate;
  onFinish?: OnFinish;
}

export default class TweenedMotion {
  _originValue = NaN;

  _tweened: Tweened<number> | null = null;

  _options: TweendMotionOptions | null = null;

  constructor(options: TweendMotionOptions) {
    const { value } = options;
    this._originValue = value;
    this._options = options;
  }

  to(targetValue: number, tweenedOptions: TweenedOptions) {
    const onInnerUpdate = (newVal: number) => {
      if (this._options?.onUpdate) {
        this._options.onUpdate(newVal);
      }
      if (newVal === targetValue && this._options?.onFinish) {
        this._options?.onFinish(newVal);
      }
    };
    this.stop();
    this._tweened = tweened(this._originValue, tweenedOptions);
    this._tweened?.subscribe(onInnerUpdate);
    void this._tweened?.set(targetValue, tweenedOptions);
  }

  stop() {
    if (this._tweened) {
      void this._tweened.set(get(this._tweened));
    }
  }
}

