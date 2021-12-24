const baseWebpackConfig = require("./webpack.config.base");
const webpackMerge = require("webpack-merge");

const webpackConfig = webpackMerge.merge(baseWebpackConfig, {
  mode: "development",
  devtool: "eval-source-map",
  stats: { children: false },
});

module.exports = webpackConfig;
