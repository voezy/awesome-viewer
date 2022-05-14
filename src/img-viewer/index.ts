import BasicImgViewer from './basic-img-viewer';
import ToolbarModule from './modules/toolbar/toolbar';
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
    } else {
      defaultModules.toolbar = ToolbarModule;
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
