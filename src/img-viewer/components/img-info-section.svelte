<script lang="ts">
  import type { InfoSection } from '../image-viewer';
  export let section: InfoSection;
</script>

<div class="as-img-viewer-info-section">
  <p class="as-img-viewer-info-section__title">{ section.title }</p>
  {#if section.desc }
  <p class="as-img-viewer-info-section__desc">{ section.desc }</p>
  {/if}
  <ul class="as-img-viewer-info-section__items">
    {#each section.items as item (item.name)}
    <li class="as-img-viewer-info-section__item">
      <span class="as-img-viewer-info-section__name">{ item.name }:</span>
      <div class="as-img-viewer-info-section__value">
        {#if item.type === 'link' }
          <a href={item.link} target="_blank">
            {#if item.ico }
            <img class="as-img-viewer-info-section__value-ico" src={item.ico} alt={item.name} />
            {/if}
            <span>{ item.value }</span>
          </a>
        {:else}
          {#if item.ico }
          <img class="as-img-viewer-info-section__value-ico" src={item.ico} alt={item.name} />
          {/if}
          <span>{ item.value }</span>
        {/if}
      </div>
    </li>
    {/each}
  </ul>
</div>

<style lang="scss">
  @import '../../assets/styles/reset.scss';

  .as-img-viewer-info-section {
    background: rgba(#000, 0.5);
    border-radius: 5px;
    padding: 12px;
    box-sizing: border-box;
  }
  .as-img-viewer-info-section__items {
    @include as-reset-list();
  }
  .as-img-viewer-info-section__title {
    color: #fff;
    font-size: 16px;
    font-weight: 500;
    margin: 0;
    margin-bottom: 14px;
  }
  .as-img-viewer-info-section__desc {
    color: rgba(#fff, 0.9);
    font-size: 14px;
    margin: 10px 0;
  }
  .as-img-viewer-info-section__item {
    color: #fff;
    font-size: 12px;
    &:not(:first-child) {
      margin-top: 10px;
    }
  }
  .as-img-viewer-info-section__name {
    color: rgba(#fff, 0.9);
    margin-right: 6px;
  }
  .as-img-viewer-info-section__value {
    display: inline-block;
    a {
      @include as-reset-link();
      color: #fff;
      span {
        text-decoration: underline;
        word-break: break-word;
      }
    }
  }
  .as-img-viewer-info-section__value-ico {
    width: 14px;
    height: 14px;
    vertical-align: middle;
  }
</style>
