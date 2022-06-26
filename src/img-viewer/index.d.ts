import Events from 'events';
import { Events as ImgEvents } from './events';
import Motion from './motion/';
import type { Writable } from 'svelte/types/runtime/store';
import type { StateValue } from './store';
import type { DeviceType } from '../assets/utils/device';
import * as Easing from 'svelte/easing';

export interface TapEventCenterData {
  x: number;
  y: number;
}
export interface PinchEventData {
  scale: number;
  center: TapEventCenterData;
}

export enum MoveOrientation {
  Portrait = 'Portrait',
  Horizonal = 'Horizonal',
}

export interface StoreType {
  [key: string]: Writable<unknown>
}

export interface ImgItem {
  src: string;
  desc?: string;
  thumbnail?: string;
}

export interface ImgViewerState {
  [key: string]: unknown,
  src?: string;
  description?: string;
  list?: ImgItem[];
}

export interface BasicImgViewerOptions {
  el: HTMLElement | string;
  imgState?: ImgViewerState;
  moduleOptions?: { [key: string]: unknown }
}

export enum ZoneStateEnum {
  Src = 'src',
  ScaleRate = 'scaleRate',
  RotateDeg = 'rotateDeg',
  ScaleCenter = 'scaleCenter',
}

export interface ZoneState {
  [ZoneStateEnum.Src]: StateValue<string>;
  [ZoneStateEnum.ScaleRate]: StateValue<number>;
  [ZoneStateEnum.RotateDeg]: StateValue<number>;
  [ZoneStateEnum.ScaleCenter]: StateValue<TapEventCenterData, null>;
}


export interface ModuleState {
  [key: string]: StateValue<unknown>
}

export interface ImgData {
  width: StateValue<number | null>,
  height: StateValue<number | null>,
}

export interface RootState {
  // top z-index of module element
  layerIndex: StateValue<number>,
  // device type
  deviceType: StateValue<DeviceType>,
  // touch support
  isSupportTouch: StateValue<boolean>,
  // Image description
  description: StateValue<string>;
  // Image list
  list: StateValue<ImgItem[]>,
  // current image index in the list
  curImgIndex: StateValue<number>
}

export interface ImgViewerStore {
  zoneState: ZoneState;
  imgData: ImgData;
  rootState: RootState;
  modules: {
    [key: string]: ModuleState
  };
}

export type Unsubscriber = () => void;

export interface ModuleOptions {
  options: BasicImgViewerOptions;
  getContainer: () => HTMLElement;
  toMount: (el: HTMLElement, type: string) => void;
  store: ImgViewerStore,
  eventEmitter: Events;
  Events: typeof ImgEvents;
  invokeZone: (method: string, ...args: unknown[]) => void,
  Motion: typeof Motion,
}

export interface NewableModule {
  new (name: string, options: ModuleOptions)
}

interface ModuleDefaultState {
  [key: string]: unknown
}

export declare class Module implements NewableModule {
  constructor (options: ModuleOptions): Module;

  destroy(): void;

  getDefaultState?(): ModuleDefaultState;

  extendViewerParams?(): { [key: string]: unknown };

  onInitReady?(): void;

  proccessOptions?(options: BasicImgViewerOptions): BasicImgViewerOptions;
}


/**
 * Interface about information module
 */
export interface InfoItem {
  name: string;
  value: string;
  type?: string;
  link?: string;
  ico?: string;
}

export interface InfoSection {
  title: string;
  desc?: string;
  items: InfoItem[];
}


export interface TweenedOptions {
  duration: number;
  easing?: Easing;
}
