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
import { isString } from '../assets/utils/type';
import type {
  BasicImgViewerOptions,
  NewableModule
} from './index.d';

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

  show() {
    this.store.modules.modalContainer.visible?.set(true);
    this._imgZone?.init();
  }

  hide() {
    this.store.modules.modalContainer.visible?.set(false);
  }

  updateDesc(desc: string) {
    if (isString(desc)) {
      this.store.rootState.description.set(desc);
    }
  }
}
