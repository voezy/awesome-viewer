import Toolbar from '../../../components/img-toolbar-pc.svelte';
import { download } from '../../../../assets/utils/net';
import './toolbar.scss';
import type {
  Module,
  ModuleOptions,
} from '../../../index.d';

const scaleRateList = [1, 1.5, 2, 2.5, 3, 3.5, 4, 5];
const rotateList = [0, 90, 180, 270];

export default class ToolbarModule implements Module {
  name: string;

  moduleOptions: ModuleOptions;

  toolbar: Toolbar | null = null;

  el: HTMLElement | null = null;

  toolbarTimer: number | null = null;

  _isToolbarShowing = true;

  constructor(name: string, options: ModuleOptions) {
    this.name = name;
    this.moduleOptions = options;
  }

  onInitReady() {
    this.initEl();
    this.initComp();
    this.initCompEvents();
    this.initContainerEvents();
    this.initToolbarTimer();
    this.subscribeStore();
  }

  get rootStore() {
    return this.moduleOptions.store;
  }

  get zoneState() {
    return this.rootStore?.zoneState;
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

  get curRotateIndex() {
    return rotateList.findIndex((target) => target === this.zoneState?.rotateDeg.value);
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
    if (isToolbarShowing) {
      this.el?.classList.remove('as-img-viewer-module__toolbar-wrap--hidden');
    } else {
      this.el?.classList.add('as-img-viewer-module__toolbar-wrap--hidden');
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
      this.el.classList.add('as-img-viewer-module__toolbar-wrap');
      container.appendChild(this.el);
    }
  }

  initComp() {
    this.toolbar = new Toolbar({
      target: this.el as HTMLElement,
      props: {
        scaleRate: this.zoneState?.scaleRate?.value,
        allowZoomIn: this.allowZoomIn,
        allowZoomOut: this.allowZoomOut,
      },
    });
  }

  initCompEvents() {
    this.toolbar?.$on('zoom-in', this.onClickZoomIn);
    this.toolbar?.$on('zoom-out', this.onClickZoomOut);
    this.toolbar?.$on('recover', this.onClickRecover);
    this.toolbar?.$on('rotate', this.onClickRotate);
    this.toolbar?.$on('download', this.onClickDownload);
    this.toolbar?.$on('info', this.onClickInfo);
  }

  initContainerEvents() {
    const container = this.container;
    container?.addEventListener('mousemove', this.onMouseMove);
    container?.addEventListener('mouseout', this.onMouseOut);
  }

  clearContainerEvents() {
    const container = this.container;
    container?.removeEventListener('mousemove', this.onMouseMove);
    container?.removeEventListener('mouseout', this.onMouseOut);
  }

  destroy() {
    this.destroyComp();
    this.clearContainerEvents();
    this.cleanEl();
  }

  cleanEl() {
    this.el && this.container?.removeChild(this.el);
  }

  destroyComp() {
    this.toolbar?.$destroy();
  }

  onMouseMove = () => {
    this.clearToolbarTimer();
    !this.isToolbarShowing && this.updateVisible(true);
    this.initToolbarTimer();
  }

  onMouseOut = () => {
    this.initToolbarTimer();
  }

  initToolbarTimer = () => {
    this.clearToolbarTimer();
    this.toolbarTimer = window.setTimeout(() => {
      this.updateVisible(false);
    }, 3000);
  }

  clearToolbarTimer = () => {
    this.toolbarTimer && window.clearTimeout(this.toolbarTimer);
  }

  updateVisible(isToolbarShowing: boolean) {
    this.isToolbarShowing = isToolbarShowing;
  }

  subscribeStore() {
    this.zoneState?.scaleRate.subscribe(this.onScaleRateChanged);
  }

  onScaleRateChanged = (scaleRate: unknown) => {
    this.updateProps({
      scaleRate,
      allowZoomIn: this.allowZoomIn,
      allowZoomOut: this.allowZoomOut,
    });
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

  onClickRotate = () => {
    const nextRotateDeg = rotateList[this.curRotateIndex + 1];
    if (typeof nextRotateDeg === 'number') {
      this.zoneState?.rotateDeg.set(nextRotateDeg);
    } else {
      this.zoneState?.rotateDeg.set(rotateList[0]);
    }
  }

  onClickDownload = () => {
    void download(this.zoneState?.src.value);
  }

  onClickInfo = () => {
    this.moduleOptions.eventEmitter?.emit(this.moduleOptions.Events.Module_ToOpenInfo);
  }
}
