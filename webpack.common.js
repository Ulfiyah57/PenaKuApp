const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    app: path.resolve(__dirname, 'src/script/index.js'),
    // sw: path.resolve(__dirname, 'src/public/sw.js'), // ✅ Tambahkan SW sebagai entry point
  },
  output: {
    filename: '[name].bundle.js', // gunakan [name] untuk app.bundle.js & sw.bundle.js
    path: path.resolve(__dirname, 'dist'),
    //publicPath: '/', // untuk mendukung SPA
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      // excludeChunks: ['sw'], // ✅ Jangan suntikkan sw.bundle.js ke HTML
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/public/'),
          to: path.resolve(__dirname, 'dist/'),
        },
      ],
    }),
  ],
};
