import Events from 'events';
import { createState } from './store';
import ImgZone from './components/img-zone.svelte';
import { Events as ImgEvents } from './events';
import type {
  BasicImgViewerOptions,
  ImgViewerState,
  NewableModule,
  Module,
  BasicStateEnum,
  ModuleState,
  ImgViewerStore,
  Unsubscriber,
} from './index.d';

export default class BasicImgViewer {
  _options: BasicImgViewerOptions;

  _container: HTMLElement | null = null;

  _imgZone: ImgZone | null = null;

  _eventEmitter: Events | null = new Events();

  _store: ImgViewerStore;

  _unsubscriber: Unsubscriber[] = [];

  Events: typeof ImgEvents = ImgEvents;

  modules: { [key: string]: Module } = {}

  constructor(options: BasicImgViewerOptions) {
    this._options = options;
    this._store = this.getDefaultStore();
  }

  getDefaultStore(): ImgViewerStore {
    return {
      state: {
        src: createState(''),
        scaleRate: createState(1),
        rotateDeg: createState(0),
      },
      modules: {},
    };
  }

  init() {
    this._initContainer();
    this._initEventEmitter();
    this._initEvents();
    this._initStore();
    if (!this._container) {
      console.warn('Container element must be set');
      return;
    }
    this._initComp();
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
    }
    if (container instanceof HTMLElement) {
      this._container = container;
    } else {
      console.error('Container element not found');
    }
  }

  _initStore() {
    const optionsState = this._options.imgState || {} as ImgViewerState;
    const state = this._store.state;

    this.updateState(optionsState);
    for (const key in state) {
      const targetState = state[key as BasicStateEnum];
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
    this._store = this.getDefaultStore();
  }

  _initComp() {
    const { src, rotateDeg, scaleRate } = this._store.state;
    this._imgZone = new ImgZone({
      target: this._container as HTMLElement,
      props: {
        src: src.value,
        rotateDeg: rotateDeg.value,
        scaleRate: scaleRate.value,
      }
    });
  }

  _initEventEmitter() {
    this._eventEmitter?.setMaxListeners(20);
  }

  _initEvents() {
    this.on(this.Events.Recover, this.onReceiveRecover);
  }

  _clearEvents() {
    this.off(this.Events.Recover, this.onReceiveRecover);
  }

  updateState(newState: ImgViewerState) {
    if (!newState) { return; }
    const state = this._store.state;
    const { src } = newState;
    if (src !== state.src.value) {
      src && state.src.set(src);
      this._imgZone?.init();
    }
  }

  _updateProps(props: { [key: string]: unknown }) {
    this._imgZone?.$set(props);
  }

  onInitReady() {
    for (const moduleName in this.modules) {
      const module = this.modules[moduleName];
      typeof module.onInitReady === 'function' && (module.onInitReady());
    }
  }

  onReceiveRecover = () => {
    this._store.state.rotateDeg.set(0);
    this._store.state.scaleRate.set(1);
  };

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
      options: this._options,
      _store: this._store,
      eventEmitter: this._eventEmitter,
      Events: this.Events,
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
      this._store.modules[name] = moduleState;
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
