<script>
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
  import MyComponent from '../../src/Component.svelte';
</script>

<Meta
  title="img-viewer/area"
  component={MyComponent}
  argTypes={{}}
/>

<Template let:args>
  <MyComponent />
</Template>

<Story
  name="basic"
  args={{}}
/>
