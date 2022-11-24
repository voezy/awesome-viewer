import Events from 'events';
import { isSupportTouch } from './browser';

interface GestureHandlerBaseOptions {
  preventDefault?: () => boolean;
}

interface GestureHandlerOptions extends GestureHandlerBaseOptions {
  el: HTMLElement,
}

interface Point {
  x: number;
  y: number;
}

interface Distance {
  x: number;
  y: number;
}

export enum GestureEvents {
  Drag = 'Drag',
  Pinch = 'Pinch',
  DragStop = 'DragStop',
  Tap = 'Tap',
  DoubleTap = 'DoubleTap',
  ScaleStop = 'ScaleStop',
}

export enum DragOrientation {
  Portrait = 'Portrait',
  Horizonal = 'Horizonal',
}

export interface DragMoveEventData {
  direction: {
    right: boolean;
    bottom: boolean;
    initOrientation: DragOrientation,
  };
  fullDistance: Distance,
  stepDistance: Distance
}

export class GestureHandler {
  Events: typeof GestureEvents = GestureEvents;

  _el: HTMLElement;

  _initTouches: Touch[] = [];

  _lastTouches: Touch[] = [];

  initMouseEvent: MouseEvent | null = null;

  lastMouseMove: MouseEvent | null = null;

  _eventEmitter = new Events();

  _baseScaleRate = 1;

  _preventDefault = () => false;

  _tuochStartTime: null | number = null;

  _isTapping = false;

  _isTouchDragging = false;

  _isMouseDragging = false;

  _isScaling = false;

  _dragOrientation: null | DragOrientation = null;

  _lastTouchEndTime: null | number = null;

  _initPinchDistance: null | number = null;

  _tapTimer: null | number = null;

  constructor(options: GestureHandlerOptions) {
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
    if (!isSupportTouch) {
      this._el.addEventListener('mousedown', this.onMouseDown);
      this._el.addEventListener('mouseup', this.onMouseUp);
      this._el.addEventListener('mouseleave', this.onMouseLeave);
      this._el.addEventListener('mousemove', this.onMouseMove);
    } else  {
      this._el.addEventListener('touchstart', this.onTouchStart);
      this._el.addEventListener('touchmove', this.onTouchMove, { passive: false });
      this._el.addEventListener('touchend', this.onTouchEnd);
      this._el.addEventListener('touchcancel', this.onTouchCancel);
    }
  }

  removeEvents() {
    if (!isSupportTouch) {
      this._el.removeEventListener('mousedown', this.onMouseDown);
      this._el.removeEventListener('mouseup', this.onMouseUp);
      this._el.removeEventListener('mouseleave', this.onMouseLeave);
      this._el.removeEventListener('mousemove', this.onMouseMove);
    } else  {
      this._el.removeEventListener('touchstart', this.onTouchStart);
      this._el.removeEventListener('touchmove', this.onTouchMove);
      this._el.removeEventListener('touchend', this.onTouchEnd);
      this._el.removeEventListener('touchcancel', this.onTouchCancel);
    }
  }

  onMouseDown = (e: MouseEvent) => {
    this._isMouseDragging = true;
    this.lastMouseMove = e;
    this.initMouseEvent = e;
  }

  onMouseUp = () => {
    if (!this._isMouseDragging) {
      return;
    } else {
      this._eventEmitter.emit(this.Events.DragStop);
    }
    this.clearMouseData();
  }

  onMouseLeave = () => {
    if (!this._isMouseDragging) {
      return;
    } else {
      this._eventEmitter.emit(this.Events.DragStop);
    }
    this.clearMouseData();
  }

  onMouseMove = (e: MouseEvent) => {
    if (!this.initMouseEvent || !this._isMouseDragging) { return; }
    if (!this.lastMouseMove) {
      this.lastMouseMove = e;
      return;
    }
    e.preventDefault();
    this.lastMouseMove = e;
    const dragData = this.getDragData(e, this.lastMouseMove, this.initMouseEvent);
    this._eventEmitter.emit(this.Events.Drag, dragData);
  }

  clearMouseData = () => {
    this._isMouseDragging = false;
    this.lastMouseMove = null;
    this.initMouseEvent = null;
    this._dragOrientation = null;
  }

  onTouchStart = (e: TouchEvent) => {
    this._isTapping = true;
    this._tuochStartTime = Date.now();
    this._lastTouches = [...e.touches];
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
    if (!this._isTouchDragging) {
      this._isTouchDragging = true;
    }
    const touch = e.touches[0];
    const [initTouch] = this._initTouches;
    const [lastTouch] = this._lastTouches;
    if (!initTouch) {
      this._initTouches = [touch];
      return;
    }
    this._lastTouches = [...e.touches];
    const dragData = this.getDragData(touch, lastTouch, initTouch);
    this._eventEmitter.emit(this.Events.Drag, dragData);
  }

  getDragData(
    curEvent: Touch | MouseEvent,
    lastEvent: Touch | MouseEvent,
    initEvent: Touch | MouseEvent
  ): DragMoveEventData {
    const fullDistance = {
      x: curEvent.screenX - initEvent.screenX,
      y: curEvent.screenY - initEvent.screenY,
    };
    const stepDistance = {
      x: curEvent.screenX - lastEvent.screenX,
      y: curEvent.screenY - lastEvent.screenY,
    };
    let initOrientation;
    if (!this._dragOrientation) {
      if (Math.abs(fullDistance.x) >= Math.abs(fullDistance.y)) {
        initOrientation = DragOrientation.Horizonal;
      } else {
        initOrientation = DragOrientation.Portrait;
      }
      this._dragOrientation = initOrientation;
    } else {
      initOrientation = this._dragOrientation;
    }
    return {
      direction: {
        initOrientation,
        right: fullDistance.x > 0,
        bottom: fullDistance.y > 0,
      },
      fullDistance,
      stepDistance,
    };
  }

  getDistance(pointA: Point, pointB: Point) {
    return Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y);
  }

  onMultiTouchMove(e: TouchEvent) {
    e.preventDefault();
    if (e.touches?.length < 2) {
      return;
    } else if (!this._isScaling) {
      this._isScaling = true;
    }
    const touch0 = e.touches[0];
    const touch1 = e.touches[1];
    const [initTouch0, initTouch1] = this._initTouches;
    if (!initTouch0 || !initTouch1) {
      this._initTouches = [touch0, touch1];
      return;
    } else if (typeof this._initPinchDistance !== 'number') {
      this._initPinchDistance = this.getDistance({
        x: initTouch0.screenX,
        y: initTouch0.screenY
      }, {
        x: initTouch1.screenX,
        y: initTouch1.screenY
      });
    }
    const curDistance = this.getDistance({
      x: touch0.screenX,
      y: touch0.screenY
    }, {
      x: touch1.screenX, y:
      touch1.screenY
    });
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
    if (this._isTouchDragging) {
      this._eventEmitter.emit(this.Events.DragStop);
    } else if (this._isScaling) {
      this._eventEmitter.emit(this.Events.ScaleStop);
    }
    this.clearTouchData();
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
    if (this._isTouchDragging) {
      this._eventEmitter.emit(this.Events.DragStop);
    } else if (this._isScaling) {
      this._eventEmitter.emit(this.Events.ScaleStop);
    }
    this.clearTouchData();
  }

  clearTouchData = () => {
    this._initTouches = [];
    this._initPinchDistance = null;
    this._dragOrientation = null;
    this._lastTouches = [];
    this._isTouchDragging = false;
    this._isScaling = false;
  }

  destroy() {
    this.removeEvents();
  }
}
