var app = angular.module('rainApp', []);

app.controller('mainCtrl', function($scope){

var csv = document.getElementById("file-input");

function buildTable(a) {
    $scope.dataTable = a;
}

function dataToJson(data, callback) {
    Papa.parse(data,  {
        complete: function(results) {
            console.log(results.data);
            callback(results.data);
        }
    });
}

csv.addEventListener("change", function() {
  data = this.files[0];
      dataToJson(data, buildTable);
});

});
