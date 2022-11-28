import ModuleBase from '../module-base';
import { GestureEvents, DragOrientation } from '../../../assets/utils/gesture';
import { getBasicSize } from '../../assets/utils/limitation';
import { circOut } from 'svelte/easing';
import type { DragMoveEventData } from '../../../assets/utils/gesture';
import type TweenedMotion from '../../motion/tweened';
import type {
  ModuleOptions,
} from '../../image-viewer';
import './gesture.scss';

const NO_SRC_IMG_CLASS = 'as-img-viewer-gesture-img--no-src';
const LOADING_IMG_CLASS = 'as-img-viewer-gesture-img--loading';

export default class Gesture extends ModuleBase {
  prevImgWrap: HTMLElement | null = null;

  nextImgWrap: HTMLElement | null = null;

  initDragTime: null | number = null;

  lastDistanceX = 0;

  _zoneMotion: TweenedMotion | null = null;

  constructor(name: string, options: ModuleOptions) {
    super(name, options);
  }

  get prevImgEl() {
    return this.prevImgWrap?.querySelector('img');
  }

  get nextImgEl() {
    return this.nextImgWrap?.querySelector('img');
  }

  get list() {
    return this.rootState.list.value || [];
  }

  get curImgIndex() {
    return this.rootState.curImgIndex.value;
  }

  get prevImgData() {
    if (this.curImgIndex <= 0) { return null; }
    return this.list[this.curImgIndex - 1];
  }

  get nextImgData() {
    if (this.curImgIndex >= this.list.length) { return null; }
    return this.list[this.curImgIndex + 1];
  }

  get container() {
    return this.moduleOptions.getContainer();
  }

  get containerWidth() {
    return this.container.clientWidth || window.innerWidth;
  }

  get containerHeight() {
    return this.container.clientHeight || window.innerHeight;
  }

  get zoneEl() {
    const container = this.moduleOptions.getContainer();
    return container?.querySelector('.as-img-viewer-zone');
  }

  onInitReady() {
    this.prevImgWrap = this.imgHTML('prev', this.prevImgData?.src || '');
    this.nextImgWrap = this.imgHTML('next', this.nextImgData?.src || '');
    this.toMount(this.prevImgWrap, 'content');
    this.toMount(this.nextImgWrap, 'content');
    this.initEvents();
    this.subscribeStore();
  }

  initEvents() {
    this.moduleOptions.eventEmitter?.on(this.moduleOptions.Events.Module_GestureEvent, this.onGestureEvent);
    if (this.prevImgEl) {
      this.prevImgEl.onload = this.onPrevImgLoaded;
      this.prevImgEl.complete && this.onPrevImgLoaded();
    }
    if (this.nextImgEl) {
      this.nextImgEl.onload = this.onNextImgLoaded;
      this.nextImgEl.complete && this.onNextImgLoaded();
    }
  }

  clearEvents() {
    this.moduleOptions.eventEmitter?.off(this.moduleOptions.Events.Module_GestureEvent, this.onGestureEvent);
    if (this.prevImgEl) {
      this.prevImgEl.removeEventListener('load', this.onPrevImgLoaded);
    }
    if (this.nextImgEl) {
      this.nextImgEl.removeEventListener('load', this.onNextImgLoaded);
    }
  }

  imgHTML(type: string, src: string) {
    const img = document.createElement('img');
    img.alt = 'gesture image';
    src && (img.src = src);
    const wrap = document.createElement('div');
    wrap.classList.add('as-img-viewer-gesture-img-wrap');
    wrap.classList.add(`as-img-viewer-gesture-img-wrap--${type}`);
    wrap.appendChild(img);
    return wrap;
  }

  onPrevImgLoaded = () => {
    if (!this.prevImgEl) { return; }
    const basicSize = getBasicSize({
      imgWidth: this.prevImgEl.naturalWidth,
      imgHeight: this.prevImgEl.naturalHeight,
      zoneWidth: this.containerWidth,
      zoneHeight: this.containerHeight,
    });
    this.prevImgEl.style.width = `${basicSize.basicWidth}px`;
    this.prevImgEl.style.height = `${basicSize.basicHeight}px`;
    this.prevImgEl.classList.remove(LOADING_IMG_CLASS);
  }

  onNextImgLoaded = () => {
    if (!this.nextImgEl) { return; }
    const basicSize = getBasicSize({
      imgWidth: this.nextImgEl.naturalWidth,
      imgHeight: this.nextImgEl.naturalHeight,
      zoneWidth: this.containerWidth,
      zoneHeight: this.containerHeight,
    });
    this.nextImgEl.style.width = `${basicSize.basicWidth}px`;
    this.nextImgEl.style.height = `${basicSize.basicHeight}px`;
    this.nextImgEl.classList.remove(LOADING_IMG_CLASS);
  }

  onGestureEvent = (e: unknown) => {
    const { event, data } = e as { event: string, data: unknown };
    switch(event) {
    case GestureEvents.Drag:
      this.onDrag(data as DragMoveEventData);
      break;
    case GestureEvents.DragStop:
      this.cancelDrag();
      break;
    }
  }

  subscribeStore() {
    this.rootState.curImgIndex.subscribe(this.onCurIndexChanged);
  }

  onCurIndexChanged = () => {
    this.updateSiblingImg();
  }

  onDrag = (data: DragMoveEventData) => {
    if (this.zoneState.scaleRate.value > 1) {
      return;
    }
    if (data.direction.initOrientation === DragOrientation.Horizonal) {
      this.onHorizonalDrag(data);
    }
  }

  onHorizonalDrag(data: DragMoveEventData) {
    const zoneEl = this.zoneEl as HTMLElement;
    if (!zoneEl) { return; }

    if (this._zoneMotion) {
      return;
    }

    const { fullDistance } = data;
    let distanceX = fullDistance.x;
    const siblings = [];

    if (distanceX < 0 && this.nextImgData && this.nextImgWrap) {
      siblings.push(this.nextImgWrap);
    }

    if (distanceX > 0 && this.prevImgData && this.prevImgWrap) {
      siblings.push(this.prevImgWrap);
    }

    if (siblings.length) {
      siblings.forEach((sibling: HTMLElement) => {
        sibling.style.transform = `translateX(${distanceX}px)`;
      });
    } else {
      const boundryDistance = this.containerWidth * 0.6;
      if (Math.abs(distanceX) > boundryDistance) { return; }
      distanceX = distanceX * (1 - Math.abs(distanceX) / this.containerWidth);
    }
    zoneEl.style.transform = `translateX(${distanceX}px)`;

    this.lastDistanceX = distanceX;
    if (!this.initDragTime) {
      this.initDragTime = Date.now();
    }
  }

  cancelDrag = () => {
    if (!this.initDragTime) { return; }
    if (this._zoneMotion) {
      this._zoneMotion?.stop();
    }

    const minDragDistance = this.containerWidth / 2;
    let targetTransformX = 0;
    let onFinish = () => {
      this._zoneMotion = null;
    };
    let onUpdate = undefined;
    const inertialMotionDistance = 2 * this.lastDistanceX / (0.003 * (Date.now() - this.initDragTime));
    const shouldSwitchNext = this.lastDistanceX < - minDragDistance || inertialMotionDistance < - minDragDistance;
    const shouldSwitchPrev = this.lastDistanceX > minDragDistance || inertialMotionDistance > minDragDistance;

    if (this.lastDistanceX < 0) {
      onUpdate = (newVal: number) => {
        this.setZoneTransformX(newVal);
        this.setNextImgWrapTransformX(newVal);
      };
    } else {
      onUpdate = (newVal: number) => {
        this.setZoneTransformX(newVal);
        this.setPrevImgWrapTransformX(newVal);
      };
    }
    if (
      this.nextImgData &&
      this.nextImgWrap &&
      shouldSwitchNext
    ) {
      targetTransformX = -this.containerWidth;
      onFinish = () => {
        this._zoneMotion = null;
        this.eventEmitter.emit(this.Events.Module_SwitchToIndex, { index: this.rootState.curImgIndex.value + 1 });
        this.setZoneTransformX(0);
        this.setNextImgWrapTransformX(0);
      };
    } else if (
      this.prevImgData &&
      this.prevImgWrap &&
      shouldSwitchPrev
    ) {
      targetTransformX = this.containerWidth;
      onFinish = () => {
        this._zoneMotion = null;
        this.eventEmitter.emit(this.Events.Module_SwitchToIndex, { index: this.rootState.curImgIndex.value - 1 });
        this.setZoneTransformX(0);
        this.setPrevImgWrapTransformX(0);
      };
    }
    this._zoneMotion = new this.moduleOptions.Motion.TweenedMotion({
      value: this.lastDistanceX,
      onUpdate,
      onFinish,
    });
    this._zoneMotion.to(targetTransformX, {
      duration: 300,
      easing: circOut,
    });

    this.lastDistanceX = 0;
    this.initDragTime = null;
  }

  setZoneTransformX(x: number) {
    this.zoneEl instanceof HTMLElement && (this.zoneEl.style.transform = `translateX(${x}px)`);
  }

  setNextImgWrapTransformX(x: number) {
    this.nextImgWrap && (this.nextImgWrap.style.transform = `translateX(${x}px)`);
  }

  setPrevImgWrapTransformX(x: number) {
    this.prevImgWrap && (this.prevImgWrap.style.transform = `translateX(${x}px)`);
  }

  updateSiblingImg() {
    if (this.nextImgEl) {
      if (this.nextImgData) {
        this.nextImgEl.src = this.nextImgData?.src;
        this.nextImgEl.classList.add(LOADING_IMG_CLASS);
        this.nextImgEl.classList.remove(NO_SRC_IMG_CLASS);
      } else {
        this.nextImgEl.src = '';
        this.nextImgEl.classList.add(NO_SRC_IMG_CLASS);
      }
    }
    if (this.prevImgEl) {
      if (this.prevImgData) {
        this.prevImgEl.src = this.prevImgData?.src;
        this.prevImgEl.classList.add(LOADING_IMG_CLASS);
        this.prevImgEl.classList.remove(NO_SRC_IMG_CLASS);
      } else {
        this.prevImgEl.src = '';
        this.prevImgEl.classList.add(NO_SRC_IMG_CLASS);
      }
    }
  }

  destroy() {
    this.prevImgWrap?.parentNode?.removeChild(this.prevImgWrap);
    this.nextImgWrap?.parentNode?.removeChild(this.nextImgWrap);
    this.clearEvents();
  }
}
