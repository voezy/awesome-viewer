const defaultManagerOptions: MnangerOptions = {
  baseZIndex: 3000
};

interface MnangerOptions {
  baseZIndex?: number;
}

export class Manager {
  options: MnangerOptions;

  curIndex = 0;

  mask: HTMLElement | null = null;

  visibleModals: HTMLElement[] = [];

  constructor(options = defaultManagerOptions) {
    this.options = Object.assign({}, options);
    const { baseZIndex } = this.options;
    if (typeof baseZIndex === 'number') {
      this.curIndex = baseZIndex || this.curIndex;
    }
    this.initMask();
  }

  initMask() {
    this.mask = document.createElement('div');
    this.mask.style.display = 'none';
    this.mask.classList.add('as-modal-mask');
    this.mask.style.position = 'fixed';
    this.mask.style.top = '0';
    this.mask.style.left = '0';
    this.mask.style.width = '100%';
    this.mask.style.height = '100%';
    this.mask.style.zIndex = String(this.curIndex);
    document.body.appendChild(this.mask);
  }

  setMaskVisible(visible: boolean) {
    if (!this.mask) { return; }
    if (visible) {
      this.mask.style.display = 'block';
    } else {
      this.mask.style.display = 'none';
    }
  }

  show(el: HTMLElement) {
    if (!(el instanceof HTMLElement)) { return; }
    this.visibleModals.push(el);
    el.style.zIndex = String(this.curIndex++);
    this.setMaskVisible(true);
  }

  hide(el: HTMLElement) {
    if (!(el instanceof HTMLElement)) { return; }
    const index = this.visibleModals.findIndex((target) => target === el);
    if (index === -1) { return; }
    this.visibleModals.splice(index, 1);
    if (this.visibleModals.length === 0) {
      this.setMaskVisible(false);
    }
  }
}

export const manager = new Manager();
