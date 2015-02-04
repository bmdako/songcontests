'use strict';

var mysql = require('./mysql_client');

module.exports.register = function (plugin, options, next) {

  plugin.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply().code(501);
    },
    config: {
      cors: true
    }
  });

  plugin.route({
    method: 'GET',
    path: '/{event}',
    handler: function (request, reply) {
      selectEvent(request.params.event, function (err, result) {
        if (err) reply().code(500);
        else if (result === null) reply().code(404);
        else reply(result);
      });
    },
    config: {
      cors: true
    }
  });
};

module.exports.register.attributes = {
    name: 'events',
    version: '1.0.0'
};

function selectEvent(ident, callback) {

  mysql.queryOne('SELECT * FROM events WHERE ident = ' + mysql.escape(ident), function (err, event) {
    if (err) return callback (err, null);
    if (event === null) return callback (null, null);

    var sql = [
      'SELECT songs.*, se.play_order',
      'FROM songs',
      'LEFT JOIN song_event se ON se.song_id = songs.id',
      'LEFT JOIN likes ON se.song_id = likes.song_id AND se.event_id = likes.event_id AND likes.dislike = 0',
      'LEFT JOIN likes as dislikes ON se.song_id = dislikes.song_id AND se.event_id = dislikes.event_id AND dislikes.dislike = 1',
      'WHERE se.event_id = ' + mysql.escape(event.id),
      'ORDER BY se.play_order ASC'].join(' ');

    mysql.query(sql, function (err, songs) {

      songs.forEach(function (song, index) {
        if (song.status === 'active') {
          event.active_song_id = song.id;
          event.active_song_index= index;
        }
      });

      event.songs = songs;

      callback(err, event);
    });
  });
}
