<div>
  <button
    class="as-img-viewer-switch-btn-pc as-img-viewer-switch-btn-pc--prev"
    style:display={ isPrevExists ? 'block' : 'none' }
    on:click={onClickPrev}
  >
    <i class="ri-arrow-left-s-line"></i>
  </button>
  <button
    class="as-img-viewer-switch-btn-pc as-img-viewer-switch-btn-pc--next"
    style:display={ isNextExists ? 'block' : 'none' }
    on:click={onClickNext}
  >
    <i class="ri-arrow-right-s-line"></i>
  </button>
</div>

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let isPrevExists = false;
  export let isNextExists = false;

  const dispatch = createEventDispatcher();

  function onClickPrev() {
    dispatch('prev');
  }

  function onClickNext() {
    dispatch('next');
  }
</script>

<style lang="scss">
  @import '../../assets/styles/reset.scss';

  $btn-size: 50px;
  .as-img-viewer-switch-btn-pc {
    @include as-reset-btn();
    position: absolute;
    top: 50%;
    width: $btn-size;
    height: $btn-size;
    font-size: $btn-size;
    color: rgba(#fff, 0.5);
    cursor: pointer;
    transition: all 0.15s ease-in;
    &:hover {
      color: rgba(#fff, 0.8);
    }
    &--prev {
      left: 20px;
    }
    &--next {
      right: 20px;
    }
  }
</style>
