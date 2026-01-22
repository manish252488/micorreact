const { merge } = require("webpack-merge");
const path = require("path");
const common = require("../../webpack.common.js");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

// Get remote URLs from environment variables with fallbacks
const getRemoteUrl = (name, defaultPort) => {
  const envVar = process.env[`REMOTE_${name.toUpperCase()}_URL`];
  if (envVar) {
    return `${name}@${envVar}`;
  }
  // Development fallback
  return `${name}@http://localhost:${defaultPort}/remoteEntry.js`;
};

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
        product: getRemoteUrl("product", 3001),
        cart: getRemoteUrl("cart", 3002),
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

