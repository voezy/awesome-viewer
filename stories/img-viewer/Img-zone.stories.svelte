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
    src: '//liveimages.videocc.net/uploadimage/20220331/live-watch_854934_16487419557331.jpeg',
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
