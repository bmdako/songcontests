'use strict';

var mysql = require('./mysql_client');

module.exports.register = function (plugin, options, next) {

  plugin.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply().code(501);
    }
  });

  plugin.route({
    method: 'GET',
    path: '/{event}',
    handler: function (request, reply) {
      if (request.params.event === 'mgp2015')
        reply(mgp2015);
      else
        reply().code(404);
    }
  });
};

module.exports.register.attributes = {
    name: 'events',
    version: '1.0.0'
};


var songs =
[
  {
    id: 1,
    title: 'Mi Amore',
    order: 1,
    berlingske_review: '',
    berlingske_rating: 0,
    artist: 'Tina & Rene',
    description: '',
    country: '',
    flag: '',
    image: 'https://s3-eu-west-1.amazonaws.com/bem-wordpress-content/songcontests/mgp2015/tina_%26_rene%CC%81.jpeg',
  },{
    id: 2,
    title: 'Suitcase',
    order: 2,
    berlingske_review: '',
    berlingske_rating: 0,
    status: 'active',
    artist: 'Anne Gadegaard',
    description: '',
    country: '',
    flag: '',
    image: 'https://s3-eu-west-1.amazonaws.com/bem-wordpress-content/songcontests/mgp2015/anne_gadegaard.jpeg',
  },{
    id: 3,
    title: 'Manja',
    order: 3,
    berlingske_review: '',
    berlingske_rating: 0,
    status: 'pending',
    artist: 'Babou',
    description: '',
    country: '',
    flag: '',
    image: 'https://s3-eu-west-1.amazonaws.com/bem-wordpress-content/songcontests/mgp2015/babou.jpeg',
  },{
    id: 4,
    title: 'Hotel A',
    order: 4,
    berlingske_review: '',
    berlingske_rating: 0,
    status: 'pending',
    artist: 'Cecilie Alexandra',
    description: '',
    country: '',
    flag: '',
    image: 'https://s3-eu-west-1.amazonaws.com/bem-wordpress-content/songcontests/mgp2015/cecilie_alexandra.jpeg',
  },{
    id: 5,
    title: 'The Way You Are',
    order: 5,
    berlingske_review: '',
    berlingske_rating: 0,
    status: 'pending',
    artist: 'Anti Social Media',
    description: '',
    country: '',
    flag: '',
    image: 'https://s3-eu-west-1.amazonaws.com/bem-wordpress-content/songcontests/mgp2015/anti_social_media.jpeg',
  },{
    id: 6,
    title: 'Tæt På Mine Drømme',
    order: 6,
    berlingske_review: '',
    berlingske_rating: 0,
    status: 'pending',
    artist: 'Julie Bjerre',
    description: '',
    country: '',
    flag: '',
    image: 'https://s3-eu-west-1.amazonaws.com/bem-wordpress-content/songcontests/mgp2015/julie_bjerre.jpeg',
  },{
    id: 7,
    title: 'Love Is Love',
    order: 7,
    berlingske_review: '',
    berlingske_rating: 0,
    status: 'pending',
    artist: 'Andy Roda',
    description: '',
    country: '',
    flag: '',
    image: 'https://s3-eu-west-1.amazonaws.com/bem-wordpress-content/songcontests/mgp2015/andy_roda.jpeg',
  },{
    id: 8,
    title: 'Love Me Love Me',
    order: 8,
    berlingske_review: '',
    berlingske_rating: 0,
    status: 'pending',
    artist: 'Sara Sukurani',
    description: '',
    country: '',
    flag: '',
    image: 'https://s3-eu-west-1.amazonaws.com/bem-wordpress-content/songcontests/mgp2015/sara_sukurani.jpeg',
  },{
    id: 9,
    title: '(Ukendt titel)',
    order: 9,
    berlingske_review: '',
    berlingske_rating: 0,
    status: 'pending',
    artist: 'Marcel & Soulman Group',
    description: '',
    country: '',
    flag: '',
    image: 'https://s3-eu-west-1.amazonaws.com/bem-wordpress-content/songcontests/mgp2015/marcel_%26_soulman_group.jpeg',
  },{
    id: 10,
    title: 'Summer Without You',
    order: 10,
    berlingske_review: '',
    berlingske_rating: 0,
    status: 'pending',
    artist: 'World of Girls',
    description: '',
    country: '',
    flag: '',
    image: 'https://s3-eu-west-1.amazonaws.com/bem-wordpress-content/songcontests/mgp2015/world_of_girls.jpeg',
  }
];

var mgp2015 = {
  id: 'mgp2015',
  name: 'Melodi Grand Prix 2015',
  description: '',
  status: 'active',
  date: '2015-02-07',
  songs: songs
};

