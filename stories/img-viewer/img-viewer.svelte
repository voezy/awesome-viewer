<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { ImgViewer } from '../../src/index';

  export let list: never[] = []
  let imgViewer: ImgViewer;

  onMount(function() {
    imgViewer = new ImgViewer({
      imgList: list
    });
  });

  onDestroy(function() {
    imgViewer?.destroy();
  });

  function toggleVisible() {
    imgViewer.show();
  }
</script>

<div
  class="c-img-viewer-demo"
>
  <button on:click={toggleVisible}>toggle visible</button>
</div>
