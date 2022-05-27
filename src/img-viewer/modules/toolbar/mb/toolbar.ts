import { tweened } from 'svelte/motion';
import Toolbar from '../../../components/img-toolbar-mb.svelte';
import { TouchEvents } from '../../../../assets/utils/touch';
import './toolbar.scss';
import type {
  Module,
  ModuleOptions,
} from '../../../index.d';
import type TweenedMotion from '../../../motion/tweened';

const rotateList = [0, 90, 180, 270];

export default class ToolbarModule implements Module {
  name: string;

  moduleOptions: ModuleOptions;

  toolbar: Toolbar | null = null;

  el: HTMLElement | null = null;

  _isToolbarShowing = false;

  _visibilityMotion: TweenedMotion | null = null;

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

  get zoneState() {
    return this.rootStore?.zoneState;
  }


  get curRotateIndex() {
    return rotateList.findIndex((target) => target === this.zoneState?.rotateDeg.value);
  }

  get isToolbarShowing() {
    return this._isToolbarShowing;
  }

  set isToolbarShowing(isToolbarShowing: boolean) {
    this._isToolbarShowing = isToolbarShowing;
    if (!this.el) { return; }
    if (isToolbarShowing) {
      this.showToolBar();
    } else {
      this.hideToolBar();
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
        scaleRate: this.zoneState?.scaleRate?.value,
      },
    });
  }

  initEvents() {
    this.toolbar?.$on('rotate', this.onClickRotate);
    this.toolbar?.$on('back', this.onClickBack);
    this.toolbar?.$on('info', this.onClickInfo);
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
      this.zoneState?.rotateDeg.set(nextRotateDeg);
    } else {
      this.zoneState?.rotateDeg.set(rotateList[0]);
    }
  }

  onClickBack = () => {
    this.isToolbarShowing = true;
    this.moduleOptions.eventEmitter?.emit(this.moduleOptions.Events.Module_ToClose);
  }

  onClickInfo = () => {
    this.moduleOptions.eventEmitter?.emit(this.moduleOptions.Events.Module_ToOpenInfo);
  }

  onClickContainer = () => {
    this.isToolbarShowing = !this.isToolbarShowing;
  }

  showToolBar() {
    if (!this.el) { return; }
    this.el.style.opacity = '0';
    this.el.style.display = 'block';
    if (this._visibilityMotion) {
      this._visibilityMotion?.stop();
    }
    this._visibilityMotion = new this.moduleOptions.Motion.TweenedMotion({
      value: 0,
      onUpdate: (newVal: number) => {
        this.el && (this.el.style.opacity = String(newVal));
      }
    });
    this._visibilityMotion.to(1, {
      duration: 200
    });
  }

  hideToolBar() {
    if (!this.el) { return; }
    this.el.style.opacity = '1';
    this.el.style.display = 'block';
    if (this._visibilityMotion) {
      this._visibilityMotion?.stop();
    }
    this._visibilityMotion = new this.moduleOptions.Motion.TweenedMotion({
      value: 1,
      onUpdate: (newVal: number) => {
        this.el && (this.el.style.opacity = String(newVal));
      },
      onFinish: () => {
        this.el && (this.el.style.display = 'none');
      }
    });
    this._visibilityMotion.to(0, {
      duration: 200
    });
  }
}
