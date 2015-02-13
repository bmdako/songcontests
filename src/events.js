'use strict';

var mysql = require('./mysql_client'),
    checksum = require('checksum'),
    salt = process.env.SALT;

module.exports.register = function (plugin, options, next) {

  plugin.route({
    method: 'GET',
    path: '/participated',
    handler: function (request, reply) {
      reply().code(501);
    },
    config: {
      cors: true
    }
  });

  plugin.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      mysql.query('SELECT * FROM events', function (err, events) {
        if (err) reply().code(500);
        else reply(events);
      });
    }
  });

  plugin.route({
    method: 'GET',
    path: '/{event}',
    handler: function (request, reply) {
      //console.log('cookies', request.state);
      selectEvent(request.params.event, function (err, result) {
        if (err) reply().code(500);
        else if (result === null) reply().code(404);
        else reply(result)
          .state('XSRF-TOKEN', checksum('somecookievalue' + salt, { algorithm: 'sha256' }));
      });
    },
    config: {
      cors: true,
      state: {
        parse: true
      }
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
      'SELECT songs.*, se.play_order, se.active, se.nowplaying, likes.likes, likes.dislikes, likes.total',
      'FROM songs',
      'JOIN song_event se ON se.song_id = songs.id',
      'LEFT JOIN (SELECT song_id, SUM(dislike=0) AS likes, SUM(dislike=1) AS dislikes, count(*) AS total FROM likes WHERE event_id = ' + mysql.escape(event.id) + ' GROUP BY event_id, song_id) AS likes ON likes.song_id = songs.id',
      'WHERE se.event_id = ' + mysql.escape(event.id),
      'ORDER BY se.play_order ASC'].join(' ');

    mysql.query(sql, function (err, songs) {
      event.active = songs.some(function (song) { return song.active === 1; });
      event.active_all = songs.length > 0 ? songs.every(function (song) { return song.active === 1; }) : false;

      songs.forEach(function (song, index) {
        if (song.nowplaying === 1) {
          event.nowplaying_id = song.id;
          event.nowplaying_index = index;
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
