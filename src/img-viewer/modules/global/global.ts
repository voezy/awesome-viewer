import ModuleBase from '../module-base';
import { defineDevice } from '../../../assets/utils/device';

export default class Global extends ModuleBase {
  onInitReady() {
    this.bindEvents();
  }

  destroy(): void {
    this.unbindEvents();
  }

  bindEvents() {
    window.addEventListener('resize', this.onResize);
  }

  unbindEvents() {
    window.removeEventListener('resize', this.onResize);
  }

  onResize = () => {
    const currentDevice = defineDevice();
    if (currentDevice !== this.rootState.deviceType.value) {
      this.rootState.deviceType.set(currentDevice);
    }
  }
}
