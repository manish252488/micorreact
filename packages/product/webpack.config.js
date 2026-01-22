const { merge } = require("webpack-merge");
const common = require("../../webpack.common.js");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

module.exports = merge(common, {
  devServer: {
    port: 3001,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "product",
      filename: "remoteEntry.js",
      exposes: {
        "./ProductApp": "./src/App",
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

