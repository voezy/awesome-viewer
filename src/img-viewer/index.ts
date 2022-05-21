import BasicImgViewer from './basic-img-viewer';
import ToolbarModulePc from './modules/toolbar/pc/toolbar';
import ToolbarModuleMb from './modules/toolbar/mb/toolbar';
import ModalContainer from './modules/modal-container/modal-container';
import PinchZoomModule from './modules/pinch-zoom/pinch-zoom';
import { isSupportTouch } from '../assets/utils/browser';
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
      modalContainer: ModalContainer,
    };
    if (isSupportTouch) {
      defaultModules.pinchZoom = PinchZoomModule;
      defaultModules.toolbar = ToolbarModuleMb;
    } else {
      defaultModules.toolbar = ToolbarModulePc;
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
}
