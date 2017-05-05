const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry:  './src/js/bundle.js',
    devtool: 'source-map',
    output: {
        path:     path.resolve(__dirname, 'dist2'),
        filename: 'bundle.js',
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
                loaders: ['style', 'css', 'sass'],
            },
            {
                test:   /\.html/,
                loader: 'html',
            }
        ],
    },
    plugins: [
      new UglifyJSPlugin({ sourceMap: true })
    ]
};