<script>
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
  import ImgViewer from './img-viewer.svelte';
  import list from './list';
</script>

<svelte:head>
	<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
</svelte:head>

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
    list,
  }}
/>
