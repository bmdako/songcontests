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
      'SELECT songs.*, se.play_order, likes.likes, likes.dislikes, likes.total',
      'FROM songs',
      'JOIN song_event se ON se.song_id = songs.id',
      'LEFT JOIN (SELECT song_id, SUM(dislike=0) AS likes, SUM(dislike=1) AS dislikes, count(*) AS total FROM likes WHERE event_id = ' + mysql.escape(event.id) + ' GROUP BY event_id, song_id) AS likes ON likes.song_id = songs.id',
      'WHERE se.event_id = ' + mysql.escape(event.id),
      'ORDER BY se.play_order ASC'].join(' ');

    mysql.query(sql, function (err, songs) {

      songs.forEach(function (song, index) {
        if (song.status === 'active') {
          event.active_song_id = song.id;
          event.active_song_index= index;
        }

        song.likes = song.likes === null ? 0 : song.likes;
        song.dislikes = song.dislikes === null ? 0 : song.dislikes;
        song.total = song.total === null ? 0 : song.total;
        song.score = song.total === 0 ? 0 : parseInt((song.likes / song.total) * 100);
      });

      event.songs = songs;

      callback(err, event);
    });
  });
}
