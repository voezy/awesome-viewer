<script lang="ts">
  import { onMount, tick, onDestroy, createEventDispatcher } from 'svelte';
  import { TouchHandler } from '../../assets/utils/touch';
  import { isSupportTouch } from '../../assets/utils/browser';
  import type { TapEventCenterData } from '../index.d';

  export let src = '';
  export let scaleRate = 1;
  export let rotateDeg = 0;
  export let scaleCenter: TapEventCenterData | null;

  let isImgLoaded = false;
  let isImgError = false;
  let zoneEl: HTMLElement;
  let imgEl: HTMLImageElement;
  let originalWidth: number | null;
  let originalHeight: number | null;
  let basicWidth: number | null;
  let basicHeight: number | null;
  let visualWidth: number | null;
  let visualHeight: number | null;
  let lastPageX: number;
  let lastPageY: number;
  let isDragging = false;
  let imgStyle = '';
  let touchHandler: TouchHandler | null = null;
  let touchEventHandlers: { [key: string]: (...args: unknown[]) => void } = {};
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

  onMount(async () => {
    await tick();
    init();
    initTouchHandler();
  });

  onDestroy(() => {
    clearTouchHandler();
  });

  export async function init() {
    clearData();
    isImgLoaded = false;
    await tick();
    if (imgEl?.complete) {
      onLoaded();
    }
  }

  function initTouchHandler() {
    if (isSupportTouch) {
      touchHandler =  new TouchHandler({
        el: zoneEl,
        preventDefault: () => {
          return scaleRate <= 1;
        },
      });
      for (const event in touchHandler.Events) {
        const handler = touchEvenDispatcher(event);
        touchEventHandlers[event] = handler;
        touchHandler?.on(event, handler);
      }
    }
  }

  function clearTouchHandler() {
    for (const event in touchEventHandlers) {
      const handler = touchEventHandlers[event];
      touchHandler?.off(event, handler);
    }
    touchHandler?.destroy();
  }

  function touchEvenDispatcher(event: string) {
    return function(e: unknown) {
      dispatch('touchEvent', {
        event,
        data: e
      });
    }
  }

  function clearData() {
    basicWidth = null;
    basicHeight = null;
    originalWidth = null
    originalHeight = null;
    visualHeight = null;
    imgStyle = '';
  }

  function initImgData() {
    originalWidth = imgEl.naturalWidth;
    originalHeight = imgEl.naturalHeight;
    initImgSize();
    updateVisualSize();
  }

  function getDefaultMargin() {
    if (!zoneEl) { return 0; }
    return zoneEl.clientWidth * 0.1;
  }

  function limitWidth() {
    if (!imgEl || !zoneEl) { return; }
    basicWidth = zoneEl.clientWidth - getDefaultMargin() * 2;
    basicHeight = basicWidth * (originalHeight as number / (originalWidth as number));
  }

  function limitHeight() {
    if (!imgEl || !zoneEl) { return; }
    basicHeight = zoneEl.clientHeight - getDefaultMargin() * 2;
    basicWidth = basicHeight * (originalWidth as number / (originalHeight as number));
  }

  function initImgSize() {
    if (!imgEl || !zoneEl) { return; }
    const wider = imgEl.clientWidth >= zoneEl.clientWidth;
    const higher = imgEl.clientHeight >= zoneEl.clientHeight;

    if (wider && !higher) {
      limitWidth();
    } else if (!wider && higher) {
      limitHeight();
    } else if (wider && higher) {
      const rate = (imgEl.clientWidth / zoneEl.clientWidth) / (imgEl.clientHeight / zoneEl.clientHeight);
      if (rate >= 1) {
        limitWidth();
      } else {
        limitHeight();
      }
    } else {
      basicWidth = imgEl.clientWidth;
      basicHeight = imgEl.clientHeight;
    }
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

    positioningImg({ customScrollData });
  };

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
    if (imgEl.clientWidth > zoneEl.clientWidth) {
      zoneEl.scrollLeft = scrollLeft;
    }
    if (imgEl.clientHeight > zoneEl.clientHeight) {
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

  function onMouseDown(e: MouseEvent) {
    isDragging = true;
    lastPageX = e.pageX;
    lastPageY = e.pageY;
  }

  function onMouseMove(e: MouseEvent) {
    e.preventDefault();
    if (!isDragging) { return; }
    const curPageX = e.pageX;
    const curPageY = e.pageY;
    const distX = curPageX - lastPageX;
    const distY = curPageY - lastPageY;
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
    lastPageX = curPageX;
    lastPageY = curPageY;
  }

  function onMouseUp() {
    if (!isDragging) { return; }
    isDragging = false;
  }

  function onMouseLeaveZone() {
    if (!isDragging) { return; }
    isDragging = false;
  }
</script>

<div bind:this={zoneEl} class="as-img-viewer-zone" on:mouseleave={onMouseLeaveZone}>
  {#if src }
    <div
      class="as-img-viewer-zone__img-wrap"
      style="
        width: { visualWidth ? `${visualWidth}px` : '' };
        height: { visualHeight ? `${visualHeight}px` : ''};
        opacity: {isImgLoaded ? 1 : 0};
        display: { isImgError ? 'none' : 'inline-block' }
      "
    >
        <img
        bind:this={imgEl}
        class="as-img-viewer-zone__img"
        alt="The preview img"
        src={src}
        style={imgStyle}
        on:load={onLoaded}
        on:error={onError}
        on:mousedown={onMouseDown}
        on:mousemove={onMouseMove}
        on:mouseup={onMouseUp}
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
