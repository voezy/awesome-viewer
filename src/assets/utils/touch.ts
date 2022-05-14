import Events from 'events';

interface TouchHandlerBaseOptions {
  preventDefault?: () => boolean;
}

interface TouchHandlerOptions extends TouchHandlerBaseOptions {
  el: HTMLElement,
}

interface TouchInfo {
  screenX: number;
  screenY: number;
}

export class TouchHandler {
  _el: HTMLElement;

  initTouches: TouchInfo[] = [];

  _eventEmitter = new Events();

  _baseScaleRate = 1;

  _preventDefault = () => false;

  _tuochStartTime: null | number = null;

  _isTapping = true;

  _lastTouchEndTime: null | number = null;

  _tapTimer: null | number = null;

  constructor(options: TouchHandlerOptions) {
    const { el, preventDefault } = options;
    this._el = el;
    typeof preventDefault === 'function' && (this._preventDefault = preventDefault);
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
    this._el.addEventListener('touchstart', this.onTouchStart);
    this._el.addEventListener('touchmove', this.onTouchMove);
    this._el.addEventListener('touchend', this.onTouchEnd);
    this._el.addEventListener('touchcancel', this.onTouchCancel);
    this._el.addEventListener('dblclick', this.onDbClick);
  }

  removeEvents() {
    this._el.removeEventListener('touchstart', this.onTouchStart);
    this._el.removeEventListener('touchmove', this.onTouchMove);
    this._el.removeEventListener('touchend', this.onTouchEnd);
    this._el.removeEventListener('touchcancel', this.onTouchCancel);
    this._el.removeEventListener('dblclick', this.onDbClick);
  }

  onTouchStart = () => {
    this._isTapping = true;
    this._tuochStartTime = Date.now();
  }

  onTouchMove = (e: TouchEvent) => {
    this._isTapping = false;
    if (this._preventDefault()) { e.preventDefault(); }
    if (e.touches?.length < 2) {
      this.onSingleTouchMove(e);
    } else {
      this.onMultiTouchMove(e);
    }
  }

  onSingleTouchMove(e: TouchEvent) {
    if (e.touches?.length !== 1) { return; }
    const touch = e.touches[0];
    const [initTouch] = this.initTouches;
    if (!initTouch) {
      this.initTouches = [touch];
      return;
    }
    const distance = {
      x: touch.screenX - initTouch.screenX,
      y: touch.screenY - initTouch.screenY,
    };
    this._eventEmitter.emit('drag', {
      start: {
        x: initTouch.screenX,
        y: initTouch.screenY
      },
      current: {
        x: touch.screenX,
        y: touch.screenY,
      },
      direction: {
        right: distance.x > 0,
        bottom: distance.y > 0,
      },
      distance,
    });
  }

  onMultiTouchMove(e: TouchEvent) {
    if (e.touches?.length < 2) { return; }
    const touch0 = e.touches[0];
    const touch1 = e.touches[1];
    const [initTouch0, initTouch1] = this.initTouches;
    if (!initTouch0 || !initTouch1) {
      this.initTouches = [touch0, touch1];
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
    this._eventEmitter.emit('touchEnd');
    this.initData();
    const now = Date.now();
    if (typeof this._tapTimer === 'number') {
      this.clearTapTimer();
    } else if (this._isTapping && typeof this._tuochStartTime === 'number' && now - this._tuochStartTime <= 150) {
      this.initTapTimer();
    }
  }

  initTapTimer() {
    this._tapTimer = window.setTimeout(() => {
      this._eventEmitter.emit('tap');
      this._tapTimer = null;
      this._tuochStartTime = null;
    }, 100);
  }

  clearTapTimer() {
    typeof this._tapTimer === 'number' && window.clearTimeout(this._tapTimer);
    this._isTapping = false;
    this._tapTimer = null;
    this._tuochStartTime = null;
  }

  onDbClick = (e: Event) => {
    if (this._preventDefault()) { e.preventDefault(); }
    this._eventEmitter.emit('doubleTap');
  }

  onTouchCancel = () => {
    this._eventEmitter.emit('touchCancel');
    this.initData();
  }

  initData = () => {
    this.initTouches = [];
  }

  destroy() {
    this.removeEvents();
  }
}
