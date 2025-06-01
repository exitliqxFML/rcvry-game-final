/* eslint-disable @typescript-eslint/no-var-requires */
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const { DefinePlugin }    = require("webpack");

module.exports = function override(config) {
  //---------------------------------------------
  // 1.  Tell Webpack how to polyfill Node-core
  //---------------------------------------------
  config.resolve.fallback = {
    crypto      : require.resolve("crypto-browserify"),
    stream      : require.resolve("stream-browserify"),
    assert      : require.resolve("assert"),
    buffer      : require.resolve("buffer"),
    util        : require.resolve("util"),
    process     : require.resolve("process/browser"),
    path        : require.resolve("path-browserify"),
    http        : require.resolve("stream-http"),
    https       : require.resolve("https-browserify"),
    os          : require.resolve("os-browserify/browser"),
    zlib        : require.resolve("browserify-zlib")
  };

  //---------------------------------------------
  // 2.  Inject global shims so libs run happy
  //---------------------------------------------
  config.plugins.push(
    new NodePolyfillPlugin(),
    new DefinePlugin({
      "process.env": JSON.stringify(process.env) // keep env-vars working
    })
  );

  return config;
};
