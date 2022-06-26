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

export enum TouchEvents {
  Drag = 'Drag',
  Pinch = 'Pinch',
  TouchEnd = 'TouchEnd',
  TouchCancel = 'TouchCancel',
  Tap = 'Tap',
  DoubleTap = 'DoubleTap',
}

export enum DragOrientation {
  Portrait = 'Portrait',
  Horizonal = 'Horizonal',
}

export interface DragMoveEventData {
  start: {
    x: number;
    y: number;
  };
  current: {
    x: number;
    y: number;
  };
  direction: {
    right: boolean;
    bottom: boolean;
    initOrientation: DragOrientation,
  };
  distance: {
    x: number;
    y: number;
  }
}

export class TouchHandler {
  Events: typeof TouchEvents = TouchEvents;

  _el: HTMLElement;

  initTouches: TouchInfo[] = [];

  _eventEmitter = new Events();

  _baseScaleRate = 1;

  _preventDefault = () => false;

  _tuochStartTime: null | number = null;

  _isTapping = false;

  _dragOrientation: null | DragOrientation = null;

  _lastTouchEndTime: null | number = null;

  _initPinchDistance: null | number = null;

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
  }

  removeEvents() {
    this._el.removeEventListener('touchstart', this.onTouchStart);
    this._el.removeEventListener('touchmove', this.onTouchMove);
    this._el.removeEventListener('touchend', this.onTouchEnd);
    this._el.removeEventListener('touchcancel', this.onTouchCancel);
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
    let initOrientation;
    if (!this._dragOrientation) {
      if (Math.abs(distance.x) > Math.abs(distance.y)) {
        initOrientation = DragOrientation.Horizonal;
      } else {
        initOrientation = DragOrientation.Portrait;
      }
      this._dragOrientation = initOrientation;
    } else {
      initOrientation = this._dragOrientation;
    }
    this._eventEmitter.emit(this.Events.Drag, {
      start: {
        x: initTouch.screenX,
        y: initTouch.screenY
      },
      current: {
        x: touch.screenX,
        y: touch.screenY,
      },
      direction: {
        initOrientation,
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
    } else if (typeof this._initPinchDistance !== 'number') {
      this._initPinchDistance = Math.hypot(initTouch0.screenX - initTouch1.screenX, initTouch0.screenY - initTouch1.screenY);
    }
    const curDistance = Math.hypot(touch0.screenX - touch1.screenX, touch0.screenY - touch1.screenY);
    const scaleRateDis = curDistance / this._initPinchDistance;
    let centerX = null;
    let centerY = null;
    if (touch1.screenY > touch0.screenY) {
      centerY = touch0.screenY + (touch1.screenY - touch0.screenY) / 2;
      centerX = touch0.screenX + (touch1.screenX - touch0.screenX) / 2;
    } else {
      centerY = touch1.screenY + (touch0.screenY - touch1.screenY) / 2;
      centerX = touch1.screenX + (touch0.screenX - touch1.screenX) / 2;
    }
    this._eventEmitter.emit(this.Events.Pinch, {
      scale: scaleRateDis * this.baseScaleRate,
      center: {
        x: centerX,
        y: centerY,
      }
    });
  }

  onTouchEnd = (e: Event) => {
    this._eventEmitter.emit(this.Events.TouchEnd);
    this.initData();
    const now = Date.now();
    if (!this._isTapping || typeof this._tuochStartTime !== 'number') {
      return;
    }
    const hasFirstTap = typeof this._tapTimer === 'number';
    const isInDbTapDuration = now - this._tuochStartTime <= 150;
    if (hasFirstTap && isInDbTapDuration) {
      if (this._preventDefault()) { e.preventDefault(); }
      this.clearTapTimer();
      this._eventEmitter.emit(this.Events.DoubleTap);
    } else {
      this.initTapTimer();
    }
  }

  initTapTimer() {
    this._tapTimer = window.setTimeout(() => {
      this._eventEmitter.emit(this.Events.Tap);
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

  onTouchCancel = () => {
    this._eventEmitter.emit(this.Events.TouchCancel);
    this.initData();
  }

  initData = () => {
    this.initTouches = [];
    this._initPinchDistance = null;
    this._dragOrientation = null;
  }

  destroy() {
    this.removeEvents();
  }
}
