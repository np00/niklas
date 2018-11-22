var require = {
  baseUrl: 'js',
  paths: {
    mode: '../mode',
  }, 
  shim: { // see http://requirejs.org/docs/api.html#config-shim
    'N3': {
      exports: 'N3'
    }
  }
};
