import ImgInfo from '../../components/img-info.svelte';
import { isSupportTouch } from '../../../assets/utils/browser';
import type { StateValue } from '../../store';
import type {
  Module,
  ModuleOptions,
} from '../../index.d';

interface InfoState {
  visible: StateValue<boolean>,
  description: StateValue<string>,
}

export default class ModalContainer implements Module {
  name: string;

  moduleOptions: ModuleOptions;

  imgInfo: ImgInfo | null = null;

  constructor(name: string, options: ModuleOptions) {
    this.name = name;
    this.moduleOptions = options;
  }

  get rootStore() {
    return this.moduleOptions.store;
  }

  get zoneState() {
    return this.rootStore?.zoneState;
  }

  get moduleState(): InfoState {
    return this.rootStore?.modules[this.name] as unknown as InfoState;
  }

  get container() {
    const getContainer = this.moduleOptions?.getContainer;
    return typeof getContainer === 'function' ? getContainer() : null;
  }

  onInitReady() {
    const { width, height } = this.rootStore.imgData;
    this.imgInfo = new ImgInfo({
      target: this.container as HTMLElement,
      props: {
        visible: this.moduleState?.visible.value,
        width: width.value,
        height: height.value,
        src: this.zoneState.src.value,
        description: this.moduleState.description.value,
        anchor: isSupportTouch ? 'bottom' : 'left',
      },
    });
    this.subscribeStore();
    this.initEvents();
    this.initCompEvents();
  }

  getDefaultState() {
    return {
      visible: false,
      description: '',
    };
  }

  destroy(): void {
    this.clearEvents();
  }

  subscribeStore() {
    this.moduleState?.visible?.subscribe(this.onVisibleChange);
  }

  initCompEvents() {
    this.imgInfo?.$on('close', this.onClickCloseInfo);
  }

  initEvents() {
    this.moduleOptions.eventEmitter?.on(this.moduleOptions.Events.Module_ToClose, this.onCloseViewer);
    this.moduleOptions.eventEmitter?.on(this.moduleOptions.Events.Module_ToOpenInfo, this.onClickOpenInfo);
  }

  clearEvents() {
    this.moduleOptions.eventEmitter?.off(this.moduleOptions.Events.Module_ToClose, this.onCloseViewer);
  }

  onVisibleChange = (newVisible: boolean) => {
    this.imgInfo?.$set({
      visible: newVisible
    });
  }

  onClickCloseInfo = () => {
    this.moduleState.visible.set(false);
  }

  onCloseViewer = () => {
    this.moduleState.visible.set(false);
  }

  onClickOpenInfo = () => {
    const { width, height } = this.rootStore.imgData;
    const zIndex = this.rootStore.rootState.layerIndex.value + 1;
    this.rootStore.rootState.layerIndex.set(zIndex);
    this.imgInfo?.$set({
      width: width.value,
      height: height.value,
      description: this.moduleState.description.value,
      zIndex,
    });
    this.moduleState.visible.set(true);
  }

  updateDesc(desc: string) {
    this.moduleState.description.set(desc);
  }
}
