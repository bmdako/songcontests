'use strict';

var mysql = require('./mysql_client'),
  SocketIO = require('socket.io'),
  io,
  connections = 0;


module.exports.register = function (plugin, options, next) {

  io = SocketIO.listen(plugin.listener);

  io.sockets.on('connection', function (socket) {
    ++connections;
    console.log('New connection. Overall connection count:', connections);

    socket.on('disconnect', function () {
      --connections;
      console.log('User disconnected. Overall connection count:', connections);
    });

    socket.on('join', function (room) {
      socket.join(room);
      // console.log('User joining', room);
    });

    socket.on('leave', function (room) {
      socket.leave(room);
      // console.log('User leaving', room);
    });

    socket.on('like', function (msg) {
      // console.log('like vote', msg);
      castVote(msg.event, msg.song, msg.session, 0);

    });

    socket.on('dislike', function (msg) {
      // console.log('dislike vote', msg);
      castVote(msg.event, msg.song, msg.session, 1);
    });
  });

  plugin.route({
    method: 'POST',
    path: '/{name}',
    handler: function (request, reply) {
      setActiveSongs(request.payload, function (err) {
        if (err) {
          console.log('Error when setting nowplaying', err);
          return reply(err).code(500);
        }

        io.sockets.to(request.params.name).emit('nowplaying', request.payload);
        reply();
      });
    }
  });
};

module.exports.register.attributes = {
  name: 'sockets',
  version: '1.0.0'
};

function getSongVotes(event_id, event_ident, song_id, callback) {
  var sql = [
    "SELECT SUM(dislike=0) AS likes, SUM(dislike=1) AS dislikes, COUNT(*) AS total",
    "FROM likes",
    "WHERE event_id = ", mysql.escape(event_id), " AND song_id = ", mysql.escape(song_id),
    "GROUP BY event_id, song_id"
  ].join(' ');

  mysql.queryOne(sql, function(err, result) {
    if(result) {
      result.song = parseInt(song_id);
      result.event = event_ident;
      result.score = result.total === 0 ? 0 : parseInt((result.likes / result.total) * 100);
      callback(result);
    }
  });
}

function isVoteable(event_ident, song_id, callback) {
  var canvotesql = [
    'SELECT e.id, e.ident FROM song_event se, events e',
    'WHERE se.active = 1',
    'AND se.event_id = e.id',
    'AND se.song_id = ', mysql.escape(song_id),
    'AND e.ident = ', mysql.escape(event_ident)
  ].join(' ');
  mysql.queryOne(canvotesql, function(err, result) {
    callback(result);
  });
}

function castVote(event_ident, song_id, token, vote) {
  isVoteable(event_ident, song_id, function(result) {
    if(result) {

      var event = result;
      var sql = [
        'INSERT INTO likes (event_id, song_id, token, dislike)',
        'VALUES (',
        [mysql.escape(event.id), mysql.escape(song_id), mysql.escape(token), mysql.escape(vote)].join(','),
        ')',
        'ON DUPLICATE KEY UPDATE',
        'dislike = ', mysql.escape(vote)
      ].join(' ');

      mysql.query(sql, function(err, result) {
        if(result) {
          getSongVotes(event.id, event.ident, song_id, function(msg) {
            if(msg) {
              io.sockets.to(event_ident).emit('newrating', msg);
            }
          });
        }
      });
    } else {
      console.log('isVoteable returned an error', result);
    }
  });
}

function setActiveSongs (message, callback) {
  if (message.event === undefined || message.event === null) {
    return callback({error: 'Event missing from message.'});
  }

  if (message.active_all) {
    console.log('Setting all songs active for ' + message.event);

    var set_all_songs_active = [
      "UPDATE song_event",
      "SET active = 1, nowplaying = 0",
      "WHERE event_id = (SELECT id FROM events WHERE ident = " + mysql.escape(message.event) + ")"].join(' ');
    mysql.query(set_all_songs_active, callback);

  } else if (message.active !== null && message.active === false) {
    console.log('Setting all songs inctive for ' + message.event);

    var set_all_songs_inactive = [
      "UPDATE song_event",
      "SET active = 0, nowplaying = 0",
      "WHERE event_id = (SELECT id FROM events WHERE ident = " + mysql.escape(message.event) + ")"].join(' ');
    mysql.query(set_all_songs_inactive, callback);

  } else {
    if (message.song === undefined || message.song === null) {
      return callback({error: 'Song missing from message.'});
    }

    console.log('Setting nowplaying and active for song ' + message.song + " in event " + message.event);

    // mysql.getConnection(function (err, connection) {
    //   connection.beginTransaction(function (err) {
    //     if (err) return callback(err, null);

    //     connection.query("UPDATE song_event SET nowplaying = 0 WHERE event_id = (SELECT id FROM events WHERE ident=" + mysql.escape(message.event) + ") AND song_id != " + mysql.escape(message.song), function (err, result) {
    //       if (err) {
    //         connection.rollback(function () {
    //           callback(err, null);
    //         });
    //       } else {

    //         connection.query("UPDATE song_event SET active = 1, nowplaying = 1 WHERE event_id = (SELECT id FROM events WHERE ident=" + mysql.escape(message.event) + ") AND song_id = " + mysql.escape(message.song), function (err, result) {
    //           if (err) {
    //             connection.rollback(function () {
    //               callback(err, null);
    //             });
    //           } else {
    //             connection.commit(callback);
    //           }
    //         });
    //       }
    //     });
    //   });
    // });


    mysql.query("UPDATE song_event SET nowplaying = 0 WHERE event_id = (SELECT id FROM events WHERE ident=" + mysql.escape(message.event) + ") AND song_id != " + mysql.escape(message.song), function (err, result) {
      if (err) return callback(err, null);

      mysql.query("UPDATE song_event SET active = 1, nowplaying = 1 WHERE event_id = (SELECT id FROM events WHERE ident=" + mysql.escape(message.event) + ") AND song_id = " + mysql.escape(message.song), callback);
    });
  }
}
