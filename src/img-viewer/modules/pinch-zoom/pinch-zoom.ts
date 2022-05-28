import ModuleBase from '../module-base';
import { TouchHandler } from '../../../assets/utils/touch';
import type {
  TapEventCenterData,
  PinchEventData,
} from '../../index.d';

export default class ModalContainer extends ModuleBase {
  touchHandler: TouchHandler | null = null;

  lastCenter: TapEventCenterData | null = null;

  get container() {
    const getContainer = this.moduleOptions?.getContainer;
    return typeof getContainer === 'function' ? getContainer() : null;
  }

  _init() {
    this.touchHandler = new TouchHandler({ el: this.container as HTMLElement });
    this.touchHandler.on(this.touchHandler.Events.Pinch, this.onPinch);
    this.touchHandler.on(this.touchHandler.Events.TouchEnd, this.onTouchEnd);
    this.touchHandler.on(this.touchHandler.Events.TouchCancel, this.onTouchCancel);
    this.touchHandler.on(this.touchHandler.Events.DoubleTap, this.onDoubleTap);
  }

  onInitReady() {
    this._init();
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

  onTouchEnd = () => {
    this.touchHandler && (this.touchHandler.baseScaleRate = this.zoneState?.scaleRate.value);
  }

  onTouchCancel = () => {
    this.touchHandler && (this.touchHandler.baseScaleRate = this.zoneState?.scaleRate.value);
  }

  destroy() {
    this.touchHandler?.off(this.touchHandler.Events.Pinch, this.onPinch);
    this.touchHandler?.off(this.touchHandler.Events.TouchEnd, this.onTouchEnd);
    this.touchHandler?.off(this.touchHandler.Events.TouchCancel, this.onTouchCancel);
    this.touchHandler?.off(this.touchHandler.Events.DoubleTap, this.onDoubleTap);
    this.touchHandler?.destroy();
  }
}
