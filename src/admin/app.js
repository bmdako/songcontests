var songcontestsAdminApp = angular.module('songcontestsAdminApp', ['ngRoute', 'ngResource']);

songcontestsAdminApp.controller('EventsController', function ($scope, $resource, $http) {
  var Events = $resource('/events/:ident', { ident: '@ident' });

  $scope.queryEvents = function () {
    $scope.events = Events.query();
  };

  $scope.queryEvents();
});
