import * as babel from 'babel-core';
import plugin from '../src';

export const transform = (example, options) => {
  const { code } = babel.transform(example, {
    plugins: [
      'syntax-class-properties',
      'syntax-jsx',
      options ? [plugin, options] : plugin
    ]
  });

  return code;
};

export const transformModule = (example, options) => {
  const { code } = babel.transform(example, {
    presets: ['env', 'react'],
    plugins: [
      'transform-class-properties',
      options ? [plugin, options] : plugin
    ]
  });

  return code;
};
