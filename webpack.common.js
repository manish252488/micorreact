/**
 * Common Webpack Configuration
 * 
 * This file contains shared webpack configuration used by all micro frontends.
 * App-specific configurations merge with this using webpack-merge.
 * 
 * Shared configurations:
 * - Module rules (Babel, CSS loaders)
 * - Resolve extensions
 * - Dev server settings (historyApiFallback, hot reload)
 * - HtmlWebpackPlugin
 */
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  devServer: {
    historyApiFallback: true,
    hot: true,
  },
  resolve: {
    extensions: [".jsx", ".js", ".json"],
  },
  module: {
    rules: [
      {
        test: /\.m?js/,
        type: "javascript/auto",
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          presets: ["@babel/preset-react"],
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
};

