<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import '../../assets/icon/remixicon.css';
  export let scaleRate = 1;
  export let allowZoomIn = true;
  export let allowZoomOut = true;

  const dispatch = createEventDispatcher();

  $: scalePercent = `${ Math.round(scaleRate * 100) }%`;

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

  function onClickInfo() {
    dispatch('info');
  }
</script>

<div class="as-img-viewer-toolbar">
  <button
    class="as-img-viewer-toolbar__tool as-img-viewer-toolbar__btn"
    class:as-img-viewer-toolbar__btn--disabled={!allowZoomOut}
    on:click={onClickZoomOut}
  >
    <i class="ri-zoom-out-line"></i>
  </button>
  <div
    class="as-img-viewer-toolbar__tool as-img-viewer-toolbar__percent"
    on:click={onClickRecover}
  >
    <span>{ scalePercent }</span>
  </div>
  <button
    class="as-img-viewer-toolbar__tool as-img-viewer-toolbar__btn"
    class:as-img-viewer-toolbar__btn--disabled={!allowZoomIn}
    on:click={onClickZoomIn}
  >
    <i class="ri-zoom-in-line"></i>
  </button>
  <button
    class="as-img-viewer-toolbar__tool as-img-viewer-toolbar__btn"
    on:click={onClickRotate}
  >
    <i class="ri-clockwise-line"></i>
  </button>
  <button
    class="as-img-viewer-toolbar__tool as-img-viewer-toolbar__btn"
    on:click={onClickDownload}
  >
    <i class="ri-download-line"></i>
  </button>
  <button
    class="as-img-viewer-toolbar__tool as-img-viewer-toolbar__btn"
    on:click={onClickInfo}
  >
    <i class="ri-information-line"></i>
  </button>
</div>

<style lang="scss">
  @import '../../assets/styles/reset.scss';

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
    @include as-reset-btn();
  }
  .as-img-viewer-toolbar__btn {
    background: transparent;
    font-size: 18px;
    &--disabled:hover {
      cursor: not-allowed;
      color: rgba(#fff, 0.8);
    }
  }
  .as-img-viewer-toolbar__percent {
    font-size: 14px;
    width: initial;
  }
</style>
