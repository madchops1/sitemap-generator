'use strict';

/**
 * @ngdoc function
 * @name sitemapGeneratorApp.controller:AboutCtrls
 * @description
 * # ScraperCtrl
 * Controller of the sitemapGeneratorApp
 */
angular.module('sitemapGeneratorApp')
  .controller('ScraperCtrl', ['$scope', '$rootScope', '$q', '$http', function ($scope, $rootScope, $q, $http) {

    console.log('scraper...');

    $scope.targetUrl = '';
    $scope.targetSelector = '';
    $scope.time = '';
    $scope.email = '';
    $scope.name = '';
    $scope.preview = '';
    $scope.scraping = false;
    $scope.saving = false;
    $scope.cncl = false;
    $scope.complete = false;
    $scope.error = false;
    $scope.automate = false;
    $scope.statusIcon = 'glyphicon-ok';
    $scope.success = false;

    var t = setTimeout(function () {
      var diff = $rootScope.now - $rootScope.lastScrape;
      if (diff < 86400 && !$rootScope.profile.user_metadata.subscription) {
        $scope.error = true;
        $scope.msg = 'You already used the scraper within the past 24 hours. Sign up to get unlimited access.';
      }
    }, 1);


    $scope.go = function () {

      //
      if ($scope.targetUrl == '') { return false; }

      // format the input url
      // if trailing slash remove it
      if ($scope.targetUrl.substr(-1) === '/') {
        $scope.targetUrl = $scope.targetUrl.substr(0, $scope.targetUrl.length - 1);
      }

      console.log('go', $scope.targetUrl);

      // if no http
      if ($scope.targetUrl.substr(0, 7) !== 'http://' && $scope.targetUrl.substr(0, 8) !== 'https://') {
        $scope.targetUrl = 'http://' + $scope.targetUrl;
      }

      $scope.cncl = false;
      $scope.error = false;
      $scope.msg = '';
      $scope.preview = '';

      if ($scope.automate) {
        $scope.saving = true;
        var hrs = (new Date().getTimezoneOffset() / 60); // to get offset in hours typically used – Edwin Daniels May 1 '15 at 18:20 
        console.log('PROF', $rootScope.profile);
        $http({
          method: 'POST',
          url: $rootScope.environment.gateway + 'addJob/v1',
          data: {
            url: $scope.targetUrl,
            selector: $scope.targetSelector,
            time: $scope.time,
            email: $scope.email,
            name: $scope.name,
            auth0id: $rootScope.profile.user_id,
            offset: hrs
          },
        }).then(function (data) {
          //console.log("success", data);
          $scope.saving = false;
          $scope.success = true;
          $scope.msg = 'Job created.';
          $scope.targetSelector = '';
          $scope.targetUrl = '';
          $scope.time = '';
          $scope.email = '';
          $scope.name = '';
          //$scope.dataResult = data.data.data;
          //console.log($rootScope.profile, data);
          $rootScope.profile = data.data.message;
        }, function (err) {
          console.log("error", err);
        });
      } else {
        var s;
        $scope.scraping = true;

        s = setTimeout(function () {
          $scope.preview = '<iframe id="preview-frame" style="height:100%; width: 100%; border:0px;" src="' + $scope.targetUrl + '" />';
          $scope.$apply({});
        }, 1);

        $http({
          method: 'POST',
          url: $rootScope.environment.gateway + 'scrape/v1',
          data: {
            url: $scope.targetUrl,
            selector: $scope.targetSelector
          },
        }).then(function (data) {
          console.log("success", data.data.message);
          $scope.complete = true;
          $scope.dataResult = data.data.message;
          const dateTime = Date.now();
          const lastScrape = Math.floor(dateTime / 1000);
          localStorage.setItem('lastScrape', lastScrape);
        }, function (err) {
          console.log("error", err);
        });
      }
    };

    $scope.delete = function (name) {
      console.log('delete');
      $http({
        method: 'POST',
        url: $rootScope.environment.gateway + 'deleteJob/v1',
        data: {
          name: name,
          auth0id: $rootScope.profile.user_id
        },
      }).then(function (data) {
        $scope.success = true;
        $scope.msg = 'Job deleted.';
        //$scope.dataResult = data.data.data;
        //console.log($rootScope.profile, data);
        $rootScope.profile = data.data.message;
      }, function (err) {
        console.log("error", err);
      });
    }

    $scope.cancel = function () {
      $scope.cncl = true;
      $scope.scraping = false;
      $scope.complete = false;
    };

    $scope.goDisabled = function () {
      var status = false;
      if (!$scope.automate) {
        if ($scope.targetUrl == '' || $scope.targetSelector == '' || $scope.error == true) {
          status = true;
        }
      } else {
        console.log('TIME', $scope.targetUrl, $scope.targetSelector, $scope.time, $scope.email, $scope.error);
        if ($scope.targetUrl == '' || $scope.targetSelector == '' || $scope.time == '' || $scope.email == '' || $scope.error == true) {
          status = true;
        }
      }
      console.log('STATUS', status);
      return status;
    };

    var timepicker = new TimePicker(['time'], {
      theme: 'dark', // 'blue-grey'
      lang: 'en'
    });

    timepicker.on('change', function (evt) {
      var value = (evt.hour || '00') + ':' + (evt.minute || '00');
      if (evt.element.id == 'link') {
        time2.value = value;
      } else {
        evt.element.value = value;
      }
      $scope.time = value;
      $scope.$apply();
    });


  }]);
