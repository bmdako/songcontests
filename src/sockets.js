'use strict';

var mysql = require('./mysql_client'),
    SocketIO = require('socket.io'),
    io,
    connections = 0;


module.exports.register = function (plugin, options, next) {
  
  io = SocketIO.listen(plugin.listener);

  io.sockets.on('connection', function (socket) {
    console.log('New connection')
    ++connections;

    socket.on('disconnect', function () {
      console.log('user disconnected');
      --connections;
    });

    socket.on('join', function (room) {
      console.log('join', room);
      socket.join(room);
    });

    socket.on('leave', function (room) {
      console.log('leave');
      socket.join(room);
    });

    socket.on('upvote', function (msg) {
      console.log('vote', msg);
    });

    socket.on('downvote', function (msg) {
      console.log('vote', msg);
    });
  });

  plugin.route({
    method: 'POST',
    path: '/{name}',
    handler: function (request, reply) {
      io.sockets.to(request.params.name).emit('nowplaying', request.payload);
      reply();
    }
  });
};

module.exports.register.attributes = {
    name: 'sockets',
    version: '1.0.0'
};
