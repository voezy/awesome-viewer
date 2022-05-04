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
    this.touchHandler.on('pinchEnd', this.onPinchEnd);
    this.touchHandler.on('pinchCancel', this.onPinchCancel);
    this.touchHandler.on('doubleTap', this.onDoubleTap);
  }

  onInitReady() {
    this._init();
  }

  onPinch = (data: unknown = {}) => {
    const { scale, center } = data as PinchEventData;
    if (typeof scale !== 'number') {
      return;
    }
    if (scale < 1 || scale > 5) {
      return;
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

  onPinchEnd = () => {
    this.touchHandler && (this.touchHandler.baseScaleRate = this.rootState?.scaleRate.value);
  }

  onPinchCancel = () => {
    this.touchHandler && (this.touchHandler.baseScaleRate = this.rootState?.scaleRate.value);
  }

  destroy() {
    this.touchHandler?.off('pinch', this.onPinch);
    this.touchHandler?.off('pinchEnd', this.onPinchEnd);
    this.touchHandler?.off('pinchCancel', this.onPinchCancel);
    this.touchHandler?.off('doubleTap', this.onDoubleTap);
    this.touchHandler?.destroy();
  }
}
