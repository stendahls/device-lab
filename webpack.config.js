/* jshint esversion: 6 */

const webpack = require('webpack');
const webpackDevServer = require("webpack-dev-server");
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// the clean options to use
let cleanOptions = {
  root:     '/full/webpack/root/path',
  exclude:  ['shared.js'],
  verbose:  true,
  dry:      false
};

module.exports = {
    entry:  [
      './src/js/slice.js',
      './src/scss/slice.scss'
    ],
    devtool: 'source-map',
    output: {
        path:     path.resolve(__dirname, 'dist'),
        filename: 'slice.js',
    },
    module: {
        rules: [
            {
                test:   /\.js/,
                loader: 'babel-loader',
                include: __dirname + '/src',
                options: {
                    presets: ['es2015']
                }
            },
            {
                test:   /\.scss/,
                loaders: ExtractTextPlugin.extract(['css-loader', 'sass-loader'])
            }
        ],
    },
    plugins: [
      new CleanWebpackPlugin(['dist']),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('development')
        }
      }),
      new UglifyJSPlugin({ sourceMap: true }),
      new ExtractTextPlugin({ // define where to save the file
        filename: 'slice.css',
        allChunks: true,
      }),
      new HtmlWebpackPlugin({template: './src/slice.html'})
    ],
    devServer: {
      contentBase: path.join(__dirname, "dist"),
      compress: true,
      port: 3000
    }
};