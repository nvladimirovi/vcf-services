const { withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');
const { prepare } = require('./vcf-webpack-util');

const coreLibs = prepare();

const config = withModuleFederationPlugin({

  name: 'ui-plugin',

  exposes: {
    './Navigation': './projects/ui-plugin/src/bootstrap.plugin.ts',
  },

  shared: {
    ...coreLibs,
  },
});

module.exports = config;