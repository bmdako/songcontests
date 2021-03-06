var songcontestsAdminApp = angular.module('songcontestsAdminApp', ['ngRoute', 'ngResource', 'btford.socket-io']).
  factory('socket', function (socketFactory) {
    return socketFactory();
  });

songcontestsAdminApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/events-overview.html',
        controller: 'EventsController'
      }).
      when('/:ident', {
        templateUrl: 'partials/event-details.html',
        controller: 'EventController'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);


songcontestsAdminApp.controller('EventsController', function ($scope, $resource, $http) {
  var Events = $resource('/events/:ident', { ident: '@ident' });

  $scope.queryEvents = function () {
    $scope.events = Events.query();
  };

  $scope.queryEvents();
});

songcontestsAdminApp.controller('EventController', function ($scope, $resource, $http, $routeParams, socket) {

  var theroom = $routeParams.ident;

  socket.emit('join', theroom);

  // Re-joining room if the server was re-started.
  socket.on('connect', function () {
    socket.emit('join', theroom);
  });

  var Events = $resource('/events/:ident', { ident: '@ident' });

  $scope.getEvent = function () {
    $scope.event = Events.get({ ident: $routeParams.ident });
  };

  $scope.getEvent();

  $scope.setNowPlaying = function (song_id) {
    $http.post('/' + $routeParams.ident, {song: song_id, event: $routeParams.ident});
  };

  $scope.setAllActive = function () {
    $http.post('/' + $routeParams.ident, {active_all: true, event: $routeParams.ident});
  };

  $scope.setAllInactive = function () {
    $http.post('/' + $routeParams.ident, {active: false, event: $routeParams.ident});
  };

  // $scope.like = function(song_id) {
  //   console.log('like ' + song_id);
  //   var obj =
  //   socket.emit('like', {
  //     song: song_id,
  //     event: $scope.event.ident,
  //     session: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10)
  //   });
  // };

  // $scope.dislike = function(song_id) {
  //   console.log('dislike ' + song_id);
  //   socket.emit('dislike', {
  //     song: song_id,
  //     event: $scope.event.ident,
  //     session: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10)
  //   });
  // };

  /* SOCKET BINDINGS */

  socket.forward('nowplaying', $scope);

  $scope.$on('socket:nowplaying', function (ev, data) {
    console.log(data);

    $scope.event.active = data.active;
    $scope.event.active_all = data.active_all;

    $scope.event.songs.forEach(function (el, idx, arr) {
      if (data.active_all) {
        el.active     = 1;
        el.nowplaying = 0;
      } else if (data.active === false) {
        el.nowplaying = 0;
        el.active     = 0;
      } else if (el.id === data.song) {
        el.nowplaying = 1;
        el.active     = 1;
      } else {
        el.nowplaying = 0;
      }
    });
  });

  socket.forward('newrating', $scope);

  $scope.$on('socket:newrating', function (ev, data) {
    if(data.event === $scope.event.ident) {
      $scope.event.songs.forEach(function (el, idx, arr) {
        if(el.id === data.song) {
          el.likes = data.likes;
          el.dislikes = data.dislikes;
          el.score = data.score;
          el.total = data.total;
          return true;
        }
      });
    }
  });

  /* Leaving */

  $scope.$on("$destroy", function(){
    socket.emit('leave', theroom);
  });

});
