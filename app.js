/*jshint node: true */
"use strict";
angular.module('app', ['ngResource', 'ngRoute', 'ui.bootstrap']);

angular.module('app').config(function ($routeProvider) {
    $routeProvider.when('/software', {
        templateUrl: 'partials/software.html',
        controller: 'SoftwareController'
    }).when('/software/:software_id/licenses', {
        templateUrl: 'partials/licenses.html',
        controller: 'LicensesController'
    }).when('/software/:software_id/licenses/:license_id/devices', {
        templateUrl: 'partials/devices.html',
        controller: 'DevicesController'
    }).when('/404', {
        template: '<error></error>'
    }).when('/', {
        redirectTo: '/software'
    }).otherwise({redirectTo: '/404'});
}).factory('SoftwareFactory', function ($resource) {
    return $resource('/api/software/:id', {id: '@_id'}, {update: {method: 'PUT'}});
}).factory('LicensesFactory', function ($resource) {
    return $resource('/api/licenses/:id', {id: '@_id'}, {update: {method: 'PUT'}});
}).factory('DevicesFactory', function ($resource) {
    return $resource('/api/devices/:id', {id: '@_id'}, {update: {method: 'PUT'}});
}).factory('myService', function() {
    var savedData = {};
    function set(data) {
        savedData = data;
    }
    function get() {
        return savedData;
    }

    return {
        set: set,
        get: get
    }

}).controller('SoftwareController', function ($scope, SoftwareFactory) {
    $scope.getSoftware = function () {
        $scope.softwares = SoftwareFactory.query();
    };
    $scope.getSoftware();
    $scope.software = new SoftwareFactory();
    $scope.createSoftware = function () {
        $scope.isSaving = true;
        $scope.software.$save(function () {
            $scope.isSaving = false;
            $scope.inputForm.$setPristine();
            $scope.getSoftware();
        });
    };
}).controller('LicensesController', function ($scope, $routeParams, myService, SoftwareFactory, LicensesFactory) {
    $scope.getLicenses = function () {
        $scope.licenses = LicensesFactory.query();
    };
    $scope.getLicenses();

    $scope.software = SoftwareFactory.get({id: $routeParams.software_id});

    $scope.license = new LicensesFactory();
    $scope.createLicense = function () {
        $scope.isSaving = true;
        $scope.license.$save(function () {
            $scope.inputForm.$setPristine();
            $scope.isSaving = false;
            $scope.getLicenses();
        });
    };

    //----- Date Picker ------//
    $scope.today = function() { $scope.dt = new Date(); };
    $scope.today();
    $scope.clear = function () { $scope.dt = null; };
    $scope.open = function($event) { $scope.status.opened = true; };
    $scope.setDate = function(year, month, day) { $scope.dt = new Date(year, month, day); };
    $scope.status = { opened: false };
    $scope.showButtonBar = false;

}).controller('DevicesController', function ($scope, $routeParams, myService, SoftwareFactory, DevicesFactory, LicensesFactory) {

    $scope.software = SoftwareFactory.get({id: $routeParams.software_id});
    $scope.notGenerated = true;
    $scope.activeActivations = 0;
    $scope.getLicense = function () {
        $scope.license = LicensesFactory.get({id: $routeParams.license_id}, function () {
            $scope.getDevices();
            $scope.getActivations();
        });
    };
    $scope.getLicense();

    $scope.getDevices = function () {
        $scope.devices = $scope.license.issuedLicenses;
    };

    $scope.getActivations = function () {
        $scope.activeActivations = $scope.license.allowedActivations - $scope.license.issuedLicenses.length;
    };


    $scope.device = new DevicesFactory();
    $scope.createDevice = function () {
        $scope.isSaving = true;
        if ($scope.activeActivations > 0) {
            $scope.device.licenseId = $scope.license._id;
            $scope.device.$save(function () {
                $scope.isSaving = false;
                $scope.inputForm.$setPristine();
            });

        } else { console.log('In $scope.createDevice, $scope.activeActivations <= 0'); }
    };
    $scope.generateLicenses = function () {
        $scope.notGenerated = false;
        $scope.licenses = LicensesFactory.get({id: $routeParams.id});
    };

    //------FILE DOWNLOADER--------//
    $scope.getData = function(jsonString) {
        $scope.data = {};
        $scope.data.software = $scope.software.name;
        $scope.data.licenseUniqueID = $scope.license.licenseUniqueID;
        $scope.data.deviceUniqueID = jsonString.deviceUniqueID;
        $scope.data.expirationDate = $scope.license.expirationDate;
    };

    $scope.getBlob = function(){
        return new Blob([ JSON.stringify($scope.data) ], {type: "text/javascript"});
    };
}).directive('downloadFile', function ($compile) {
        return {
            restrict:'E',
            scope:{ getUrlData:'&getData'},
            link:function (scope, elm, attrs) {
                var url = (window.URL || window.webkitURL).createObjectURL(scope.getUrlData());
                elm.append($compile(
                    '<a href="' + url + '>License</a>'
                )(scope));
            }
        };
}).directive('negativeIntegerValidator', function () {
    return {
        link: function (scope, elm, attrs) {
            elm.bind('keypress', function(e){
                var char = String.fromCharCode(e.which||e.charCode||e.keyCode), matches = [];
                if(char > 0) matches.push(char);
                if(matches.length == 0){
                    e.preventDefault();
                    return false;
                }
            });
        }
    }
}).directive('navMenu', function () {
    return {
        restrict: 'E',
        templateUrl: '/partials/menu.html'
    };
}).directive('softwareConfNameAdd', function () {
    return {
        restrict: 'AE',
        templateUrl: 'partials/software-add.html'
    };
}).directive('provisioningLicenseAdd', function () {
    return {
        restrict: 'AE',
        templateUrl: 'partials/licenses-add.html'
    }
}).directive('softwareLicenseAdd', function () {
    return {
        restrict: 'AE',
        templateUrl: 'partials/devices-add.html'
    }
}).directive('error', function () {
    return {
        restrict: 'AE',
        templateUrl: 'partials/error.html'
    };
});