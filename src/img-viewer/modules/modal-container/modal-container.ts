import Modal from '../../../modal/components/modal.svelte';
import type { StateValue } from '../../store';
import { TouchHandler } from '../../../assets/utils/touch';
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

  touchHandler: TouchHandler | null = null;

  swipeClosingProgress = 0;

  constructor(name: string, options: ModuleOptions) {
    this.name = name;
    this.moduleOptions = options;
    this.init();
  }

  get rootStore() {
    return this.moduleOptions.store;
  }

  get rootState() {
    return this.rootStore?.state;
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
      }
    });
    document.body.appendChild(this.el);
    this.initCompEvents();
  }

  onInitReady() {
    this.initTouchHandler();
    this.subscribeStore();
  }

  initTouchHandler() {
    this.touchHandler = new TouchHandler({
      el: this.el as HTMLElement,
      preventDefault: () => {
        return this.rootState.scaleRate.value <= 1;
      },
    });
    this.touchHandler.on('drag', this.onDrag);
    this.touchHandler.on('touchEnd', this.cancelSwipeHide);
    this.touchHandler.on('touchCancel', this.cancelSwipeHide);
  }

  getDefaultState() {
    return {
      visible: false,
    };
  }

  show = () => {
    this.moduleState.visible?.set(true);
  }

  hide = () => {
    this.moduleState.visible?.set(false);
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
    this.moduleOptions.eventEmitter?.emit(this.moduleOptions.Events.Recover);
    this.hide();
  }

  onVisibleChange = (isVisible: unknown) => {
    this.modal?.$set({
      visible: !!isVisible,
    });
  }

  proccessOptions(options: BasicImgViewerOptions) {
    const modalContainer = this.getModalContainer();
    return Object.assign({}, options, {
      el: modalContainer
    });
  }

  onDrag = (data: unknown) => {
    if (this.rootState.scaleRate.value > 1) { return; }
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
      this.rootState.scaleRate.set(1);
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
      this.rootState.scaleRate.tweened(progress < 0.5 ? 0.5 : progress);
    } else {
      this.rootState.scaleRate.set(progress < 0.5 ? 0.5 : progress);
    }
  }

  destroy() {
    this.touchHandler?.off('drag', this.onDrag);
    this.touchHandler?.off('touchEnd', this.cancelSwipeHide);
    this.touchHandler?.off('touchCancel', this.cancelSwipeHide);
    this.touchHandler?.destroy();
    this.modal?.$destroy();
    this.el && document.body.removeChild(this.el);
  }
}
