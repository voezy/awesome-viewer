const path = require('path');
const svelte = require('rollup-plugin-svelte');
const resolve = require('@rollup/plugin-node-resolve');
const autoPreprocess = require('svelte-preprocess');
const typescript = require('@rollup/plugin-typescript');
const scss = require('rollup-plugin-scss');
const terser = require("@rollup/plugin-terser");
const pkg = require('../package.json');

const name = pkg.name
	.replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
	.replace(/^\w/, m => m.toUpperCase())
	.replace(/-\w/g, m => m[1].toUpperCase());

module.exports = {
	input: path.join(__dirname, '../src/index.ts'),
	output: [
		{
      file: pkg.module,
      format: 'es',
    },
		{
      file: pkg.main,
      format: 'umd',
      name,
    }
	],
	plugins: [
		svelte({
      preprocess: autoPreprocess()
    }),
    scss({
      outputStyle: 'compressed',
      fileName: 'bundle.css'
    }),
    typescript({
      tsconfig: path.join(__dirname, '../tsconfig.json'),
      sourceMap: !process.env.production
    }),
    terser(),
		resolve(),
	]
};
