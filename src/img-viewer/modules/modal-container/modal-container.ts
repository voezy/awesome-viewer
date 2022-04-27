import Modal from '../../../modal/components/modal.svelte';
import type { StateValue } from '../../store';
import type {
  Module,
  ModuleOptions,
  BasicImgViewerOptions,
} from '../../index.d';

interface ModalState {
  visible: StateValue<boolean>,
}

export default class ModalContainer implements Module {
  name: string;

  moduleOptions: ModuleOptions;

  modal: Modal | null = null;

  el: HTMLElement | null = null;

  constructor(name: string, options: ModuleOptions) {
    this.name = name;
    this.moduleOptions = options;
    this.init();
  }

  get rootStore() {
    return this.moduleOptions._store;
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
    this.subscribeStore();
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

  destroy() {
    this.modal?.$destroy();
    this.el && document.body.removeChild(this.el);
  }
}
