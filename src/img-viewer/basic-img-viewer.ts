import * as Events from 'events';
import { createState } from './store';
import ImgZone from './components/img-zone.svelte';
import { Events as ImgEvents } from './events';
import Motion from './motion/';
import { defineDevice } from '../assets/utils/device';
import { isSupportTouch } from '../assets/utils/browser';
import { isArray, isString } from '../assets/utils/type';
import type {
  BasicImgViewerOptions,
  ImgViewerState,
  NewableModule,
  Module,
  ZoneStateEnum,
  ModuleState,
  ImgViewerStore,
  Unsubscriber,
  ImgItem,
} from './image-viewer';
import type { StateValue } from './store';
import './assets/scss/basic-image-viewer.scss';

export default class BasicImgViewer {
  _options: BasicImgViewerOptions;

  _container: HTMLElement | null = null;

  _contentLayer: HTMLElement | null = null;

  _toolLayer: HTMLElement | null = null;

  _modalLayer: HTMLElement | null = null;

  _imgZone: ImgZone | null = null;

  _eventEmitter: Events | null = new Events.EventEmitter();

  store: ImgViewerStore;

  _unsubscriber: Unsubscriber[] = [];

  Events: typeof ImgEvents = ImgEvents;

  modules: { [key: string]: Module } = {}

  constructor(options: BasicImgViewerOptions) {
    this._options = options;
    this.store = this.getDefaultStore();
  }

  getDefaultStore(): ImgViewerStore {
    return {
      zoneState: {
        src: createState(''),
        scaleRate: createState(1),
        rotateDeg: createState(0),
        scaleCenter: createState(null),
      },
      imgData: {
        width: createState(null),
        height: createState(null),
      },
      rootState: {
        layerIndex: createState(1),
        deviceType: createState(defineDevice()),
        isSupportTouch: createState(isSupportTouch),
        description: createState(''),
        list: createState([] as ImgItem[]),
        curImgIndex: createState(0),
      },
      modules: {},
    };
  }

  init() {
    this._initContainer();
    this._initEventEmitter();
    this._initStore();
    if (!this._container) {
      console.warn('Container element must be set');
      return;
    }
    this._initComp();
    this._initEvents();
    this.onInitReady();
  }

  _initContainer() {
    const options = this._options || {};
    const { el } = options;
    let container;
    if (el instanceof HTMLElement) {
      container = el;
    } else if (typeof el === 'string') {
      container = document.querySelector(el);
    } else {
      container = document.body;
    }
    if (container instanceof HTMLElement) {
      this._container = container;
      this._initLayers();
    }
  }

  _initLayers() {
    const layers = ['content', 'tool', 'modal'];
    layers.forEach((type) => {
      if (!this._container) { return; }
      const layer = document.createElement('div');
      layer.classList.add(`as-basic-image-viewer__${type}-layer`);
      this._container.appendChild(layer);
      switch (type) {
      case 'content':
        this._contentLayer = layer;
        break;
      case 'tool':
        this._toolLayer = layer;
        break;
      case 'modal':
        this._modalLayer = layer;
        break;
      }
    });
  }

  _initStore() {
    const optionsState = this._options.imgState || {} as ImgViewerState;
    const state = this.store.zoneState;

    this.updateState(optionsState);
    for (const key in state) {
      const targetState = state[key as ZoneStateEnum] as StateValue<unknown>;
      const unsubscriber = targetState?.subscribe((value: unknown) => {
        this._updateProps({ [key]: value });
      });
      this._unsubscriber.push(unsubscriber);
    }
  }

  _cleanStore() {
    this._unsubscriber?.forEach((unsubscriber) => {
      unsubscriber();
    });
    this.store = this.getDefaultStore();
  }

  _initComp() {
    const { src, rotateDeg, scaleRate } = this.store.zoneState;
    this._imgZone = new ImgZone({
      target: this._contentLayer as HTMLElement,
      props: {
        src: src.value,
        rotateDeg: rotateDeg.value,
        scaleRate: scaleRate.value,
        scaleCenter: null,
      }
    });
  }

  _initEventEmitter() {
    this._eventEmitter?.setMaxListeners(20);
  }

  _initEvents() {
    this.on(this.Events.Module_ToRecover, this.toRecover);
    this.on(this.Events.Module_SwitchToIndex, this.onSwitchToIndex);
    this._imgZone?.$on('gestureEvent', this._onZoneGestureEvent);
    this._imgZone?.$on('imgData', this._onImgData);
  }

  _clearEvents() {
    this.off(this.Events.Module_ToRecover, this.toRecover);
    this.on(this.Events.Module_SwitchToIndex, this.onSwitchToIndex);
  }

  updateState(newViewerState: ImgViewerState) {
    if (!newViewerState) { return; }
    const zoneState = this.store.zoneState;
    const { description, list } = newViewerState;
    const src = newViewerState.src || list?.[0].src || '';
    if (src !== zoneState.src.value) {
      src && zoneState.src.set(src);
      const list = this.store.rootState.list.value;
      const index = list?.length > 0 ? list.findIndex((item) => item.src === src) : 0;
      this.store.rootState.curImgIndex.set(index);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      this._imgZone?.init();
    }
    if (isArray(list)) {
      this.store.rootState.list.set(list as ImgItem[]);
    }
    if (isString(description)) {
      this.store.rootState.description.set(description as string);
    }
  }

  _updateProps(props: { [key: string]: unknown }) {
    this._imgZone?.$set(props);
  }

  invokeZone = (method: string, ...args: unknown[]) => {
    if (this._imgZone && typeof this._imgZone[method] === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      this._imgZone[method](...args);
    }
  }

  toMount = (el: HTMLElement, type: string) => {
    switch (type) {
    case 'content':
      this._contentLayer?.appendChild(el);
      break;
    case 'tool':
      this._toolLayer?.appendChild(el);
      break;
    case 'modal':
      this._modalLayer?.appendChild(el);
      break;
    }
  }

  onInitReady() {
    for (const moduleName in this.modules) {
      const module = this.modules[moduleName];
      typeof module.onInitReady === 'function' && (module.onInitReady());
    }
  }

  _onZoneGestureEvent = (e: unknown) => {
    const { detail } = e as { detail: unknown };
    const { event, data } = detail as { event: string, data: unknown };
    this._eventEmitter?.emit(this.Events.Module_GestureEvent, {
      event,
      data
    });
  }

  _onImgData = (e: unknown) => {
    const { detail } = e as { detail: unknown };
    const { width, height } = detail as { width: number, height: number };
    this.store.imgData.height.set(height);
    this.store.imgData.width.set(width);
    this._eventEmitter?.emit(this.Events.Module_ImgData, { width, height });
  }

  toRecover = () => {
    this.store.zoneState.rotateDeg.set(0);
    this.store.zoneState.scaleRate.tweened(1);
  };

  onSwitchToIndex = (data: unknown) => {
    const targetIndex = (data as { index: number }).index;
    const listLen = this.store.rootState.list.value.length;
    if (typeof targetIndex !== 'number' || !listLen) {
      return;
    }
    if (targetIndex >= 0 && targetIndex < listLen) {
      const imgItem = this.store.rootState.list.value[targetIndex];
      this.toRecover();
      this.store.rootState.curImgIndex.set(targetIndex);
      this.store.zoneState.src.set(imgItem.src);
      this.store.rootState.description.set(imgItem.desc || '');
    }
  }

  on(eventName: string | symbol, listener: (...args: unknown[]) => void) {
    return this._eventEmitter?.on(eventName, listener);
  }

  off(eventName: string | symbol, listener: (...args: unknown[]) => void) {
    return this._eventEmitter?.off(eventName, listener);
  }

  emit(eventName: string | symbol, ...args: unknown[]) {
    return this._eventEmitter?.emit(eventName, ...args);
  }

  destroy() {
    this.destroyModules();
    this._clean();
  }

  _clean() {
    this._clearEvents();
    this._eventEmitter?.removeAllListeners();
    this._eventEmitter = null;
    this._imgZone?.$destroy();
    this._cleanStore();
  }

  destroyModules() {
    for (const moduleName in this.modules) {
      const module = this.modules[moduleName];
      typeof module?.destroy === 'function' && module.destroy();
    }
  }

  addModule(name: string, ModuleClass: NewableModule): unknown {
    if (this.modules[name]) {
      console.warn(`Module "${name}" probably conflicts with the other module`);
    }
    const module = new ModuleClass(name, {
      getContainer: () => this._container as HTMLElement,
      toMount: this.toMount,
      options: this._options,
      store: this.store,
      eventEmitter: this._eventEmitter as Events,
      Events: this.Events,
      invokeZone: this.invokeZone,
      Motion: Motion,
    }) as Module;
    this.modules[name] = module;
    if (typeof module.proccessOptions === 'function') {
      this._options = module.proccessOptions(this._options);
    }
    if (typeof module.getDefaultState === 'function') {
      const defaultState = module.getDefaultState();
      const moduleState:ModuleState  = {};
      for (const key in defaultState) {
        moduleState[key] = createState(defaultState[key]);
      }
      this.store.modules[name] = moduleState;
    }
    if (typeof module.extendViewerParams === 'function') {
      const params = module.extendViewerParams();
      for (const paramName in params) {
        if (Object.prototype.hasOwnProperty.call(BasicImgViewer.prototype, paramName)) {
          console.warn(`Module "${name}" param "${paramName}" probably conflicts with the other members`);
        } else {
          Object.defineProperty(BasicImgViewer.prototype, paramName, {
            value: params[paramName]
          });
        }
      }
    }
    return this.modules[name];
  }
}
