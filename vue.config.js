const path = require('path');

module.exports = {
  configureWebpack: function(config)  {
    return {
      resolve: {
        modules: [
          path.resolve('./src'),
          path.resolve('node_compoents')
        ]
      },
      output: {
        globalObject: 'this',
        library: 'VueMicaSearch',
        libraryExport: 'default',
        libraryTarget: 'umd',
      }
    }
  }
};
