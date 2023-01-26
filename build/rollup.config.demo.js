const serve = require('rollup-plugin-serve');
const scss = require('rollup-plugin-scss');
const copy = require('rollup-plugin-copy');
const terser = require("@rollup/plugin-terser");

console.log(process.env.NODE_ENV)

module.exports = {
  input: 'demo/index.js',
  output: {
    file: 'demo/dist/dist.js',
    format: 'umd',
  },
  plugins: [
    scss({
      outputStyle: 'compressed',
      fileName: 'bundle.css'
    }),
    terser(),
    copy({
      targets: [{
        src: 'dist/fonts/**/*',
        dest: 'demo/dist/fonts'
      }]
    }),
    process.env.NODE_ENV === 'dev' ? serve({
      open: false,
      port: 8888,
      contentBase: 'demo',
    }) : null
  ]
};
