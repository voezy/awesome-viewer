<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte';
  import './modal.scss';
  import { manager } from '../manager';
  import '../../assets/fonts/remixicon.css';
  export let visible = false;
  let el: HTMLElement;
  let container: HTMLElement;

  const dispatch = createEventDispatcher();

  $: {
    if (visible) {
      el && manager.show(el);
    } else {
      el && manager.hide(el);
    }
  }

  export function setHidingProgress(opacity = 1) {
    manager?.setHidingProgress(opacity);
  }

  export function getContainer(): HTMLElement {
    return container;
  }

  onDestroy(function() {
    el && manager.hide(el);
  });
</script>

<div bind:this={el} class="as-modal" style="display: { visible ? 'block' : 'none' }">
  <div bind:this={container} class="as-modal__container"></div>
  <button class="as-modal__close-btn as-reset-btn" on:click={() => dispatch('close')}>
    <i class="ri-close-line"></i>
  </button>
</div>

<style lang="scss">
  @import '../../assets/styles/mixins.scss';
  @import '../../assets/styles/reset.scss';

  .as-modal {
    @include as-fixed-full();
  }
  .as-modal__container {
    @include as-abs-full();
  }
  .as-modal__close-btn {
    position: absolute;
    top: 30px;
    right: 30px;
    width: 35px;
    height: 35px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 35px;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    &:hover {
      color: rgba(255, 255, 255, 0.8);
    }
  }
</style>
