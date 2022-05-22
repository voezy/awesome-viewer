<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function onClickBack() {
    dispatch('back');
  }

  function onClickRotate() {
    dispatch('rotate');
  }

  function onClickInfo() {
    dispatch('info');
  }
</script>

<div class="as-img-viewer-toolbar-mb">
  <button
    class="as-img-viewer-toolbar-mb__back as-img-viewer-toolbar-mb__btn as-img-viewer-toolbar-mb__btn--close"
    on:click={onClickBack}
  >
    <i class="ri-arrow-left-s-line"></i>
  </button>
  <div class="as-img-viewer-toolbar-mb__tools">
    <button class="as-img-viewer-toolbar-mb__btn" on:click={onClickRotate}>
      <i class="ri-clockwise-line"></i>
    </button>
    <button class="as-img-viewer-toolbar-mb__btn" on:click={onClickInfo}>
      <i class="ri-information-line"></i>
    </button>
  </div>
</div>

<style lang="scss">
  @import '../../assets/styles/reset.scss';
  $size: 45px;

  .as-img-viewer-toolbar-mb {
    height: $size;
    padding: 0 3px;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    color: #fff;
    background-color: rgba(#000, 0.3);
  }

  .as-img-viewer-toolbar-mb__btn {
    width: $size;
    height: $size;
    color: rgba(#fff, 0.7);
    vertical-align: top;
    font-size: 20px;
    text-align: center;
    @include as-reset-btn();
    &--close {
      font-size: 22px;
    }
  }
</style>
