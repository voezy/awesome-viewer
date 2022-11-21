<script lang="ts">
  import { onMount, tick, onDestroy, createEventDispatcher } from 'svelte';
  import { GestureHandler } from '../../assets/utils/gesture';
  import { getBasicSize } from '../assets/utils/limitation';
  import { isSupportTouch } from '../../assets/utils/browser';
  import type { TapEventCenterData } from '../index.d';
  import type { DragMoveEventData } from '../../assets/utils/gesture';

  export let src = '';
  export let scaleRate = 1;
  export let rotateDeg = 0;
  export let scaleCenter: TapEventCenterData | null;

  let isImgLoaded = false;
  let isImgError = false;
  let zoneEl: HTMLElement;
  let imgEl: HTMLImageElement;
  let basicWidth: number | null;
  let basicHeight: number | null;
  let visualWidth: number | null;
  let visualHeight: number | null;
  let imgStyle = '';
  let gestureHandler: GestureHandler | null = null;
  let gestureEventForwarder: { [key: string]: (...args: unknown[]) => void } = {};
  const dispatch = createEventDispatcher();

  interface PositioningImgParams {
    customScrollData?: {
      scrollLeft: number;
      scrollTop: number;
    };
  }

  $: isReverseDirection = rotateDeg  === 90 || rotateDeg === 270;
  $: {
    if (typeof scaleRate !== 'undefined' || typeof rotateDeg !== 'undefined') {
      updateVisualSize();
    }
  }

  $: {
    if (src) {
      init();
    }
  }

  onMount(async () => {
    await tick();
    initGestureHandler();
  });

  onDestroy(() => {
    clearGestureHandler();
  });

  export async function init() {
    clearData();
    isImgLoaded = false;
    await tick();
    if (imgEl?.complete) {
      onLoaded();
    }
  }

  function initGestureHandler() {
    gestureHandler =  new GestureHandler({
      el: zoneEl,
      preventDefault: () => {
        return scaleRate <= 1;
      },
    });
    for (const event in gestureHandler.Events) {
      const handler = gestureEventDispatcher(event);
      gestureEventForwarder[event] = handler;
      gestureHandler?.on(event, handler);
    }
    gestureHandler.on(gestureHandler.Events.ScaleStop, onScaleStop);
    if (!isSupportTouch) {
     gestureHandler.on(gestureHandler.Events.Drag, onDrag);
    }
  }

  function clearGestureHandler() {
    for (const event in gestureEventForwarder) {
      const handler = gestureEventForwarder[event];
      gestureHandler?.off(event, handler);
    }
    gestureHandler?.off(gestureHandler.Events.ScaleStop, onScaleStop);
    if (!isSupportTouch) {
      gestureHandler?.off(gestureHandler.Events.Drag, onDrag);
    }
    gestureHandler?.destroy();
  }

  function gestureEventDispatcher(event: string) {
    return function(e: unknown) {
      dispatch('gestureEvent', {
        event,
        data: e
      });
    }
  }

  function onScaleStop() {
    gestureHandler && (gestureHandler.baseScaleRate = scaleRate);
  }

  function onDrag(data: unknown) {
    const distX = (data as DragMoveEventData).stepDistance.x;
    const distY = (data as DragMoveEventData).stepDistance.y;
    const dragToLeft = distX > 0;
    const allowDragToLeft = dragToLeft && zoneEl?.scrollLeft - distX >= 0;
    const allowDragToRight = !dragToLeft && zoneEl.scrollLeft + zoneEl.clientWidth - distX <= imgEl.clientWidth;
    if (allowDragToLeft || allowDragToRight) {
      zoneEl.scrollLeft -= distX;
    }
    const dragToTop = distY > 0;
    const allowDragToTop = dragToTop && zoneEl?.scrollTop - distY >= 0;
    const allowDragToBottom = !dragToTop && zoneEl.scrollTop + zoneEl.clientHeight - distX <= imgEl.clientHeight;
    if (allowDragToTop || allowDragToBottom) {
      zoneEl.scrollTop -= distY;
    }
  }

  function clearData() {
    basicWidth = null;
    basicHeight = null;
    visualWidth = null;
    visualHeight = null;
    imgStyle = '';
  }

  function initImgData() {
    initImgSize();
    updateVisualSize();
  }

  function initImgSize() {
    if (!imgEl || !zoneEl) { return; }
    const basicSize = getBasicSize({
      imgWidth: imgEl.naturalWidth,
      imgHeight: imgEl.naturalHeight,
      zoneWidth: zoneEl.clientWidth,
      zoneHeight: zoneEl.clientHeight,
    });
    basicWidth = basicSize.basicWidth;
    basicHeight = basicSize.basicHeight;
  }

  const updateVisualSize = () => {
    const lastVisualWidth = visualWidth;
    const lastVisualHeight = visualHeight;
    const lastScrollLeft = zoneEl?.scrollLeft;
    const lastScrollTop = zoneEl?.scrollTop;

    if (!scaleRate || scaleRate < 0) {
      visualWidth = basicWidth;
      visualHeight = basicHeight;
    } else if (!rotateDeg) {
      visualWidth = basicWidth as number * scaleRate;
      visualHeight = basicHeight as number * scaleRate;
    } else {
      visualWidth = isReverseDirection ? basicHeight as number * scaleRate : basicWidth as number * scaleRate;
      visualHeight = isReverseDirection ? basicWidth as number * scaleRate : basicHeight as number * scaleRate;
    }

    let customScrollData;
    if (scaleCenter && typeof lastVisualWidth === 'number' && typeof lastVisualHeight === 'number') {
      const centerLeftRate = (lastScrollLeft + scaleCenter.x) / lastVisualWidth;
      const centerTopRate = (lastScrollTop + scaleCenter.y) / lastVisualHeight;
      customScrollData = {
        scrollLeft: centerLeftRate * (visualWidth as number) - scaleCenter.x,
        scrollTop: centerTopRate * (visualHeight as number) - scaleCenter.y,
      };
      scaleCenter = null;
    }

    setImgStyles();
    positioningImg({ customScrollData });
  };

  function setImgStyles() {
    if (rotateDeg) {
      const width = isReverseDirection ? visualHeight : visualWidth;
      const height = isReverseDirection ? visualWidth : visualHeight;
      const marginTop = -(height as number)/2;
      const marginLeft =  -(width as number)/2;
      imgStyle = `
        width: ${width}px;
        height: ${height}px;
        transform: rotate(${rotateDeg}deg);
        transform-origin: center;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-top: ${marginTop}px;
        margin-left: ${marginLeft}px;
      `;
    } else {
      imgStyle = '';
    }
  }

  async function positioningImg(params?: PositioningImgParams) {
    if (!imgEl || !zoneEl) { return; }
    await tick();
    let scrollLeft = 0;
    let scrollTop = 0;
    if (params?.customScrollData) {
      scrollLeft = params.customScrollData.scrollLeft || scrollLeft;
      scrollTop = params.customScrollData.scrollTop || scrollTop;
    } else {
      scrollLeft = (imgEl.clientWidth - zoneEl.clientWidth) / 2;
      scrollTop = (imgEl.clientHeight - zoneEl.clientHeight) / 2;
    }
    const imgWidth = isReverseDirection ? imgEl.clientHeight : imgEl.clientWidth;
    const imgHeight = isReverseDirection ? imgEl.clientWidth : imgEl.clientHeight;
    if (imgWidth > zoneEl.clientWidth) {
      zoneEl.scrollLeft = scrollLeft;
    }
    if (imgHeight > zoneEl.clientHeight) {
      zoneEl.scrollTop = scrollTop;
    }
  }

  function onLoaded() {
    isImgLoaded = true;
    initImgData();
    dispatch('imgData', {
      width: imgEl.naturalWidth,
      height: imgEl.naturalHeight,
    });
  }

  function onError() {
    isImgError = true;
  }
</script>

<div bind:this={zoneEl} class="as-img-viewer-zone">
  {#if src }
    <div
      class="as-img-viewer-zone__img-wrap"
      style:width={ visualWidth ? `${visualWidth}px` : '' }
      style:height={ visualHeight ? `${visualHeight}px` : '' }
      style:opacity={ isImgLoaded ? 1 : 0 }
      style:display={ isImgError ? 'none' : 'inline-block' }
    >
        <img
        bind:this={imgEl}
        class="as-img-viewer-zone__img"
        alt="The preview img"
        src={src}
        style={imgStyle}
        on:load={onLoaded}
        on:error={onError}
      />
    </div>
  {/if}
  {#if isImgError}
    <p class="as-img-viewer-zone__err-tips">Failed to load this image</p>
  {:else if !isImgLoaded}
    <i class="as-img-viewer-zone__load-ico ri-loader-3-line"></i>
  {/if}
  <div class="as-img-viewer-zone__height"></div>
</div>

<style lang="scss">
  @import '../../assets/styles/mixins.scss';

  .as-img-viewer-zone {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    overflow: auto;
    white-space: nowrap;
    user-select: none;
  }
  .as-img-viewer-zone__height {
    display: inline-block;
    height: 100%;
    vertical-align: middle;
  }
  .as-img-viewer-zone__img-wrap {
    position: relative;
    display: inline-block;
    vertical-align: middle;
  }
  .as-img-viewer-zone__img {
    width: 100%;
    height: 100%;
    display: block;
    cursor: grab;
    &:active {
      cursor: grabbing;
    }
  }
  .as-img-viewer-zone__load-ico {
    @include as-abs-center();

    width: 30px;
    height: 30px;
    font-size: 30px;
    color: rgba(#fff, 0.7);
    animation: 1s as-loading-spin ease-in-out infinite;
    transform-origin: center;
  }
  .as-img-viewer-zone__err-tips {
    @include as-abs-center();

    height: 14px;
    color: #fff;
    font-size: 14px;
  }
  @keyframes as-loading-spin {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
