<script>
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
  import ImgToolbar from '../../src/img-viewer/components/img-toolbar-mb.svelte';
</script>

<Meta
  title="img-viewer/img-toolbar"
  component={ImgToolbar}
  argTypes={{
    scaleRate: { control: "number" },
    onClickRotate: { action: "onClickRotate" },
  }}
/>

<Template let:args>
  <div class="p-img-viewer-toolbar__wrap">
    <ImgToolbar
      {...args}
      on:rotate={args.onClickRotate}
    />
  </div>
</Template>

<Story
  name="mb"
  args={{}}
/>

<style lang="scss">
  .p-img-viewer-toolbar__wrap {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }
</style>
