<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

  export let anchor = 'left';
  export let visible = false;
  export let zIndex: number | null;

  const dispatch = createEventDispatcher();
  let anchorClass: string;
  let drawerStyle: string = '';
  const progress = tweened(0, {
    duration: 200,
    easing: cubicOut
  });

  $: {
    if (anchor === 'bottom') {
      anchorClass = 'as-img-viewer-drawer__main--bottom'
    } else {
      anchorClass = 'as-img-viewer-drawer__main--left'
    }
  }
  $: {
    if (visible) {
      progress.set(1);
    } else {
      progress.set(0);
    }
  }

  progress.subscribe((newProgress) => {
    if (newProgress === 0) {
      drawerStyle = 'display: none';
    } else if (newProgress !== 1) {
      const diff = (1 - newProgress) * 100;
      let x = '0';
      let y = '0';
      if (anchor === 'left') {
        x = `-${diff}%`;
      } else {
        y = `${diff}%`;
      }
      drawerStyle = `transform: translate(${x}, ${y}); z-index: ${zIndex};`;
    } else {
      drawerStyle = `z-index: ${zIndex};`;
    }
  });

  function onClickClose() {
    visible = false;
    dispatch('close');
  }
</script>

<div class="as-img-viewer-drawer">
  {#if visible }
    <div
      transition:fade="{{ duration: 150 }}"
      class="as-img-viewer-drawer__mask"
      style={`z-index: ${zIndex}`}
      on:click={onClickClose}
    ></div>
  {/if}
  <div
    class={`as-img-viewer-drawer__main ${ anchorClass }`}
    style="{drawerStyle}"
  >
    <div
      class="as-img-viewer-drawer__inner-wrap"
    >
      <slot></slot>
    </div>
  </div>
</div>

<style lang="scss">
  @import '../../assets/styles/mixins.scss';

  .as-img-viewer-drawer__mask {
    @include as-abs-full();
    background-color: rgba(#000, 0.5);
  }
  .as-img-viewer-drawer__main {
    position: absolute;
    padding: 16px;
    box-sizing: border-box;
    background-color: rgba(#333, 0.9);
    .as-img-viewer-drawer__inner-wrap {
      height: 100%;
      overflow: auto;
    }
    &--bottom {
      left: 0;
      bottom: 0;
      max-height: 400px;
      width: 100%;
      display: flex;
      flex-direction: column;
      .as-img-viewer-drawer__inner-wrap {
        flex: 1;
      }
    }
    &--left {
      left: 0;
      top: 0;
      width: 300px;
      height: 100%;
    }
  }
</style>
