'use strict';

var Hapi = require('hapi'),
    SocketIO = require('socket.io');

var server = new Hapi.Server();
server.connection({ port: 8000 });

var io = SocketIO.listen(server.listener);
io.sockets.on('connection', function(socket) {

    socket.emit({ msg: 'welcome' });
});


if (!module.parent) {
  server.start(function() {
    console.log("Server started.");
  });
}


function cb (err) {
  if (err) {
    console.log('Error when loading plugin', err);
    server.stop();
  }
}
