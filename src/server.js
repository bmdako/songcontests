'use strict';

var Hapi = require('hapi'),
    Path = require('path'),
    events = require('./events'),
    sockets = require('./sockets');

var server = new Hapi.Server();
server.connection({ port: 8000 });


server.register(events, { routes: { prefix: '/events' } }, function (err) {
  if (err) {
    console.log('Error when loading events plugin', err);
    server.stop();
  }
});

server.register(sockets, function (err) {
  if (err) {
    console.log('Error when loading sockets plugin', err);
    server.stop();
  }
});

server.route({
  method: 'GET',
  path: '/admin/{param*}',
  handler: {
    directory: {
      path: 'src/admin',
      index: false
    }
  }
});

if (!module.parent) {
  server.start(function () {
    console.log("Server started.");
  });
}

function cb (err) {
  if (err) {
    console.log('Error when loading plugin', err);
    server.stop();
  }
}
