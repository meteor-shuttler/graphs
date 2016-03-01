Package.describe({
  name: 'shuttler:graphs',
  version: '0.0.1',
  summary: 'Oriented graph methods with shema and restrictions.',
  git: 'https://github.com/meteor-shuttler/graphs',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  
  api.use('mongo');
  api.use('ecmascript');
  
  api.use('stevezhu:lodash@4.3.0');
  api.use('aldeed:collection2@2.9.0');
  api.use('dburles:collection-helpers@1.0.4');
  api.use('matb33:collection-hooks@0.8.1');
  api.use('ivansglazunov:restrict@0.0.2');
  api.use('shuttler:ref@0.0.2');
  
  api.addFiles('graphs.js');
  
  api.export('Shuttler');
});