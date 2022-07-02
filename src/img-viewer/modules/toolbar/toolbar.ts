import ModuleBase from '../module-base';
import Toolbar from '../../components/img-toolbar-container.svelte';
import { TouchEvents } from '../../../assets/utils/touch';
import { download } from '../../../assets/utils/net';
import type TweenedMotion from '../../motion/tweened';

const scaleRateList = [1, 1.5, 2, 2.5, 3, 3.5, 4, 5];
const rotateList = [0, 90, 180, 270];

export default class ToolbarModule extends ModuleBase {
  toolbar: Toolbar | null = null;

  el: HTMLElement | null = null;

  toolbarTimer: number | null = null;

  _isToolbarShowing = false;

  _visibilityMotion: TweenedMotion | null = null;

  onInitReady() {
    this.initEl();
    this.initComp();
    this.initEvents();
    this.subscribeStore();
  }

  get curRotateIndex() {
    return rotateList.findIndex((target) => target === this.zoneState?.rotateDeg.value);
  }

  get curScaleIndex() {
    const curScaleRate = this.zoneState?.scaleRate.value;
    let curScaleRateIndex = -1;
    scaleRateList.forEach((item, index) => {
      const prev = scaleRateList[index - 1];
      const next = scaleRateList[index + 1];
      if (item === curScaleRate) {
        curScaleRateIndex = index;
      }
      if (typeof prev !== 'undefined' &&
      typeof next !== 'undefined' &&
      curScaleRate > prev &&
      curScaleRate < next) {
        curScaleRateIndex = index;
      }
    });
    return curScaleRateIndex;
  }

  get allowZoomIn() {
    return this.curScaleIndex < scaleRateList.length - 1;
  }

  get allowZoomOut() {
    return this.curScaleIndex > 0;
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

  initEl() {
    this.el = document.createElement('div');
    this.toMount(this.el, 'tool');
    this.isToolbarShowing = false;
  }

  initComp() {
    this.toolbar = new Toolbar({
      target: this.el as HTMLElement,
      props: {
        isMb: false,
        scaleRate: this.zoneState?.scaleRate?.value,
        allowZoomIn: this.allowZoomIn,
        allowZoomOut: this.allowZoomOut,
      },
    });
  }

  initEvents() {
    this.toolbar?.$on('zoom-in', this.onClickZoomIn);
    this.toolbar?.$on('zoom-out', this.onClickZoomOut);
    this.toolbar?.$on('recover', this.onClickRecover);
    this.toolbar?.$on('download', this.onClickDownload);
    this.toolbar?.$on('rotate', this.onClickRotate);
    this.toolbar?.$on('back', this.onClickBack);
    this.toolbar?.$on('info', this.onClickInfo);
    this.moduleOptions.eventEmitter.on(this.moduleOptions.Events.Closed, this.onClosed);
    if (this.rootState.isSupportTouch.value) {
      this.moduleOptions.eventEmitter.on(this.moduleOptions.Events.Module_TouchEvent, this.onTouchEvent);
    } else {
      this.moduleOptions.eventEmitter.on(this.moduleOptions.Events.Module_MouseEvent, this.onMouseEvent);
    }
  }

  clearEvents() {
    this.moduleOptions.eventEmitter.off(this.moduleOptions.Events.Closed, this.onClosed);
    if (this.rootState.isSupportTouch.value) {
      this.moduleOptions.eventEmitter.off(this.moduleOptions.Events.Module_TouchEvent, this.onTouchEvent);
    } else {
      this.moduleOptions.eventEmitter.off(this.moduleOptions.Events.Module_MouseEvent, this.onMouseEvent);
    }
  }

  subscribeStore() {
    this.zoneState?.scaleRate.subscribe(this.onScaleRateChanged);
    this.rootState?.deviceType.subscribe(this.onDeviceTypeChanged);
  }

  onScaleRateChanged = (scaleRate: unknown) => {
    this.updateProps({
      scaleRate,
      allowZoomIn: this.allowZoomIn,
      allowZoomOut: this.allowZoomOut,
    });
  }

  onDeviceTypeChanged = (deviceType: unknown) => {
    this.toolbar?.$set({
      isMb: deviceType === 'Phone',
    });
  }

  onTouchEvent = (e: unknown) => {
    const { event } = e as { event: string, data: unknown };
    if (event === TouchEvents.Tap) {
      this.onTapImg();
    }
  }

  onMouseEvent = (e: unknown) => {
    const { event } = e as { event: string, data: unknown };
    if (event === 'MouseMove') {
      this.onMouseMove();
    } else if (event === 'MouseOut') {
      this.onMouseOut();
    }
  }

  onMouseMove = () => {
    this.clearToolbarTimer();
    if (!this.isToolbarShowing) {
      this.isToolbarShowing = true;
    }
    this.initToolbarTimer();
  }

  onMouseOut = () => {
    this.initToolbarTimer();
  }

  initToolbarTimer = () => {
    this.clearToolbarTimer();
    this.toolbarTimer = window.setTimeout(() => {
      this.isToolbarShowing = false;
    }, 3000);
  }

  clearToolbarTimer = () => {
    this.toolbarTimer && window.clearTimeout(this.toolbarTimer);
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
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
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

  onClickZoomIn = () => {
    const nextRate = scaleRateList[this.curScaleIndex + 1];
    if (nextRate) {
      this.zoneState?.scaleRate.tweened(nextRate);
    }
  }

  onClickZoomOut = () => {
    const prevRate = scaleRateList[this.curScaleIndex - 1];
    if (prevRate) {
      this.zoneState?.scaleRate.tweened(prevRate);
    }
  }

  onClickRecover = () => {
    this.moduleOptions.eventEmitter?.emit(this.moduleOptions.Events.Module_ToRecover);
  }

  onClickDownload = () => {
    void download(this.zoneState?.src.value);
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

  onTapImg = () => {
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
