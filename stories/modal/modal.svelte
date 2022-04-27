<script>
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
  import ImgToolbar from '../../src/img-viewer/components/img-toolbar.svelte';
</script>

<Meta
  title="img-viewer/img-toolbar"
  component={ImgToolbar}
  argTypes={{
    scaleRate: { control: "number" },
    onClickZoomIn: { action: "onClickZoomIn" },
    onClickZoomOut: { action: "onClickZoomOut" },
    onClickRecover: { action: "onClickRecover" },
    onClickRotate: { action: "onClickRotate" },
    onClickDownload: { action: "onClickDownload" },
  }}
/>

<Template let:args>
  <ImgToolbar
    {...args}
    on:zoom-in={args.onClickZoomIn}
    on:zoom-out={args.onClickZoomOut}
    on:recover={args.onClickRecover}
    on:rotate={args.onClickRotate}
    on:download={args.onClickDownload}
  />
</Template>

<Story
  name="basic"
  args={{}}
/>
