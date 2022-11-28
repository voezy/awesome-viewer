import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import autoPreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import css from 'rollup-plugin-css-only';
import scss from 'rollup-plugin-scss';
import pkg from './package.json';


const name = pkg.name
	.replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
	.replace(/^\w/, m => m.toUpperCase())
	.replace(/-\w/g, m => m[1].toUpperCase());

export default {
	input: 'src/index.ts',
	output: [
		{
      file: pkg.module,
      format: 'es',
      sourcemap: true,
    },
		{
      file: pkg.main,
      format: 'umd',
      name,
      sourcemap: true,
    }
	],
	plugins: [
		svelte({
      preprocess: autoPreprocess()
    }),
    scss(),
		css({ output: 'bundle.css' }),
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: !process.env.production
    }),
		resolve()
	]
};
