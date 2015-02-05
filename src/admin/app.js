var songcontestsAdminApp = angular.module('songcontestsAdminApp', ['ngRoute', 'ngResource']);

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

songcontestsAdminApp.controller('EventController', function ($scope, $resource, $http, $routeParams) {
  var Events = $resource('/events/:ident', { ident: '@ident' });

  $scope.getEvent = function () {
    $scope.event = Events.get({ ident: $routeParams.ident });
  };

  $scope.getEvent();

  $scope.setNowPlaying = function (song_id) {
    $http.post('/' + $routeParams.ident, {song: song_id, event: $routeParams.ident});
  };
});