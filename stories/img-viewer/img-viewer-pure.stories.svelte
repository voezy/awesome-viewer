<script>
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
  import ImgViewerPure from '../../src/img-viewer/img-viewer-pure.svelte';
</script>

<Meta
  title="img-viewer/img-viewer-pure"
  component={ImgViewerPure}
  argTypes={{
    src: { control: "text" },
    scaleRate: { control: "number" },
  }}
/>

<Template let:args>
  <ImgViewerPure
    {...args}
  />
</Template>

<Story
  name="basic"
  args={{
    src: 'https://via.placeholder.com/4000x2000',
    scaleRate: 1
  }}
/>
