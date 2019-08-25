/* config-overrides.js */
const rewireAliases = require("react-app-rewire-aliases");
const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");
// const { paths } = require("react-app-rewired");

var path = require("path");

module.exports = function override(config, env) {
  config.module.rules.push({
    test: /\.ts$/,
    use: ["awesome-typescript-loader"],
    enforce: "pre"
  });

  config.resolve.plugins = config.resolve.plugins.filter(
    plugin => !(plugin instanceof ModuleScopePlugin)
  );

  config = rewireAliases.aliasesOptions({
    "@common": path.resolve(
      __dirname,
      "node_modules/remarc-app-common/src/index.ts"
    )
  })(config, env);

  return config;
};
