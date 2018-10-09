'use strict';

/**
 * @ngdoc function
 * @name sitemapGeneratorApp.controller:SettingsCtrl
 * @description
 * # SettingsCtrl
 * Controller of the sitemapGeneratorApp
 */
angular.module('sitemapGeneratorApp')
    .controller('SettingsCtrl', ['$scope', function ($scope) {
        this.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];


        $scope.save = function () {
            console.log('saved');
        }
    }]);
