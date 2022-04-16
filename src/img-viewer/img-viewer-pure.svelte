<script lang="ts">
  import { download } from '../assets/utils/net';
  import ImgZone from './img-zone.svelte';
  import ImgToobar from './img-toolbar.svelte';
  
  const scaleRateList = [1, 1.5, 2, 2.5, 3, 3.5, 4, 5];
  const rotateList = [0, 90, 180, 270];

  export let scaleRate = scaleRateList[0];
  export let rotateDeg = rotateList[0];
  export let src = '';
  let isToolbarShowing = true;
  let toolbarTimer: number;

  $: curScaleIndex = scaleRateList.findIndex((target) => target === scaleRate);
  $: curRotateIndex = rotateList.findIndex((target) => target === rotateDeg);

  initToolbarTImer();

  function onClickZoomIn() {
    const nextRate = scaleRateList[curScaleIndex as number + 1];
    if (nextRate) {
      scaleRate = nextRate;
    }
  }

  function onClickZoomOut() {
    const prevRate = scaleRateList[curScaleIndex - 1];
    if (prevRate) {
      scaleRate = prevRate;
    }
  }

  function onClickRecover() {
    scaleRate = scaleRateList[0];
    rotateDeg = rotateList[0];
  }

  function onClickRotate() {
    const nextRotateDeg = rotateList[curRotateIndex as number + 1];
    if (typeof nextRotateDeg === 'number') {
      rotateDeg = nextRotateDeg;
    } else {
      rotateDeg = rotateList[0];
    }
  }

  function onClickDownload() {
    void download(src);
  }

  function onMouseMove() {
    clearToolbarTimer();
    isToolbarShowing = true;
    initToolbarTImer();
  }

  function onMouseOut() {
    initToolbarTImer();
  }

  function initToolbarTImer() {
    clearToolbarTimer();
    toolbarTimer = window.setTimeout(function() {
      isToolbarShowing = false;
    }, 3000);
  }

  function clearToolbarTimer() {
    window.clearTimeout(toolbarTimer);
  }
</script>

<div
  class="c-img-viewer as-fixed-full"
  on:mousemove={onMouseMove}
  on:mouseleave={onMouseOut}
>
  <div class="c-img-viewer__mask as-abs-full"></div>
  <div class="c-img-viewer__main as-abs-full">
    <ImgZone
      {scaleRate}
      {rotateDeg}
      {src}
    />
    <div class="c-img-viewer__toolbar-wrap" style={`display: ${isToolbarShowing ? 'block' : 'none'}`}>
      <ImgToobar
        {scaleRate}
        allowZoomIn={curScaleIndex < scaleRateList.length - 1}
        allowZoomOut={curScaleIndex > 0}
        on:zoom-in={onClickZoomIn}
        on:zoom-out={onClickZoomOut}
        on:recover={onClickRecover}
        on:download={onClickDownload}
        on:rotate={onClickRotate}
      />
    </div>
  </div>
</div>

<style lang="scss">
  @import '../assets/styles/basic.scss';

  .c-img-viewer__mask {
    background: rgba(#000, 0.5);
  }
  .c-img-viewer__toolbar-wrap {
    position: absolute;
    bottom: 50px;
    left: 50%;
    transform: translateX(-50%);
  }
</style>
