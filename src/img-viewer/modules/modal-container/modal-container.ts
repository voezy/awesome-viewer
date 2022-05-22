import Modal from '../../../modal/components/modal.svelte';
import type { StateValue } from '../../store';
import { TouchEvents } from '../../../assets/utils/touch';
import { isSupportTouch } from '../../../assets/utils/browser';
import type {
  Module,
  ModuleOptions,
  BasicImgViewerOptions,
  DragMoveEventData
} from '../../index.d';

interface ModalState {
  visible: StateValue<boolean>,
}

export default class ModalContainer implements Module {
  name: string;

  moduleOptions: ModuleOptions;

  modal: Modal | null = null;

  el: HTMLElement | null = null;

  // touchHandler: TouchHandler | null = null;

  swipeClosingProgress = 0;

  constructor(name: string, options: ModuleOptions) {
    this.name = name;
    this.moduleOptions = options;
    this.init();
  }

  get rootStore() {
    return this.moduleOptions.store;
  }

  get zoneState() {
    return this.rootStore?.zoneState;
  }

  get moduleState(): ModalState {
    return this.rootStore?.modules[this.name] as unknown as ModalState;
  }

  init() {
    this.el = document.createElement('div');
    this.el.classList.add('as-img-viewer-container');
    this.modal = new Modal({
      target: this.el,
      props: {
        visible: this.moduleState?.visible.value,
        closeBtnEnabled: !isSupportTouch,
      }
    });
    document.body.appendChild(this.el);
    this.initCompEvents();
    this.initEvents();
  }

  onInitReady() {
    this.subscribeStore();
  }

  getDefaultState() {
    return {
      visible: false,
    };
  }

  initEvents() {
    this.moduleOptions.eventEmitter?.on(this.moduleOptions.Events.Module_ToClose, this.onClickClose);
    this.moduleOptions.eventEmitter?.on(this.moduleOptions.Events.Module_TouchEvent, this.onTouchEvent);
  }

  clearEvents() {
    this.moduleOptions.eventEmitter?.off(this.moduleOptions.Events.Module_ToClose, this.onClickClose);
    this.moduleOptions.eventEmitter?.off(this.moduleOptions.Events.Module_TouchEvent, this.onTouchEvent);
  }

  onTouchEvent = (e: unknown) => {
    const { event, data } = e as { event: string, data: unknown };
    switch (event) {
    case TouchEvents.Drag: {
      this.onDrag(data);
      break;
    }
    case TouchEvents.TouchEnd: {
      this.cancelSwipeHide();
      break;
    }
    case TouchEvents.TouchCancel: {
      this.cancelSwipeHide();
      break;
    }
    }
  }

  show = () => {
    this.moduleState.visible?.set(true);
  }

  hide = () => {
    this.moduleState.visible?.set(false);
    this.zoneState.rotateDeg.set(0);
  }

  subscribeStore() {
    this.moduleState?.visible?.subscribe(this.onVisibleChange);
  }

  getModalContainer(): HTMLElement | null {
    return this.modal ? this.modal.getContainer() as HTMLElement : null;
  }

  initCompEvents() {
    this.modal?.$on('close', this.onClickClose);
  }

  onClickClose = () => {
    this.moduleOptions.eventEmitter?.emit(this.moduleOptions.Events.Module_ToRecover);
    this.hide();
  }

  onVisibleChange = (isVisible: unknown) => {
    this.modal?.$set({
      visible: !!isVisible,
    });
    this.moduleOptions.eventEmitter.emit(this.moduleOptions.Events.Closed);
  }

  proccessOptions(options: BasicImgViewerOptions) {
    const modalContainer = this.getModalContainer();
    return Object.assign({}, options, {
      el: modalContainer
    });
  }

  onDrag = (data: unknown) => {
    if (this.zoneState.scaleRate.value > 1) { return; }
    const { distance } = data as DragMoveEventData;
    let swipeClosingProgress = Math.abs(distance.y) / (window.screen.availHeight / 4);
    swipeClosingProgress = swipeClosingProgress > 1 ? 1 : swipeClosingProgress;
    this.swipeClosingProgress = swipeClosingProgress;
    this.setHidingProgress();
  }

  cancelSwipeHide = () => {
    if (this.swipeClosingProgress === 0) { return; }
    if (Math.round(this.swipeClosingProgress) === 1) {
      this.swipeClosingProgress = 0;
      this.zoneState.scaleRate.set(1);
      this.hide();
    } else {
      this.swipeClosingProgress = 0;
      this.setHidingProgress(true);
    }
  }

  setHidingProgress(tweened = false) {
    const progress = 1 - this.swipeClosingProgress;
    this.modal?.setHidingProgress(progress);
    if (tweened) {
      this.zoneState.scaleRate.tweened(progress < 0.5 ? 0.5 : progress);
    } else {
      this.zoneState.scaleRate.set(progress < 0.5 ? 0.5 : progress);
    }
  }

  destroy() {
    this.clearEvents();
    this.modal?.$destroy();
    this.el && document.body.removeChild(this.el);
  }
}
