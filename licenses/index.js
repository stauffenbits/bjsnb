var LicenseApp = angular.module('LicenseApp', []);

var LicenseController = LicenseApp.controller("LicenseController", 
  ["$scope", "$http", function($scope, $http){
  $scope.licenses = [];

  $http.get('licenses.json', {}).then(res => {
    $scope.licenses = res.data;
  });
}]);