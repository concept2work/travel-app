const { merge } = require('webpack-merge');
const dotenv = require('dotenv').config({ path: './.env' });
const common = require('./webpack.common.js');

const {
  PORT_DEV_FRONTEND: port,
  NODE_ENV: mode,
  PORT_DEV_BACKEND: proxyport,
} = process.env;

module.exports = merge(common, {
  // output: {
  //   path: `${process.cwd()}/src/`,
  //   publicPath: '/',
  // },
  mode,
  devtool: 'source-map',
  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    port,
    proxy: {
      '/api': `http://localhost:${proxyport}`,
    },
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
});
