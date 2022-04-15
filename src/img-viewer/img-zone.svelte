<script lang="ts">
  import { onMount, tick } from 'svelte';
  export let src = '';
  export let scaleRate = 1;

  let imgLoaded = false;
  let zoneEl: HTMLElement;
  let imgEl: HTMLImageElement;
  let originalWidth: number;
  let originalHeight: number;
  let basicWidth: number;
  let basicHeight: number;
  let lastPageX: number;
  let lastPageY: number;
  let isDragging = false;

  $: visualWidth = basicWidth && scaleRate > 0 ? basicWidth * scaleRate : null;
  $: visualHeight = basicHeight && scaleRate > 0 ? basicHeight * scaleRate : null;
  $: if (visualWidth && visualHeight) {
    void centralizeImg();
  }

  onMount(async () => {
    await tick();
    init();
  });

  function init() {
    if (imgEl?.complete) {
      imgLoaded = true;
      initImgData();
    }
  }

  function initImgData() {
    originalWidth = imgEl.width;
    originalHeight = imgEl.height;
    initImgSize();
  }

  function limitWidth() {
    if (!imgEl || !zoneEl) { return; }
    const margin = zoneEl.clientWidth * 0.2;
    basicWidth = zoneEl.clientWidth - margin * 2;
    basicHeight = basicWidth * (originalHeight / originalWidth);
  }

  function limitHeight() {
    if (!imgEl || !zoneEl) { return; }
    const margin = zoneEl.clientHeight * 0.2;
    basicHeight = zoneEl.clientHeight - margin * 2;
    basicWidth = basicHeight * (originalWidth / originalHeight);
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

  async function centralizeImg() {
    if (!imgEl || !zoneEl) { return; }
    await tick();
    if (imgEl.clientWidth > zoneEl.clientWidth) {
      zoneEl.scrollLeft = (imgEl.clientWidth - zoneEl.clientWidth) / 2;
    }
    if (imgEl.clientHeight > zoneEl.clientHeight) {
      zoneEl.scrollTop = (imgEl.clientHeight - zoneEl.clientHeight) / 2;
    }
  }

  function onLoaded() {
    imgLoaded = true;
    initImgData();
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
    <img
      bind:this={imgEl}
      class="as-img-viewer-zone__img"
      alt="The preview img"
      src={src}
      style="width: {visualWidth}px; height: {visualHeight}px; opacity: {imgLoaded ? 1 : 0}"
      on:load={onLoaded}
      on:mousedown={onMouseDown}
      on:mousemove={onMouseMove}
      on:mouseup={onMouseUp}
    />
  {/if}
  <div class="as-img-viewer-zone__height"></div>
</div>

<style lang="scss">
  .as-img-viewer-zone {
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
  .as-img-viewer-zone__img {
    display: inline-block;
    vertical-align: middle;
    cursor: grab;
    &:active {
      cursor: grabbing;
    }
  }
</style>
