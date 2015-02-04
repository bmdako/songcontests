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

    socket.on('like', function (msg) {
      console.log('like vote', msg);
      // TODO: SQL upsert to likes
      castVote(msg.event, msg.song, msg.session, 0);

    });

    socket.on('dislike', function (msg) {
      console.log('dislike vote', msg);
      // TODO: SQL upsert to dislikes
      castVote(msg.event, msg.song, msg.session, 1);
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

function getSongVotes(event_id, song_id, callback) {
  var sql = [
    "SELECT SUM(dislike=0) AS likes, SUM(dislike=1) AS dislikes, COUNT(*) AS total",
    "FROM likes",
    "WHERE event_id = ", mysql.escape(event_id), " AND song_id = ", mysql.escape(song_id),
    "GROUP BY event_id, song_id"
  ].join(' ');

  mysql.queryOne(sql, function(err, result) {
    if(result) {
      result.song = song_id;
      result.event = event_id;
      result.score = result.total === 0 ? 0 : parseInt((result.likes / result.total) * 100);
      callback(result);
    }
  });
}

function castVote(event_id, song_id, token, vote) {
  var canvotesql = [
   ' SELECT true',
    'FROM song_event se',
    'JOIN events ON se.event_id = events.id AND events.status = "active"',
    'JOIN songs ON se.song_id = songs.id AND songs.status = "active"',
    'WHERE se.event_id =' +  mysql.escape(event_id) + ' AND se.song_id = ' + mysql.escape(song_id)
  ].join(' ');

  mysql.queryOne(canvotesql, function(err, result) {
    if (!result) {
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
      if(!result) {
        return;
      }

      getSongVotes(event_id,song_id, function(msg) {
        if(msg) {
          io.sockets.to('mgp2015').emit('newrating', msg);
        }
      });
    });
  });
}
