<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { ImgViewer } from '../../src/index';
  import list from './list';

  export let src = '';
  let imgViewer: ImgViewer;
  let container: HTMLElement;

  onMount(function() {
    imgViewer = new ImgViewer({
      el: container,
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
  <div bind:this={container}>
  </div>
</div>
