var app = angular.module('rainApp', ["chart.js", 'ngMaterial']);

app.controller('mainCtrl', function($scope) {

    $scope.xData = [];
    $scope.yData = [];
    $scope.dataObject = [];
    $scope.photoDate = "1965-08-12";
    $scope.thirtyDaysRain = 0;
    $scope.prevYearRain = 0;
    $scope.chartY = [];
    $scope.chartX = [];
    $scope.aveLine = [{
            label: "Annual Rainfaill",
            borderWidth: 1,
            type: 'bar'
        },
        {
            label: "Average Rainfall",
            borderWidth: 3,
            hoverBackgroundColor: "rgba(255,99,132,0.4)",
            hoverBorderColor: "rgba(255,99,132,1)",
            type: 'line'
        }
    ];

    //Handles the import/upload and conversion of the CSV
    $scope.csv = document.getElementById("file-input");
    $scope.buildTable = function(a) {
        $scope.dataTable = a;
        $scope.$apply();
        //run the xData and yData to Array function
        $scope.xDataToArray($scope.dataTable);
        $scope.yDataToArray($scope.dataTable);
        $scope.dataZipper($scope.xData, $scope.yData);
    };
    $scope.dataToJson = function(data, callback) {
        Papa.parse(data, {
            header: true,
            complete: function(results) {
                callback(results.data);
            }
        });
    };
    $scope.csv.addEventListener("change", function() {
        data = this.files[0];
        $scope.dataToJson(data, $scope.buildTable);
    });

    //Turns the Precipitation values into an array (for the y-axis)
    $scope.yDataToArray = function(obj) {
        obj.forEach(function(item) {
            $scope.yData.push(item.Precip);
        });
    };

    //Turns the Dates into an array (for the x-axis)
    $scope.xDataToArray = function(obj) {
        obj.forEach(function(item) {
            var time = moment(item.Date, 'DD/MM/YYYY').toObject();
            $scope.xData.push(time);
        });
    };

    //Zips the two data arrays into a simplified array of objects
    $scope.dataZipper = function(x, y) {
        var temp;
        if (x.length == y.length) {
            for (i = 0; i < x.length; i++) {
                temp = {
                    "x": x[i],
                    "y": y[i]
                };
                $scope.dataObject.push(temp);
            }
        } else {
            console.log('mismatched x and y');
        }
    };

    //will take the index and the object and sum up the precip for 30 days prior - need to make sure it gets 30 and not 29/31
    function sumThirty(obj, index) {
        var index1 = index - 30;
        var temp = 0;
        for (i = 0; i < 29; i++) {
            temp += Math.floor(obj[index1].y);
            index1++;
        }
        $scope.thirtyDaysRain = temp;
    }

    //will take the index and the object and sum up the precip from Jan 1 of that year make sure it gets 30 and not 29/31
    function sumYear(obj, startI, endI) {
        var days = endI - startI;
        var temp = 0;
        var index1 = startI;
        for (i = 0; i < days; i++) {
            temp += Math.floor(obj[index1].y);
            index1++;
        }
        $scope.prevYearRain = temp;
    }

    $scope.previousRains = function() {
        $scope.photoDatePar = moment($scope.photoDate, 'YYYY-MM-DD').toObject();
        var index = $scope.dataObject.findIndex(obj => obj.x.years === $scope.photoDatePar.years && obj.x.months === $scope.photoDatePar.months && obj.x.date === $scope.photoDatePar.date);
        var yearStartStr = parseInt($scope.photoDate.substr(0, 4));
        var yearStart = {
            "date": 1,
            "hours": 0,
            "milliseconds": 0,
            "minutes": 0,
            "months": 0,
            "seconds": 0,
            "years": yearStartStr
        };


        var indexYearStart = $scope.dataObject.findIndex(obj => obj.x.years === yearStart.years && obj.x.months === yearStart.months && obj.x.date === yearStart.date);
        sumThirty($scope.dataObject, index);
        sumYear($scope.dataObject, indexYearStart, index);
    };

    // Create an object/array with each year summarised by total precipiation
    $scope.summariseYear = function() {
        $scope.precipYears = d3.nest()
            .key(function(d) {
                return d.x.years;
            })
            .rollup(function(v) {
                return d3.sum(v, function(d) {
                    return parseFloat(d.y);
                });
            })
            .entries($scope.dataObject);
        //runs function to update table once precip data is completed
        $scope.updateTable();
    };

    //Find the average annual rainfall
    $scope.findAveRain = function() {
        $scope.aveAnnualRain = d3.nest()
            .key(function(d) {
                return d;
            })
            .rollup(function(v) {
                return d3.mean(v, function(d) {
                    return d.value;
                });
            })
            .entries($scope.precipYears);

            $scope.aveAnnualRain = $scope.aveAnnualRain[0].value;

    };

    //Turns the Annual Precipitation values into an array (for the y-axis)
    $scope.precipChartParse = function() {
        $scope.summariseYear();
        $scope.findAveRain();
        $scope.addAverage();
    };
    //Scoped outside the function and will be a callback for asynchrous update
    $scope.updateTable = function() {
        $scope.precipYears.forEach(function(item) {
            $scope.chartY.push(item.value);
            $scope.chartX.push(item.key);
        });
    };

    //adds the average to the precipYears Data
    $scope.addAverage = function() {
      $scope.tempAveArray = [];
        //create an array of the same length as chartY with a repeated average
      for (i=0; i < $scope.chartY.length; i++){
          $scope.tempAveArray.push($scope.aveAnnualRain);
      }
      $scope.chartData = [$scope.chartY, $scope.tempAveArray];
      console.log($scope.chartData);
    };


});
