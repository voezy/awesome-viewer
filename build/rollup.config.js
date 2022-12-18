const path = require('path');
const svelte = require('rollup-plugin-svelte');
const resolve = require('@rollup/plugin-node-resolve');
const autoPreprocess = require('svelte-preprocess');
const typescript = require('@rollup/plugin-typescript');
const scss = require('rollup-plugin-scss');
const terser = require("@rollup/plugin-terser");
const commonjs = require('@rollup/plugin-commonjs');
const pkg = require('../package.json');
const copy = require('rollup-plugin-copy');
const image = require('@rollup/plugin-image');

const production = !process.env.ROLLUP_WATCH;
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
      sourcemap: !production,
    },
		{
      file: pkg.main,
      format: 'umd',
      name,
      sourcemap: !production,
    }
	],
	plugins: [
		svelte({
      preprocess: autoPreprocess({
        sourceMap: !production
      }),
      compilerOptions: {
        dev: !production,
        enableSourcemap: !production
      }
    }),
    scss({
      outputStyle: 'compressed',
      fileName: 'bundle.css'
    }),
    typescript({
      tsconfig: path.join(__dirname, '../tsconfig.json'),
      sourceMap: !production,
      inlineSources: !production
    }),
    terser(),
    commonjs(),
    image(),
    copy({
      targets: [{
        src: 'src/assets/icon/fonts/**/*',
        dest: 'dist/fonts'
      }]
    }),
		resolve()
	]
};
