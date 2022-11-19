import ModuleBase from '../module-base';
import Modal from '../../../modal/components/modal.svelte';
import type { StateValue } from '../../store';
import { GestureEvents, DragOrientation } from '../../../assets/utils/gesture';
import type { DragMoveEventData } from '../../../assets/utils/gesture';
import type {
  ModuleOptions,
  BasicImgViewerOptions,
} from '../../index.d';

interface ModalState {
  visible: StateValue<boolean>,
}

export default class ModalContainer extends ModuleBase {
  modal: Modal | null = null;

  el: HTMLElement | null = null;

  swipeClosingProgress = 0;

  get moduleState(): ModalState {
    return this.rootStore?.modules[this.name] as unknown as ModalState;
  }

  constructor(name: string, options: ModuleOptions) {
    super(name, options);
    this.init();
  }

  init() {
    this.el = document.createElement('div');
    this.el.classList.add('as-img-viewer-container');
    this.modal = new Modal({
      target: this.el,
      props: {
        visible: this.moduleState?.visible.value,
        closeBtnEnabled: !this.rootState.isSupportTouch.value,
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
    this.moduleOptions.eventEmitter?.on(this.moduleOptions.Events.Module_GestureEvent, this.onGestureEvent);
  }

  clearEvents() {
    this.moduleOptions.eventEmitter?.off(this.moduleOptions.Events.Module_ToClose, this.onClickClose);
    this.moduleOptions.eventEmitter?.off(this.moduleOptions.Events.Module_GestureEvent, this.onGestureEvent);
  }

  onGestureEvent = (e: unknown) => {
    const { event, data } = e as { event: string, data: unknown };
    switch (event) {
    case GestureEvents.Drag: {
      this.onDrag(data as DragMoveEventData);
      break;
    }
    case GestureEvents.TouchEnd: {
      this.cancelSwipeHide();
      break;
    }
    case GestureEvents.TouchCancel: {
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

  getZoneEl() {
    return this.el?.querySelector('.as-img-viewer-zone');
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

  onDrag = (data: DragMoveEventData) => {
    if (this.zoneState.scaleRate.value > 1) {
      return;
    }
    if (data.direction.initOrientation === DragOrientation.Portrait) {
      this.onPortraitDrag(data);
    }
  }

  onPortraitDrag(data: DragMoveEventData) {
    const { distance } = data;
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
