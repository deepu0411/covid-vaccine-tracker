angular.module('app', []).controller('appCtrl', function($scope, $http) {
  $scope.pincode = '250001';
  $scope.age18 = true;
  $scope.secondDose = false;
  $scope.vaccineType = 0;

  $scope.print = function() {
    console.log($scope.vaccineType);
  }

  $scope.fetchVaccinationCenter = function() {
    if ($scope.pincode.length < 6)
      return;
    var d = new Date();
    d.setDate(d.getDate() + 1);
    $scope.date = d.toLocaleDateString().replaceAll('/', '-');
    $scope.avaiableDates = [];
    $scope.maxSessions = 0;
    //  https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByPin?pincode=250001&date=06-05-2021&vaccine=COVISHIELD
    $scope.alphaUrl = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByPin?pincode=" + $scope.pincode + "&date=" + $scope.date;
    if ($scope.secondDose && $scope.vaccineType)
      $scope.alphaUrl += '&vaccine=' + ($scope.vaccineType == 1 ? 'COVISHIELD' : 'COVAXIN');
    $scope.minAge = $scope.age18 ? 18 : 45;
    $scope.availableCenters = [];
    $http({
      method: 'GET',
      url: $scope.alphaUrl
    }).then(function(response) {
      response.data.centers.forEach(function(data, index) {
        console.log(data.sessions[0].min_age_limit);

        let avlblSlots = 0;
        data.sessions.forEach(function(session, index) {
          avlblSlots += session.available_capacity;
          data[session.date] = session;
        });

        if (avlblSlots > 0 && data.sessions[0] && data.sessions[0].min_age_limit == $scope.minAge)
          $scope.availableCenters.push(data);

        if ($scope.maxSessions < data.sessions.length) {
          $scope.maxSessions = data.sessions.length;
          $scope.availableDates = data.sessions;
        }

      });

      $scope.availableDates = $scope.availableDates.map(session => session.date);
      $scope.availableDatesFormatted = $scope.availableDates.map(session => session.substr(0, 5));
      console.log($scope.availableDates);
      console.log($scope.availableCenters);

    }, function(response) {
      console.log("Covid API not working!" + response);
    });
  };

  $scope.fetchVaccinationCenter();
});

/**************************************/
//  Extra Finance APIs
//  https://www.quandl.com/tools/api
