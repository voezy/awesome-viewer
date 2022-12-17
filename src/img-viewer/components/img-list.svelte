<div
  class="as-img-viewer-list__wrap"
  class:as-img-viewer-list__wrap--bottom={ anchor === 'bottom' }
  class:as-img-viewer-list__wrap--left={ anchor === 'left' }
>
  {#if list && list.length > 1 && !visible}
    <button class="as-img-viewer-list__open-btn" on:click={onClickOpen}>
      <i class="ri-layout-grid-fill"></i>
    </button>
  {/if}
  <ImgDrawer
    fitContent
    maskEnabled={false}
    anchor={anchor}
    visible={visible}
    zIndex={zIndex}
    on:close
  >
    {#if list && list.length }
      <div
        bind:this={listEl}
        class="as-img-viewer-list"
        class:as-img-viewer-list--bottom={ anchor === 'bottom' }
        class:as-img-viewer-list--left={ anchor === 'left' }
      >
        {#each list as item, i }
          <div class="as-img-viewer-list__item" on:click={ () => onClickImg(i) }>
            <div
              class="as-img-viewer-list__item__img"
              data-src={item.thumbnail || item.src}
            ></div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="as-img-viewer-list__default">
        No data
      </div>
    {/if}
    <button class="as-img-viewer-list__close-btn" on:click={onClickClose}>
      {#if anchor === 'left'}
        <i class="ri-arrow-left-s-line"></i>
      {:else if anchor === 'bottom' && visible}
        <i class="ri-close-line"></i>
      {/if}
    </button>
  </ImgDrawer>
</div>

<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import ImgDrawer from './img-drawer.svelte';
  import type { ImgItem } from '../image-viewer';

  export let list: ImgItem[] = [];
  export let anchor = 'left';
  export let zIndex: number | null;
  export let visible = false;
  let listEl: HTMLElement
  const dispatch = createEventDispatcher();
  let observer: IntersectionObserver

  onMount(() => {
    initIntersectionObserver();
  })

  onDestroy(() => {
    removeIntersectionObserver();
  })

  function initIntersectionObserver() {
    observer = new IntersectionObserver(onIntersecting, {});
    listEl && [...listEl.children].forEach((item) => {
      observer.observe(item)
    });
  }

  function removeIntersectionObserver() {
    observer.disconnect()
  }

  function onIntersecting(changes: IntersectionObserverEntry[]) {
    changes.forEach((entry) => {
      const { isIntersecting, target } = entry;
      const el: HTMLElement = entry.target.children[0] as HTMLElement;
      if (isIntersecting) {
        el.style.backgroundImage = `url(${el.dataset.src})`;
        observer.unobserve(target);
      }
    })
  }

  function onClickOpen() {
    visible = true;
    dispatch('open');
  }

  function onClickClose() {
    visible = false;
    dispatch('close');
  }

  function onClickImg(index: number) {
    dispatch('click-img', { index });
  }
</script>

<style lang="scss">
  @import '../../assets/styles/reset.scss';
  @import '../../assets//styles/mixins.scss';

  .as-img-viewer-list__wrap {
    &:hover {
      .as-img-viewer-list__close-btn {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
  .as-img-viewer-list__default {
    font-size: 14px;
    min-width: 120px;
    text-align: center;
    margin: 20px auto;
    color: #fff;
  }
  .as-img-viewer-list__open-btn {
    @include as-reset-btn();
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }
  .as-img-viewer-list__wrap--left {
    .as-img-viewer-list__open-btn {
      position: absolute;
      bottom: 20px;
      left: 20px;
      width: 40px;
      height: 40px;
      line-height: 40px;
      font-size: 22px;
      background: rgba(#000, 0.5);
      color: rgba(#fff, 0.5);
      &:hover {
        color: rgba(#fff, 0.8);
      }
    }
    .as-img-viewer-list__close-btn {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 35px;
      line-height: 35px;
      font-size: 25px;
      color: rgba(#fff, 0.6);
      cursor: pointer;
      background: linear-gradient(to bottom, rgba(#000, 0), rgba(#000, 0.3));
      opacity: 0;
      transition: all 0.2s ease-in-out;
      transform: translateY(100%);
      &:hover {
        color: rgba(#fff, 0.9);
        background: linear-gradient(to bottom, rgba(#000, 0), rgba(#000, 0.5));
      }
    }
  }
  .as-img-viewer-list__wrap--bottom {
    .as-img-viewer-list__open-btn {
      position: absolute;
      bottom: 10px;
      right: 10px;
      width: 35px;
      height: 35px;
      line-height: 35px;
      font-size: 20px;
      background: rgba(#000, 0.6);
      color: rgba(#fff, 0.6);
    }
    .as-img-viewer-list__close-btn {
      position: absolute;
      right: 10px;
      bottom: calc(100% + 5px);
      width: 35px;
      height: 35px;
      line-height: 35px;
      font-size: 20px;
      border-radius: 8px;
      background: rgba(#000, 0.3);
      color: rgba(#fff, 0.6);
      transition: all 0.2s ease-in-out;
    }
  }
  .as-img-viewer-list {
    @include as-reset-list();
    margin: 0 auto;
    height: 100%;
    overflow: auto;
    min-width: 120px;
    @include scrollbar();
  }

  .as-img-viewer-list__close-btn {
    @include as-reset-btn();
  }
  .as-img-viewer-list--left {
    width: fit-content;
    padding: 0 10px;
    .as-img-viewer-list__item {
      width: 120px;
      height: 120px;
      cursor: pointer;
      background: rgba(#ccc, 0.3);
      &:not(:last-child) {
        margin-bottom: 20px;
      }
    }
  }
  .as-img-viewer-list--bottom {
    height: fit-content;
    white-space: nowrap;
    overflow-x: auto;
    .as-img-viewer-list__item {
      width: 80px;
      height: 80px;
      display: inline-block;
      &:not(:last-child) {
        margin-right: 20px;
      }
    }
  }
  .as-img-viewer-list__item__img {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    border-radius: 3px;
  }
</style>
