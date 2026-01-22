const { merge } = require("webpack-merge");
const path = require("path");
const common = require("../../webpack.common.js");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

module.exports = merge(common, {
  entry: "./src/index.jsx",
  devServer: {
    port: 3000,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  resolve: {
    alias: {
      'host/utils': path.resolve(__dirname, '../shared-utils/src/index.js'),
      'host/store': path.resolve(__dirname, './src/store/index.js'),
    },
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "host",
      filename: "remoteEntry.js",
      remotes: {
        product: "product@http://localhost:3001/remoteEntry.js",
        cart: "cart@http://localhost:3002/remoteEntry.js",
      },
      exposes: {
        "./store": "./src/store",
        "./utils": "../shared-utils/src/index",
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: "^18.2.0",
          eager: true,
        },
        "react-dom": {
          singleton: true,
          requiredVersion: "^18.2.0",
          eager: true,
        },
        "react-redux": {
          singleton: true,
          requiredVersion: "^8.1.3",
          eager: true,
        },
        redux: {
          singleton: true,
          requiredVersion: "^4.2.1",
          eager: true,
        },
      },
    }),
  ],
});

