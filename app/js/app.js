"use strict";
angular.module('app', ['ngResource', 'ngRoute', 'ui.bootstrap']);

angular.module('app').config(function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'partials/patient.html',
        controller: 'AppController'
    }).when('/history', {
        templateUrl: 'partials/history.html',
        controller: 'AppController'
    }).when('/doctor/1234', {
        templateUrl: 'partials/doctor.html',
        controller: 'AppController'
    }).otherwise({redirectTo: '/'});
}).controller('AppController', function ($scope) {});