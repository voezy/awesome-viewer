<script>
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
  import ImgZone from '../../src/img-viewer/img-zone.svelte';
</script>

<Meta
  title="img-viewer/img-zone"
  component={ImgZone}
  argTypes={{
    src: { control: "text" },
    scaleRate: { control: "number" }
  }}
/>

<Template let:args>
  <div class="p-img-viewer__wrap">
    <ImgZone {...args} />
  </div>
</Template>

<Story
  name="basic"
  args={{
    src: 'https://via.placeholder.com/4000x2000',
    scaleRate: 1
  }}
/>

<style lang="scss">
  .p-img-viewer__wrap {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>
