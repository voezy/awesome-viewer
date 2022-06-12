import ModuleBase from '../module-base';
import ImgInfo from '../../components/img-info.svelte';
import { isSupportTouch } from '../../../assets/utils/browser';
import type { StateValue } from '../../store';

interface InfoState {
  visible: StateValue<boolean>,
}

export default class Info extends ModuleBase {
  imgInfo: ImgInfo | null = null;

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
        description: this.rootState.description.value,
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
    this.rootState.description.subscribe(this.onDescChanged);
    this.zoneState.src.subscribe(this.onSrcChanged);
    this.moduleOptions.eventEmitter?.on(this.moduleOptions.Events.Module_ToClose, this.onCloseViewer);
    this.moduleOptions.eventEmitter?.on(this.moduleOptions.Events.Module_ToOpenInfo, this.onClickOpenInfo);
  }

  clearEvents() {
    this.moduleOptions.eventEmitter?.off(this.moduleOptions.Events.Module_ToClose, this.onCloseViewer);
    this.moduleOptions.eventEmitter?.off(this.moduleOptions.Events.Module_ToOpenInfo, this.onClickOpenInfo);
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
      description: this.rootState.description.value,
      zIndex,
    });
    this.moduleState.visible.set(true);
  }

  onDescChanged = (description: unknown) => {
    this.imgInfo?.$set({
      description,
    });
  }

  onSrcChanged = (src: unknown) => {
    this.imgInfo?.$set({
      src: src as string,
    });
  }
}
