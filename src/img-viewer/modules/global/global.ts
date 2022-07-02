import ModuleBase from '../module-base';
import { defineDevice } from '../../../assets/utils/device';

export default class Global extends ModuleBase {
  get container() {
    const getContainer = this.moduleOptions?.getContainer;
    return typeof getContainer === 'function' ? getContainer() : null;
  }

  onInitReady() {
    this.bindEvents();
  }

  destroy(): void {
    this.unbindEvents();
  }

  bindEvents() {
    window.addEventListener('resize', this.onResize);
    const container = this.container;
    if (!this.rootState.isSupportTouch.value) {
      container?.addEventListener('mousemove', this.onMouseMove);
      container?.addEventListener('mouseout', this.onMouseOut);
    }
  }

  unbindEvents() {
    window.removeEventListener('resize', this.onResize);
    const container = this.container;
    if (!this.rootState.isSupportTouch.value) {
      container?.removeEventListener('mousemove', this.onMouseMove);
      container?.removeEventListener('mouseout', this.onMouseOut);
    }
  }

  onResize = () => {
    const currentDevice = defineDevice();
    if (currentDevice !== this.rootState.deviceType.value) {
      this.rootState.deviceType.set(currentDevice);
    }
  }

  onMouseMove = () => {
    this.eventEmitter.emit(this.Events.Module_MouseEvent, {
      event: 'MouseMove'
    });
  }

  onMouseOut = () => {
    this.eventEmitter.emit(this.Events.Module_MouseEvent, {
      event: 'MouseOut'
    });
  }
}
