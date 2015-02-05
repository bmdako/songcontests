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



  socket.forward('nowplaying', $scope);

  $scope.$on('socket:nowplaying', function (ev, data) {
    $scope.event.songs.forEach(function (el, idx, arr) {
        if(el.id === data.song) {
          el.nowplaying = 1;
        } else {
          el.nowplaying = 0;
        }
    });
  });

  var Events = $resource('/events/:ident', { ident: '@ident' });

  $scope.getEvent = function () {
    $scope.event = Events.get({ ident: $routeParams.ident });
  };

  $scope.getEvent();

  $scope.setNowPlaying = function (song_id) {
    $http.post('/' + $routeParams.ident, {song: song_id, event: $routeParams.ident});
  };
});
