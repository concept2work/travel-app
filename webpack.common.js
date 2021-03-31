const path = require('path');
const loader = require('sass-loader');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv').config({ path: './.env' });
// const jquery = require('jquery');
// require('jquery-ui-bundle');

module.exports = {
  entry: {
    entry: './src/client/index.js',
  },
  output: {
    libraryTarget: 'var',
    library: 'Client',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/i,
        loader: 'file-loader',
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        loader: 'file-loader',
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({
      dry: true,
      verbose: true,
      cleanStaleWebpackAssets: true,
      protectWebpackAssets: false,
      exclude: ['cache'],
    }),
    new HtmlWebPackPlugin({
      template: './src/client/views/index.html',
      filename: './index.html',
    }),
    new webpack.DefinePlugin({
      'process.env.PORT_DEV': JSON.stringify(process.env.PORT_DEV_FRONTEND),
      'process.env.PORT_DEV_PROXY': JSON.stringify(process.env.PORT_DEV_BACKEND),
      'process.env.PORT_PROD': JSON.stringify(process.env.PORT_PROD),
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
  ],
};
