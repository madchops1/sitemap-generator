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
    'ngTouch',
  ])
  .config(function ($routeProvider, $sceDelegateProvider, $sceProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl',
        controllerAs: 'home'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .when('/scraper', {
        templateUrl: 'views/scraper.html',
        controller: 'ScraperCtrl',
        controllerAs: 'scraper'
      })
      .when('/sitemap-generator', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
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
  }).run(['$rootScope', '$http', '$location', function ($rootScope, $http, $location) {

    const dateTime = Date.now();
    const now = Math.floor(dateTime / 1000);
    const environment = {
      dev: {
        //gateway: 'http://localhost:3000/',
        gateway: 'https://5cx2bo5e2j.execute-api.us-east-1.amazonaws.com/dev/',
        ////gateway: 'https://3bb5anl5va.execute-api.us-east-1.amazonaws.com/dev/',
        stripeKey: 'pk_test_JxsCHvXtYWoMblng27w9oah5'
      },
      prod: {
        gateway: 'https://5cx2bo5e2j.execute-api.us-east-1.amazonaws.com/dev/',
        stripeKey: 'pk_live_ZPeiS3btumpDQ4L0NgtsynHI'
        //stripeKey: 'pk_test_JxsCHvXtYWoMblng27w9oah5'
      }
    };

    $rootScope.environment = environment.dev
    var host = $location.host() + '';
    console.log(host);

    if (host.indexOf('localhost') == -1) {
      console.log('PROD ENVIRONMENT');
      $rootScope.environment = environment.prod;
    } else {
      console.log('DEV ENVIRONMENT');
    }

    $rootScope.profile = false;
    $rootScope.now = now;
    $rootScope.lastScrape = localStorage.getItem('lastScrape');
    //console.log($rootScope.now, $rootScope.lastScrape);

    var lock = new Auth0Lock(
      'I9YjZUqgVz9Ka0vkut6oSLI5lUXwrGfP',
      //'ft6pcppmWwgQf30-ryYoCHwY9xLMdVmO',
      'botmapio.auth0.com'
    );

    $rootScope.login = function () {
      lock.show();
    };

    $rootScope.logout = function () {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('profile');
      lock.logout();
    };

    function getUserMetadata(id) {

      console.log('BETA', id);

      $http({
        method: 'GET',
        url: $rootScope.environment.gateway + 'metadata/v1',
        params: {
          auth0id: id
        }
      })
        .then(function (data) {

          $rootScope.profile = data.data.message;
          //localStorage.setItem('profile', JSON.stringify($rootScope.profile));
          //$rootScope.$apply();          
          //console.log('ALPHA', $rootScope.profile, data.data.message);

        }, function (err) {
          console.log(err);
        });
    }

    lock.on("authenticated", function (authResult) {
      // Use the token in authResult to getUserInfo() and save it to localStorage
      lock.getUserInfo(authResult.accessToken, function (error, profile) {
        if (error) {
          // Handle error
          return;
        }

        //document.getElementById('nick').textContent = profile.nickname;
        console.log('profile', profile);
        $rootScope.profile = profile;
        localStorage.setItem('accessToken', authResult.accessToken);
        localStorage.setItem('profile', JSON.stringify(profile));
        getUserMetadata($rootScope.profile.sub);
        $rootScope.$apply();
      });
    });


    if (localStorage.getItem('profile') == 'undefined') {
      localStorage.removeItem('profile');
      localStorage.removeItem('accessToken');
    }


    if (localStorage.getItem('accessToken') && localStorage.getItem('profile')) {
      //console.log(localStorage.getItem('profile'))
      $rootScope.profile = JSON.parse(localStorage.getItem('profile'));
      var id;
      if ($rootScope.profile.user_id) {
        id = $rootScope.profile.user_id;
      } else if ($rootScope.profile.sub) {
        id = $rootScope.profile.sub;
      }
      getUserMetadata(id);
      $rootScope.$apply();
    }


    var handler = StripeCheckout.configure({
      key: $rootScope.environment.stripeKey,
      image: 'http://botmap.io/images/karl.e8e48f1e.png',
      locale: 'auto',
      token: function (token) {
        $http({
          method: 'POST',
          url: $rootScope.environment.gateway + 'charge/v1',
          data: {
            token: token.id,
            email: token.email,
            auth0id: $rootScope.profile.user_id
          }
          //params: 'limit=10, sort_by=created:desc',
          //headers: { 'Authorization': 'Token token=xxxxYYYYZzzz' }
        })
          .then(function (data) {
            console.log('success', data);
            $rootScope.profile = data.data.message;
            //localStorage.setItem('profile', JSON.stringify($rootScope.profile));
          }, function () {
            console.log("error");
          });

      }
    });

    document.getElementById('upgrade').addEventListener('click', function (e) {
      // Open Checkout with further options:
      handler.open({
        name: 'Botmap.io',
        description: 'Botmap.io Montly Subscription',
        amount: 500
      });
      e.preventDefault();
    });

    // Close Checkout on page navigation:
    window.addEventListener('popstate', function () {
      handler.close();
    });

  }]);
