import ModuleBase from '../module-base';
import ImgList from '../../components/img-list.svelte';
import { isSupportTouch } from '../../../assets/utils/browser';
import type { StateValue } from '../../store';
import type { ImgItem } from '../../index.d';

interface ListState {
  visible: StateValue<boolean>,
}

export default class ModalContainer extends ModuleBase {
  imgList: ImgList | null = null;

  get moduleState(): ListState {
    return this.rootStore?.modules[this.name] as unknown as ListState;
  }

  get container() {
    const getContainer = this.moduleOptions?.getContainer;
    return typeof getContainer === 'function' ? getContainer() : null;
  }

  onInitReady() {
    this.imgList = new ImgList({
      target: this.container as HTMLElement,
      props: {
        zIndex: this.getNewZIndex(),
        visible: this.moduleState.visible.value,
        anchor: isSupportTouch ? 'bottom' : 'left',
        list: this.rootState.list,
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
    this.rootState.list?.subscribe(this.onListChanged);
  }

  initCompEvents() {
    this.imgList?.$on('close', this.onClickCloseList);
    this.imgList?.$on('open', this.onClickOpen);
    this.imgList?.$on('click-img', this.onClickImg);
  }

  initEvents() {
    this.moduleOptions.eventEmitter?.on(this.moduleOptions.Events.Closed, this.onCloseViewer);
  }

  clearEvents() {
    this.moduleOptions.eventEmitter?.off(this.moduleOptions.Events.Closed, this.onCloseViewer);
  }

  onVisibleChange = (newVisible: boolean) => {
    this.imgList?.$set({
      visible: newVisible
    });
  }

  onListChanged = (list: ImgItem[]) => {
    this.imgList?.$set({
      list,
    });
  }

  onCloseViewer = () => {
    this.moduleState.visible.set(false);
  }

  onClickCloseList = () => {
    this.moduleState.visible.set(false);
  }

  onClickOpen = () => {
    this.imgList?.$set({
      zIndex: this.getNewZIndex(),
    });
    this.moduleState.visible.set(true);
  }

  onClickImg = (data: unknown) => {
    const { detail: img } = data as { detail: ImgItem };
    this.zoneState.src.set(img.src);
    this.rootState.description.set((img.desc as string) || '');
  }
}
