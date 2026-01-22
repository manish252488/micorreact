const { merge } = require("webpack-merge");
const common = require("../../webpack.common.js");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

// Get host URL from environment variable with fallback
const getHostUrl = () => {
  const envVar = process.env.REMOTE_HOST_URL;
  if (envVar) {
    return `host@${envVar}`;
  }
  // Development fallback
  return "host@http://localhost:3000/remoteEntry.js";
};

module.exports = merge(common, {
  entry: "./src/index.jsx",
  devServer: {
    port: 3002,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "cart",
      filename: "remoteEntry.js",
      remotes: {
        host: getHostUrl(),
      },
      exposes: {
        "./CartApp": "./src/App",
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

