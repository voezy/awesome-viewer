<script lang="ts">
  import { onMount, tick } from 'svelte';
  export let src = '';
  export let scaleRate = 1;
  export let rotateDeg = 0;

  let imgLoaded = false;
  let zoneEl: HTMLElement;
  let imgEl: HTMLImageElement;
  let originalWidth: number;
  let originalHeight: number;
  let basicWidth: number;
  let basicHeight: number;
  let visualWidth: number;
  let visualHeight: number;
  let lastPageX: number;
  let lastPageY: number;
  let isDragging = false;
  let imgStyle = '';

  $: isReverseDirection = rotateDeg  === 90 || rotateDeg === 270;
  $: {
    if (!scaleRate || scaleRate < 0) {
      visualWidth = basicWidth;
      visualHeight = basicHeight;
    } else if (!rotateDeg) {
      visualWidth = basicWidth * scaleRate;
      visualHeight = basicHeight * scaleRate;
    } else {
      visualWidth = isReverseDirection ? basicHeight * scaleRate : basicWidth * scaleRate;
      visualHeight = isReverseDirection ? basicWidth * scaleRate : basicHeight * scaleRate;
    }
  }
  $: if (visualWidth && visualHeight) {
    void centralizeImg();
  }
  $: {
    if (rotateDeg) {
      const width = isReverseDirection ? visualHeight : visualWidth;
      const height = isReverseDirection ? visualWidth : visualHeight;
      const marginTop = -height/2;
      const marginLeft =  -width/2;
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
    <div
      class="as-img-viewer-zone__img-wrap"
      style="width: {visualWidth}px; height: {visualHeight}px; opacity: {imgLoaded ? 1 : 0}"
    >
        <img
        bind:this={imgEl}
        class="as-img-viewer-zone__img"
        alt="The preview img"
        src={src}
        style={imgStyle}
        on:load={onLoaded}
        on:mousedown={onMouseDown}
        on:mousemove={onMouseMove}
        on:mouseup={onMouseUp}
      />
    </div>
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
</style>
