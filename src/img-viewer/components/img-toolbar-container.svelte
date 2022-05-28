<script lang="ts">
  import ToolbarPC from './img-toolbar-pc.svelte';
  import ToolbarMB from './img-toolbar-mb.svelte';

  export let isMb = false;
  export let allowZoomIn = true;
  export let allowZoomOut = true;
  export let scaleRate = 1;
</script>

<div
  class="as-img-viewer-module__toolbar-wrap"
  class:as-img-viewer-module__toolbar-wrap--mb={isMb}
  class:as-img-viewer-module__toolbar-wrap--pc={!isMb}
>
  {#if isMb }
    <ToolbarMB
      on:back
      on:rotate
      on:info
    />
  {:else }
    <ToolbarPC
      scaleRate="{scaleRate}"
      allowZoomIn="{allowZoomIn}"
      allowZoomOut="{allowZoomOut}"
      on:zoom-in
      on:zoom-out
      on:recover
      on:rotate
      on:download
      on:info
    />
  {/if}
</div>

<style lang="scss">
  .as-img-viewer-module__toolbar-wrap {
    &--pc {
      position: absolute;
      bottom: 50px;
      left: 50%;
      transform: translateX(-50%);
    }
    &--mb {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
    }
  }
</style>
