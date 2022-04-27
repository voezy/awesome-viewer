import Events from 'events';
import type { Writable } from 'svelte/types/runtime/store';
import type { StateValue } from './store';
import { Events as ImgEvents } from './events';

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
}

export interface BasicState {
  [BasicStateEnum.Src]: StateValue<string>;
  [BasicStateEnum.ScaleRate]: StateValue<number>;
  [BasicStateEnum.RotateDeg]: StateValue<number>;
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
  _store: ImgViewerStore,
  eventEmitter: Events;
  Events: typeof ImgEvents;
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
