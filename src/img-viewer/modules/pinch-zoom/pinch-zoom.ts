import ModuleBase from '../module-base';
import { TouchEvents } from '../../../assets/utils/touch';
import type {
  TapEventCenterData,
  PinchEventData,
} from '../../index.d';

export default class ModalContainer extends ModuleBase {
  lastCenter: TapEventCenterData | null = null;

  onInitReady() {
    this._init();
  }

  _init() {
    if (this.rootState.isSupportTouch.value) {
      this.moduleOptions.eventEmitter.on(this.moduleOptions.Events.Module_TouchEvent, this.onTouchEvent);
    }
  }

  onTouchEvent = (e: unknown) => {
    const { event, data } = e as { event: string, data: unknown };
    switch (event) {
    case TouchEvents.Pinch: {
      this.onPinch(data);
      break;
    }
    case TouchEvents.DoubleTap: {
      this.onDoubleTap();
      break;
    }
    }
  }

  onPinch = (data: unknown = {}) => {
    const { center } = data as PinchEventData;
    let scale = (data  as PinchEventData).scale;
    if (typeof scale !== 'number') {
      return;
    }
    if (scale < 1) {
      scale = 1;
    } else if (scale > 5) {
      scale = 5;
    }
    this.zoneState?.scaleCenter.set(center);
    this.zoneState?.scaleRate.set(scale);
  }

  onDoubleTap = () => {
    const scaleRate = this.zoneState.scaleRate.value;
    if (scaleRate === 1) {
      this.zoneState.scaleRate.tweened(3);
    } else {
      this.zoneState.scaleRate.tweened(1);
    }
  }

  destroy() {
    if (this.rootState.isSupportTouch.value) {
      this.moduleOptions.eventEmitter.off(this.moduleOptions.Events.Module_TouchEvent, this.onTouchEvent);
    }
  }
}
