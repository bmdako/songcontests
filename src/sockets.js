'use strict';

var mysql = require('./mysql_client'),
  SocketIO = require('socket.io'),
  io,
  connections = 0,
  likes = 0,
  dislikes = 0;


module.exports.register = function (plugin, options, next) {

  io = SocketIO.listen(plugin.listener);

  io.sockets.on('connection', function (socket) {
    console.log('New connection. Connection count:', connections);
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
      console.log('leave', room);
      socket.leave(room);
    });

    socket.on('like', function (msg, callback) {
      console.log('vote', msg);
      // TODO: SQL upsert to likes
      castVote(msg.event, msg.song, msg.session, 0, function(message) {
        console.log('message', message);
      });
      io.sockets.to('mgp2015').emit('newrating', {
        song: msg.song,
        event: msg.event,
        likes: ++likes,
        dislikes: dislikes
      });
    });

    socket.on('dislike', function (msg) {
      console.log('vote', msg);
      // TODO: SQL upsert to dislikes
      castVote(msg.event, msg.song, msg.session, 1, function(message) {
        console.log('message', message);
      });
      io.sockets.to('mgp2015').emit('newrating', {
        song: msg.song,
        event: msg.event,
        likes: likes,
        dislikes: ++dislikes
      });
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

function castVote(event_id, song_id, token, vote, callback) {
  var canvotesql = [
   ' SELECT true',
    'FROM song_event se',
    'JOIN events ON se.event_id = events.id AND events.status = "active"',
    'JOIN songs ON se.song_id = songs.id AND songs.status = "active"',
    'WHERE se.event_id =' +  mysql.escape(event_id) + ' AND se.song_id = ' + mysql.escape(song_id)
  ].join(' ');

  mysql.queryOne(canvotesql, function(error, result) {
    if (!result) {
      callback('no dice!');
      return;
    }

    var sql = [
      'INSERT INTO likes (event_id, song_id, token, dislike)',
      'VALUES (',
      [mysql.escape(event_id), mysql.escape(song_id), mysql.escape(token), mysql.escape(vote)].join(','),
      ')',
      'ON DUPLICATE KEY UPDATE',
      'dislike = ', mysql.escape(vote)
    ].join(' ');
    mysql.query(sql, function(err, result) {
      callback(result);
    });
  });
}
