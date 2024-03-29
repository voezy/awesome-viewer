import BasicImgViewer from './basic-img-viewer';
import ToolbarModule from './modules/toolbar/toolbar';
import ModalContainer from './modules/modal-container/modal-container';
import PinchZoomModule from './modules/pinch-zoom/pinch-zoom';
import InfoModule from './modules/info/info';
import GlobalModule from './modules/global/global';
import ListModule from './modules/list/list';
import Gesture from './modules/gesture/gesture';
import SwitchBtn from './modules/switch-btn/switch-btn';
import { isSupportTouch } from '../assets/utils/browser';
import type {
  BasicImgViewerOptions,
  NewableModule
} from './image-viewer';

interface DefaultModules {
  [key: string]: NewableModule
}

export default class ImgViewer extends BasicImgViewer {
  constructor(options: BasicImgViewerOptions) {
    super(options);
    this.addDefaultModules();
    this.init();
  }

  get defaultModules() {
    const defaultModules: DefaultModules = {
      global: GlobalModule,
      modalContainer: ModalContainer,
      info: InfoModule,
      toolbar: ToolbarModule,
      list: ListModule,
      gesture: Gesture,
    };
    if (isSupportTouch) {
      defaultModules.pinchZoom = PinchZoomModule;
    } else {
      defaultModules.switchBtn = SwitchBtn;
    }
    return defaultModules;
  }

  addDefaultModules() {
    for (const name in this.defaultModules) {
      this.addModule(name, this.defaultModules[name]);
    }
  }

  /**
   * Show image viewer
   * @param index target image item index in the array
   */
  show(index?: number) {
    if (typeof index === 'number' && index > -1 && index <= this.store.rootState.list.value.length - 1) {
      this._eventEmitter?.emit(this.Events.Module_SwitchToIndex, { index });
    }
    this.store.modules.modalContainer.visible?.set(true);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this._imgZone?.init();
  }

  hide() {
    this.store.modules.modalContainer.visible?.set(false);
  }
}
