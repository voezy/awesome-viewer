<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { ImgViewer } from '../../src/index';
  import list from './list';

  export let src = '';
  let imgViewer: ImgViewer;

  onMount(function() {
    imgViewer = new ImgViewer({
      imgState: {
        src,
        list,
      }
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
