import type {
  Module,
  ModuleOptions,
} from '../image-viewer';
import type EventEmitter from 'events';

export default class ModuleBase implements Module {
  name: string;

  moduleOptions: ModuleOptions;

  get rootStore() {
    return this.moduleOptions.store;
  }

  get rootState() {
    return this.rootStore.rootState;
  }

  get zoneState() {
    return this.rootStore?.zoneState;
  }

  get eventEmitter(): EventEmitter {
    return this.moduleOptions.eventEmitter;
  }

  get Events() {
    return this.moduleOptions.Events;
  }

  get toMount() {
    return this.moduleOptions.toMount;
  }

  constructor(name: string, options: ModuleOptions) {
    this.name = name;
    this.moduleOptions = options;
  }

  onInitReady() {
    return;
  }

  destroy(): void {
    return;
  }

  getNewZIndex() {
    const zIndex = this.rootStore.rootState.layerIndex.value + 1;
    this.rootStore.rootState.layerIndex.set(zIndex);
    return zIndex;
  }
}
