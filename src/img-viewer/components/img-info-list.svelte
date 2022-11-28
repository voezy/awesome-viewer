<script lang="ts">
  import InfoSectionComp from './img-info-section.svelte';
  import type { InfoSection } from '../image-viewer';
  export let list: InfoSection[] = [];
</script>

<div class="as-img-viewer-info__list">
  <ul class="as-img-viewer-info__items">
    {#each list as section (section.title)}
    <li class="as-img-viewer-info__item">
      <InfoSectionComp section={section} />
    </li>
    {/each}
  </ul>
</div>

<style lang="scss">
  @import '../../assets/styles/reset.scss';
  @import '../../assets/styles/mixins.scss';

  .as-img-viewer-info__list {
    @include as-fonts();
  }
  .as-img-viewer-info__items {
    @include as-reset-list();
  }
  .as-img-viewer-info__item {
    &:not(:first-child) {
      margin-top: 12px;
    }
  }
</style>
