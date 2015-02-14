(function () {
    "use strict";
    angular.module('searchApp').elegir = {};

    angular.module('searchApp').config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "search.html",
                controller: "SearchCtrl"
            })
            .when("/page/:id", {
                templateUrl: "document.html",
                controller: "DocCtrl"
            })
            .when("/login", {
                templateUrl: "login.html",
                controller: "LoginCtrl"
            })
            .when("/login/:login", {
                templateUrl: "login.html",
                controller: "LoginCtrl"
            })
            .otherwise({
                template: "<h1>Not Found</h1>"
            })
        ;
    }]);

    angular.module('searchApp').factory("DataService", function () {

        return {
            dateFormat: function dateFormat(d) {
                var m_names = new Array("January", "February", "March",
                    "April", "May", "June", "July", "August", "September",
                    "October", "November", "December");

                var curr_date = d.getDate();
                var curr_month = d.getMonth();
                var curr_year = d.getFullYear();

                return curr_date + " " + m_names[curr_month] + " " + curr_year;
            }
        };
    });

})();
