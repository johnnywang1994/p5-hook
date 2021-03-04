import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import { terser } from "rollup-plugin-terser";

const isProd = process.env.NODE_ENV === 'production';

const config = {
  input: 'src/index.js',
  output: {
    name: 'p5Hook',
    file: `dist/p5-hook${isProd ? '.min' : ''}.js`,
    format: 'umd',
    // exports: 'default',
    compact: isProd
  },
  external: [
    'p5'
  ],
  plugins: [
    babel({ babelHelpers: 'bundled' }),
    (isProd && terser()),
    nodeResolve({
      skip: ['p5']
    }),
    commonjs()
  ],
};

export default config;
