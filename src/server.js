'use strict';

var Hapi = require('hapi'),
SocketIO = require('socket.io'),
Path = require('path');

var server = new Hapi.Server();
server.connection({ port: 8000 });
var io = SocketIO.listen(server.listener);
var connections = 0;

io.sockets.on('connection', function (socket) {
  console.log('New connection')

  socket.on('disconnect', function () {
    console.log('user disconnected');
  });

  socket.on('join', function (room) {
    console.log('join', room);
    socket.join(room);
    ++connections;
  });

  socket.on('leave', function (room) {
    console.log('leave');
    --connections;
  });

  socket.on('vote', function (msg) {
    console.log('vote', msg);
  });
});


server.route({
  method: 'POST',
  path: '/events/{name}',
  handler: function (request, reply) {
    console.log('event', request.params.name);
    io.sockets.to(request.params.name).emit('nowplaying', request.payload);
    reply();
  }
});


server.route({
  method: 'GET',
  path: '/',
  handler: {
     file: Path.join(__dirname, 'index.html')
   }
});


server.route({
  method: 'GET',
  path: '/artists',
  handler: function (request, reply) {
    reply([
      { order: 1,
        artist: 'Tina & Rene',
        title: 'Mi Amore'
      },
      { order: 2,
        artist: 'Anne Gadegaard',
        title: 'Suitcase'
      },
      { order: 3,
        artist: 'Babou',
        title: 'Manja'
      },
      { order: 4,
        artist: 'Cecilie Alexandra',
        title: 'Hotel A'
      },
      { order: 5,
        artist: 'Anti Social Media',
        title: 'The Way You Are'
      },
      { order: 6,
        artist: 'Julie Bjerre',
        title: 'Tæt På Mine Drømme'
      },
      { order: 7,
        artist: 'Andy Roda',
        title: 'Love Is Love'
      },
      { order: 8,
        artist: 'Sara Sukurani',
        title: 'Love Me Love Me'
      },
      { order: 9,
        artist: 'Marcel & Soulman Group',
        title: '(Ukendt titel)'
      },
      { order: 10,
        artist: 'World of Girls',
        title: 'Summer Without You'
      }
    ]);
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
