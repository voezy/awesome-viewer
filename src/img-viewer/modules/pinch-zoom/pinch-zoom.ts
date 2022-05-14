import { TouchHandler } from '../../../assets/utils/touch';
import type {
  Module,
  ModuleOptions,
  TapEventCenterData,
  PinchEventData,
} from '../../index.d';

export default class ModalContainer implements Module {
  name: string;

  moduleOptions: ModuleOptions;

  touchHandler: TouchHandler | null = null;

  lastCenter: TapEventCenterData | null = null;

  constructor(name: string, options: ModuleOptions) {
    this.name = name;
    this.moduleOptions = options;
  }

  get rootStore() {
    return this.moduleOptions.store;
  }

  get rootState() {
    return this.rootStore?.state;
  }

  get container() {
    const getContainer = this.moduleOptions?.getContainer;
    return typeof getContainer === 'function' ? getContainer() : null;
  }

  _init() {
    this.touchHandler = new TouchHandler({ el: this.container as HTMLElement });
    this.touchHandler.on('pinch', this.onPinch);
    this.touchHandler.on('touchEnd', this.onTouchEnd);
    this.touchHandler.on('touchCancel', this.onTouchCancel);
    this.touchHandler.on('doubleTap', this.onDoubleTap);
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
    this.rootState?.scaleCenter.set(center);
    this.rootState?.scaleRate.set(scale);
  }

  onDoubleTap = () => {
    const scaleRate = this.rootState.scaleRate.value;
    if (scaleRate === 1) {
      this.rootState.scaleRate.tweened(3);
    } else {
      this.rootState.scaleRate.tweened(1);
    }
  }

  onTouchEnd = () => {
    this.touchHandler && (this.touchHandler.baseScaleRate = this.rootState?.scaleRate.value);
  }

  onTouchCancel = () => {
    this.touchHandler && (this.touchHandler.baseScaleRate = this.rootState?.scaleRate.value);
  }

  destroy() {
    this.touchHandler?.off('pinch', this.onPinch);
    this.touchHandler?.off('touchEnd', this.onTouchEnd);
    this.touchHandler?.off('touchCancel', this.onTouchCancel);
    this.touchHandler?.off('doubleTap', this.onDoubleTap);
    this.touchHandler?.destroy();
  }
}
