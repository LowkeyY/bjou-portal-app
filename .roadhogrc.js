import PxToRem from 'postcss-pxtorem';

const path = require('path');
const { version } = require('./package.json');

const svgSpriteDirs = [
  path.resolve(__dirname, 'src/svg/'),
  require.resolve('antd-mobile')
    .replace(/warn\.js$/, '') // antd-mobile 内置svg
];

export default {
  entry: 'src/index.js',
  svgSpriteLoaderDirs: svgSpriteDirs,
  theme: './theme.config.js',
  publicPath: `./${version}/`,
  outputPath: `dist/www/${version}`,
  treeShaking: true,
  node: {
    fs: 'empty'
  },
  env: {
    development: {
      extraBabelPlugins: [
        'dva-hmr',
        'transform-runtime',
        'transform-decorators-legacy',
        [
          'import', [
          {
            'libraryName': 'antd-mobile',
            'style': true
          },
          {
            'libraryName': 'antd'
            // 'style': true,
          }
        ]
        ]
      ]
    },
    production: {
      extraBabelPlugins: [
        'transform-runtime',
        'transform-decorators-legacy',
        [
          'import', [
          {
            'libraryName': 'antd-mobile',
            'style': true
          },
          {
            'libraryName': 'antd'
            // 'style': true,
          }
        ]
        ]
      ]
    }
  },
  dllPlugin: {
    exclude: ['babel-runtime'],
    include: ['dva/router', 'dva/saga', 'dva/fetch']
  },
  autoprefixer: {
    browsers: [
      'iOS >= 8',
      'Android >= 4'
    ]
  },
  extraPostCSSPlugins: [
    PxToRem({
      rootValue: 100,
      propWhiteList: []
    })
  ]
};
