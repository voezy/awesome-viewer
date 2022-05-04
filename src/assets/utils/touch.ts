import Events from 'events';

interface TouchHandlerOptions {
  el: HTMLElement
}

interface TouchInfo {
  screenX: number;
  screenY: number;
}

export class TouchHandler {
  _el: HTMLElement;

  initTouch0: TouchInfo | null = null;

  initTouch1: TouchInfo | null = null;

  _eventEmitter = new Events();

  _baseScaleRate = 1;

  constructor(options: TouchHandlerOptions) {
    const { el } = options;
    this._el = el;
    this.addEvents();
  }

  get baseScaleRate() {
    return this._baseScaleRate;
  }

  set baseScaleRate(baseScaleRate: number) {
    this._baseScaleRate = baseScaleRate;
  }

  on(eventName: string | symbol, listener: (...args: unknown[]) => void) {
    return this._eventEmitter?.on(eventName, listener);
  }

  off(eventName: string | symbol, listener: (...args: unknown[]) => void) {
    return this._eventEmitter?.off(eventName, listener);
  }

  addEvents() {
    this._el.addEventListener('touchmove', this.onTouchMove);
    this._el.addEventListener('touchend', this.onTouchEnd);
    this._el.addEventListener('touchcancel', this.onTouchCancel);
    this._el.addEventListener('dblclick', this.onDbClick);
  }

  removeEvents() {
    this._el.removeEventListener('touchmove', this.onTouchMove);
    this._el.removeEventListener('touchend', this.onTouchEnd);
    this._el.removeEventListener('touchcancel', this.onTouchCancel);
  }

  onTouchMove = (e: TouchEvent) => {
    if (e.touches?.length < 2) { return; }
    const touch0 = e.touches[0];
    const touch1 = e.touches[1];
    const { initTouch0, initTouch1 } = this;
    if (!initTouch0 || !initTouch1) {
      this.initTouch0 = touch0;
      this.initTouch1 = touch1;
      return;
    }
    const curDistance = Math.hypot(touch0.screenX - touch1.screenX, touch0.screenY - touch1.screenY);
    const lastDistance = Math.hypot(initTouch0.screenX - initTouch1.screenX, initTouch0.screenY - initTouch1.screenY);
    const scaleRateDis = curDistance / lastDistance;
    let centerX = null;
    let centerY = null;
    if (touch1.screenY > touch0.screenY) {
      centerY = touch0.screenY + (touch1.screenY - touch0.screenY) / 2;
      centerX = touch0.screenX + (touch1.screenX - touch0.screenX) / 2;
    } else {
      centerY = touch1.screenY + (touch0.screenY - touch1.screenY) / 2;
      centerX = touch1.screenX + (touch0.screenX - touch1.screenX) / 2;
    }
    this._eventEmitter.emit('pinch', {
      scale: scaleRateDis * this.baseScaleRate,
      center: {
        x: centerX,
        y: centerY,
      }
    });
  }

  onTouchEnd = () => {
    this._eventEmitter.emit('pinchEnd');
    this.initData();
  }

  onDbClick = () => {
    this._eventEmitter.emit('doubleTap');
  }

  onTouchCancel = () => {
    this._eventEmitter.emit('pinchCancel');
    this.initData();
  }

  initData = () => {
    this.initTouch0 = null;
    this.initTouch1 = null;
  }

  destroy() {
    this.removeEvents();
  }
}
