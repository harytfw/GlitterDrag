const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
module.exports = {
    entry: {
        bg: './src/bg/bg.js',
        cs: './src/cs/cs.js',
        options: './src/options/options.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    mangle: false, // Note `mangle.properties` is `false` by default.
                    compress: false,
                },
            }),
        ],
    },
    module: {
        rules: [{
            test: /\.html$/i,
            loader: 'html-loader',
            options: {
                minimize: true,
            }
        }, {
            test: /\.css$/i,
            use: ['style-loader', 'css-loader'],
        }, ],
    },
    target: 'web',
    mode: 'development',
    devtool: 'source-map',
};
