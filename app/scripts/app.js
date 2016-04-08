'use strict';

/**
 * @ngdoc overview
 * @name sitemapGeneratorApp
 * @description
 * # sitemapGeneratorApp
 *
 * Main module of the application.
 */
angular
  .module('sitemapGeneratorApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider, $sceDelegateProvider, $sceProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .otherwise({
        redirectTo: '/'
      });

    $sceProvider.enabled(false);
    $locationProvider.html5Mode(true);

    // Whitelist remote things
    /*$sceDelegateProvider.resourceUrlWhitelist([
      // Allow same origin resource loads.
      'self',
      // Allow loading from our assets domain.  Notice the difference between * and **.
      'http://srv*.assets.example.com/**',
      'https://www.youtube.com/embed/**',
      'https://www.google.com/**',
      // Dev Backend / API
      'http://sfoutsidelandscom-dev1.elasticbeanstalk.com/**',
      'http://*.elasticbeanstalk.com/**',
      'http://api.sfoutsidelands.com/**',
      'http://devapi.sfoutsidelands.com/**',
      'http://cdn2.sfoutsidelands.com/**',
      'http://static.sfoutsidelands.com/**',
      'http://s3.amazonaws.com/static.sfoutsidelands.com/**'
    ]);*/
  });
