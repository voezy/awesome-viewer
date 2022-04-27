module.exports = {
  "stories": [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx|svelte)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-svelte-csf",
    '@storybook/preset-scss'
  ],
  "framework": "@storybook/svelte",
  "svelteOptions": {
    "preprocess": require("svelte-preprocess")()
  }
}
