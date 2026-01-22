const { merge } = require("webpack-merge");
const common = require("../../webpack.common.js");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

module.exports = merge(common, {
  devServer: {
    port: 3000,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "host",
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
        },
        "react-dom": {
          singleton: true,
          requiredVersion: "^18.2.0",
        },
        "react-redux": {
          singleton: true,
          requiredVersion: "^8.1.3",
        },
        redux: {
          singleton: true,
          requiredVersion: "^4.2.1",
        },
      },
    }),
  ],
});

