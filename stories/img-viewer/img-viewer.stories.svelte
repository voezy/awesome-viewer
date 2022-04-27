<script>
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
  import ImgViewer from './img-viewer.svelte';
</script>

<Meta
  title="img-viewer/img-viewer"
  component={ImgViewer}
  argTypes={{
    src: { control: "text" },
  }}
/>

<Template let:args>
  <ImgViewer
    {...args}
  />
</Template>

<Story
  name="basic"
  args={{
    src: 'https://via.placeholder.com/4000x2000',
  }}
/>
