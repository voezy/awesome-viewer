import BasicImgViewer from './basic-img-viewer';
import ToolbarModule from './modules/toolbar/toolbar';
import ModalContainer from './modules/modal-container/modal-container';
import type {
  BasicImgViewerOptions,
  NewableModule
} from './index.d';

export default class ImgViewer extends BasicImgViewer {
  defaultModules: { [key: string]: NewableModule } = {
    toolbar: ToolbarModule,
    modalContainer: ModalContainer,
  };

  constructor(options: BasicImgViewerOptions) {
    super(options);
    this.addDefaultModules();
    this.init();
  }

  addDefaultModules() {
    for (const name in this.defaultModules) {
      this.addModule(name, this.defaultModules[name]);
    }
  }

  show() {
    this._store.modules.modalContainer.visible?.set(true);
    this._imgZone?.init();
  }

  hide() {
    this._store.modules.modalContainer.visible?.set(false);
  }
}
