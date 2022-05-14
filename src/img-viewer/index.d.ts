import Events from 'events';
import type { Writable } from 'svelte/types/runtime/store';
import type { StateValue } from './store';
import { Events as ImgEvents } from './events';

export interface TapEventCenterData {
  x: number;
  y: number;
}
export interface PinchEventData {
  scale: number;
  center: TapEventCenterData;
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
  };
  distance: {
    x: number;
    y: number;
  }
}

export interface StoreType {
  [key: string]: Writable<unknown>
}

export interface ImgViewerState {
  [key: string]: unknown,
  src?: string;
}

export interface BasicImgViewerOptions {
  el: HTMLElement | string;
  imgState?: ImgViewerState;
  moduleOptions?: { [key: string]: unknown }
}

export enum BasicStateEnum {
  Src = 'src',
  ScaleRate = 'scaleRate',
  RotateDeg = 'rotateDeg',
  ScaleCenter = 'scaleCenter',
}

export interface BasicState {
  [BasicStateEnum.Src]: StateValue<string>;
  [BasicStateEnum.ScaleRate]: StateValue<number>;
  [BasicStateEnum.RotateDeg]: StateValue<number>;
  [BasicStateEnum.ScaleCenter]: StateValue<TapEventCenterData, null>;
}

export interface ModuleState {
  [key: string]: StateValue<unknown>
}

export interface ImgViewerStore {
  state: BasicState;
  modules: {
    [key: string]: ModuleState
  };
}

export type Unsubscriber = () => void;

export interface ModuleOptions {
  options: BasicImgViewerOptions;
  getContainer: () => HTMLElement;
  store: ImgViewerStore,
  eventEmitter: Events;
  Events: typeof ImgEvents;
  invokeZone: (method: string, ...args: unknown[]) => void
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
