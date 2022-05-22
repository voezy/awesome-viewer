<script>
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
  import ImgInfoList from '../../src/img-viewer/components/img-info-list.svelte';
  import ImgDrawer from '../../src/img-viewer/components/img-drawer.svelte';
  import sectionList from './img-info-list';
</script>

<Meta
  title="img-viewer/img-drawer"
  component={ImgDrawer}
  argTypes={{
    visible: { control: "boolean" },
    onClickClose: { action: "onClickClose" },
  }}
/>

<Template let:args>
  <ImgDrawer
    {...args}
    on:click-close={args.onClickClose}
  >
    <ImgInfoList
      list={sectionList}
    />
  </ImgDrawer>
</Template>

<Story
  name="img-drawer"
  args={{
    anchor: 'left',
    visible: true,
  }}
/>
