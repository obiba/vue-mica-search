const path = require('path');

module.exports = {
  configureWebpack: function(config)  {
    return {
      mode: 'development',
      output: {
        globalObject: 'this',
        library: 'VueObibaSearchResult',
        libraryExport: 'default',
        libraryTarget: 'umd',
      }
    }
  }
};
