<script lang="ts">
  import ImgDrawer from './img-drawer.svelte';
  import ImgInfoList from './img-info-list.svelte';
  import lineSvg from '../assets/img/remixicon-line.svg';
  import gitlabSvg from '../assets/img/github-line.svg';

  export let anchor = 'left';
  export let width: number | null = 0;
  export let height: number | null = 0;
  export let src = '';
  export let description = '';
  export let visible = false;
  export let zIndex: number | null = null;

  $: sectionList = [
    {
      title: 'Image',
      desc: description,
      items: [
        {
          name: 'Size',
          value: `${width}x${height}`,
        },
        {
          name: 'Source',
          type: 'link',
          value: src,
          link: src,
        },
      ],
    },
    {
      title: 'Dependencies',
      items: [
        {
          name: 'Icon',
          type: 'link',
          value: 'Remix Icon',
          link: 'http://remixicon.com/',
          ico: lineSvg,
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          name: 'Repo',
          type: 'link',
          value: 'Awewome viewer',
          link: 'https://github.com/voezy/awesome-viewer',
          ico: gitlabSvg
        },
      ],
    },
  ]
</script>

<ImgDrawer
  anchor={anchor}
  visible={visible}
  zIndex={zIndex}
  on:close
>
  <ImgInfoList
    list={sectionList}
  />
</ImgDrawer>
