<script lang="ts">
  import { download } from '../assets/utils/net';
  import ImgZone from './img-zone.svelte';
  import ImgToobar from './img-toolbar.svelte';

  export let scaleRate = 1;
  export let src = '';
  
  const scaleRateList = [1, 1.5, 2, 2.5, 3, 3.5, 4, 5];

  $: curScaleIndex = scaleRateList.findIndex((target) => target === scaleRate);

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
    scaleRate = 1;
  }
  
  // function onClickRotate() {
  //   dispatch('rotate');
  // }

  function onClickDownload() {
    void download(src);
  }
</script>

<div class="c-img-viewer as-fixed-full">
  <div class="c-img-viewer__mask as-abs-full"></div>
  <div class="c-img-viewer__main as-abs-full">
    <ImgZone
      {scaleRate}
      {src}
    />
    <div class="c-img-viewer__toolbar-wrap">
      <ImgToobar
        {scaleRate}
        allowZoomIn={curScaleIndex < scaleRateList.length - 1}
        allowZoomOut={curScaleIndex > 0}
        on:zoom-in={onClickZoomIn}
        on:zoom-out={onClickZoomOut}
        on:recover={onClickRecover}
        on:download={onClickDownload}
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
