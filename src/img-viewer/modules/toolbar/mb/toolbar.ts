import Toolbar from '../../../components/img-toolbar-mb.svelte';
import { TouchEvents } from '../../../../assets/utils/touch';
import './toolbar.scss';
import type {
  Module,
  ModuleOptions,
} from '../../../index.d';

const rotateList = [0, 90, 180, 270];

export default class ToolbarModule implements Module {
  name: string;

  moduleOptions: ModuleOptions;

  toolbar: Toolbar | null = null;

  el: HTMLElement | null = null;

  _isToolbarShowing = false;

  constructor(name: string, options: ModuleOptions) {
    this.name = name;
    this.moduleOptions = options;
  }

  onInitReady() {
    this.initEl();
    this.initComp();
    this.initEvents();
  }

  get rootStore() {
    return this.moduleOptions.store;
  }

  get rootState() {
    return this.rootStore?.state;
  }


  get curRotateIndex() {
    return rotateList.findIndex((target) => target === this.rootState?.rotateDeg.value);
  }

  get isToolbarShowing() {
    return this._isToolbarShowing;
  }

  set isToolbarShowing(isToolbarShowing: boolean) {
    this._isToolbarShowing = isToolbarShowing;
    if (!this.el) { return; }
    if (isToolbarShowing) {
      this.el.style.display = 'block';
    } else {
      this.el.style.display = 'none';
    }
  }

  get container() {
    const getContainer = this.moduleOptions?.getContainer;
    return typeof getContainer === 'function' ? getContainer() : null;
  }

  initEl() {
    const container = this.container;
    if (container instanceof HTMLElement) {
      this.el = document.createElement('div');
      this.el.classList.add('as-img-viewer-module__toolbar-mb-wrap');
      container.appendChild(this.el);
      this.isToolbarShowing = false;
    }
  }

  initComp() {
    this.toolbar = new Toolbar({
      target: this.el as HTMLElement,
      props: {
        scaleRate: this.rootState?.scaleRate?.value,
      },
    });
  }

  initEvents() {
    this.toolbar?.$on('rotate', this.onClickRotate);
    this.toolbar?.$on('back', this.onClickBack);
    this.moduleOptions.eventEmitter.on(this.moduleOptions.Events.Closed, this.onClosed);
    this.moduleOptions.eventEmitter.on(this.moduleOptions.Events.Module_TouchEvent, this.onTouchEvent);
  }

  clearEvents() {
    this.moduleOptions.eventEmitter.off(this.moduleOptions.Events.Closed, this.onClosed);
    this.moduleOptions.eventEmitter.off(this.moduleOptions.Events.Module_TouchEvent, this.onTouchEvent);
  }

  onTouchEvent = (e: unknown) => {
    const { event } = e as { event: string, data: unknown };
    if (event === TouchEvents.Tap) {
      this.onClickContainer();
    }
  }

  onClosed = () => {
    this.isToolbarShowing = false;
  }

  destroy() {
    this.destroyComp();
    this.clearEvents();
    this.cleanEl();
  }

  cleanEl() {
    this.el && this.container?.removeChild(this.el);
  }

  destroyComp() {
    this.toolbar?.$destroy();
  }

  updateVisible(isToolbarShowing: boolean) {
    this.isToolbarShowing = isToolbarShowing;
  }

  updateProps(props: { [key: string]: unknown }) {
    this.toolbar?.$set(props);
  }

  onClickRotate = () => {
    const nextRotateDeg = rotateList[this.curRotateIndex + 1];
    if (typeof nextRotateDeg === 'number') {
      this.rootState?.rotateDeg.set(nextRotateDeg);
    } else {
      this.rootState?.rotateDeg.set(rotateList[0]);
    }
  }

  onClickBack = () => {
    this.isToolbarShowing = true;
    this.moduleOptions.eventEmitter?.emit(this.moduleOptions.Events.Module_ToClose);
  }

  onClickContainer = () => {
    // if (e.target === this.el || this.el?.contains(e.target as HTMLElement)) { return; }
    this.isToolbarShowing = !this.isToolbarShowing;
  }
}
