import ModuleBase from '../module-base';
import SwitchBtn from '../../components/img-switch-btn-pc.svelte';

export default class SwitchBtnModule extends ModuleBase {
  _el: HTMLElement | null = null;

  _switchBtn: SwitchBtn | null = null;

  toolbarTimer: number | null = null;

  get list() {
    return this.rootState.list.value || [];
  }

  get curImgIndex() {
    return this.rootState.curImgIndex.value;
  }

  get isPrevExists() {
    return this.list?.length > 1 && this.curImgIndex > 0;
  }

  get isNextExists() {
    return this.list?.length > 1 && this.curImgIndex < this.list?.length - 1;
  }

  onInitReady() {
    this.initComp();
    this.initEvents();
  }

  initComp() {
    const el = document.createElement('div');
    this._el = el;
    this._switchBtn = new SwitchBtn({
      target: el,
      props: {
        isPrevExists: this.isPrevExists,
        isNextExists: this.isNextExists,
      }
    });
    this.toMount(this._el, 'tool');
  }

  destroy(): void {
    this.clearEvents();
    this._switchBtn?.$destroy();
    if(this._el && this._el.parentNode) {
      this._el.parentNode.removeChild(this._el);
    }
  }

  initEvents() {
    if (!this.rootState.isSupportTouch.value) {
      this.moduleOptions.eventEmitter.on(this.moduleOptions.Events.Module_MouseEvent, this.onMouseEvent);
    }
    this._switchBtn?.$on('prev', this.onClickPrev);
    this._switchBtn?.$on('next', this.onClickNext);
    this.subscribeStore();
  }

  clearEvents() {
    if (!this.rootState.isSupportTouch.value) {
      this.moduleOptions.eventEmitter.off(this.moduleOptions.Events.Module_MouseEvent, this.onMouseEvent);
    }
  }

  subscribeStore() {
    this.rootState.list?.subscribe(this.updateBtn);
    this.rootState.curImgIndex?.subscribe(this.updateBtn);
  }

  updateBtn = () => {
    this._switchBtn?.$set({
      isPrevExists: this.isPrevExists,
      isNextExists: this.isNextExists,
    });
  }

  onClickPrev = () => {
    this.eventEmitter.emit(this.Events.Module_SwitchToIndex, { index: this.curImgIndex - 1 });
  }

  onClickNext = () => {
    this.eventEmitter.emit(this.Events.Module_SwitchToIndex, { index: this.curImgIndex + 1 });
  }

  onMouseEvent = (e: unknown) => {
    const { event } = e as { event: string, data: unknown };
    if (event === 'MouseMove') {
      this.onMouseMove();
    } else if (event === 'MouseOut') {
      this.onMouseOut();
    }
  }

  onMouseMove() {
    this._el && (this._el.style.display = 'block');
    this.initTimer();
  }

  initTimer() {
    this.clearTimer();
    this.toolbarTimer = window.setTimeout(() => {
      this._el && (this._el.style.display = 'none');
    }, 3000);
  }

  clearTimer() {
    if (this.toolbarTimer) {
      clearTimeout(this.toolbarTimer);
      this.toolbarTimer = null;
    }
  }

  onMouseOut() {
    this.initTimer();
  }
}
