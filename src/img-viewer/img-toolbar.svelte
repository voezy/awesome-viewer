<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import './assets/fonts/remixicon.css';
  export let scaleRate = 1;

  const dispatch = createEventDispatcher();

  $: scalePercent = `${ scaleRate * 100 }%`;

  function onClickZoomIn() {
    dispatch('zoom-in');
  }

  function onClickZoomOut() {
    dispatch('zoom-out');
  }

  function onClickRecover() {
    dispatch('recover');
  }
  
  function onClickRotate() {
    dispatch('rotate');
  }

  function onClickDownload() {
    dispatch('download');
  }
</script>

<div class="as-img-viewer-toolbar">
  <button
    class="as-reset-btn as-img-viewer-toolbar__tool as-img-viewer-toolbar__btn"
    on:click={onClickZoomIn}
  >
    <i class="ri-zoom-in-line"></i>
  </button>
  <div
    class="as-img-viewer-toolbar__tool as-img-viewer-toolbar__percent"
    on:click={onClickRecover}
  >
    <span>{ scalePercent }</span>
  </div>
  <button
    class="as-reset-btn as-img-viewer-toolbar__tool as-img-viewer-toolbar__btn"
    on:click={onClickZoomOut}
  >
    <i class="ri-zoom-out-line"></i>
  </button>
  <button
    class="as-reset-btn as-img-viewer-toolbar__tool as-img-viewer-toolbar__btn"
    on:click={onClickRotate}
  >
    <i class="ri-clockwise-line"></i>
  </button>
  <button
    class="as-reset-btn as-img-viewer-toolbar__tool as-img-viewer-toolbar__btn"
    on:click={onClickDownload}
  >
    <i class="ri-download-line"></i>
  </button>
</div>

<style lang="scss">
  @import '../assets/styles/reset.scss';

  .as-img-viewer-toolbar {
    display: inline-block;
    white-space: nowrap;
    background: rgba(#000, 0.6);
    border-radius: 8px;
    user-select: none;
  }
  .as-img-viewer-toolbar__tool {
    $size: 45px;

    width: $size;
    height: $size;
    display: inline-block;
    text-align: center;
    line-height: $size;
    vertical-align: middle;
    cursor: pointer;
    color: rgba(#fff, 0.8);
    transition: all 0.15s ease-in-out;
    &:hover {
      color: #fff;
    }
  }
  .as-img-viewer-toolbar__btn {
    background: transparent;
    font-size: 18px;
  }
  .as-img-viewer-toolbar__percent {
    font-size: 14px;
    width: initial;
  }
</style>
