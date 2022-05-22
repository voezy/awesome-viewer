<script>
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
  import ImgInfoList from '../../src/img-viewer/components/img-info-list.svelte';
  import sectionList from './img-info-list';
</script>

<Meta
  title="img-viewer/img-info"
  component={ImgInfoList}
  argTypes={{}}
/>

<Template let:args>
  <ImgInfoList
    {...args}
  />
</Template>

<Story
  name="img-info-list"
  args={{
    list: sectionList
  }}
/>
