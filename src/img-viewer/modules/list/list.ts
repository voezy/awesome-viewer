import ModuleBase from '../module-base';
import ImgList from '../../components/img-list.svelte';
import { isSupportTouch } from '../../../assets/utils/browser';
import type { StateValue } from '../../store';
import type { ImgItem } from '../../image-viewer';

interface ListState {
  visible: StateValue<boolean>,
}

export default class ModalContainer extends ModuleBase {
  _el: HTMLElement | null = null;

  imgList: ImgList | null = null;

  get moduleState(): ListState {
    return this.rootStore?.modules[this.name] as unknown as ListState;
  }

  get container() {
    const getContainer = this.moduleOptions?.getContainer;
    return typeof getContainer === 'function' ? getContainer() : null;
  }

  get list() {
    return this.rootState.list.value;
  }

  onInitReady() {
    const el = document.createElement('div');
    this.toMount(el, 'modal');
    this._el = el;
    this.imgList = new ImgList({
      target: el,
      props: {
        zIndex: this.getNewZIndex(),
        visible: this.moduleState.visible.value,
        anchor: isSupportTouch ? 'bottom' : 'left',
        list: this.rootState.list.value,
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
    if (this._el && this._el.parentNode) {
      this._el.parentNode.removeChild(this._el);
    }
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
    const { detail } = data as { detail: { index: number } };
    const index = detail.index;
    if (typeof index !== 'number' || index >= this.list.length) {
      return;
    }
    this.eventEmitter.emit(this.Events.Module_SwitchToIndex, { index });
  }
}
