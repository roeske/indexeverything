(function () {
    "use strict";

    var elegir = angular.module('searchApp').elegir;
    elegir.apiPfix = '/api/v01';

    angular.module('searchApp').controller('SearchCtrl', ['$scope', '$http', '$location', '$route', '$sce', 'DataService',
        function ($scope, $http, $location, $route, $sce, DataService) {

            if (elegir.admin === undefined) {

                $http.get(elegir.apiPfix + '/auth').
                    success(function (data, status, headers, config) {
                        elegir.admin = true; // obviously server side have own check
                    }).
                    error(function (data, status, headers, config) {
                        $location.path('/login');
                        return;
                    });

            }

            $scope.trustAsHtml = $sce.trustAsHtml;
            $scope.form = {};
            $scope.form.query = 'google';

            $scope.dateFormat = function dateFormat(d) {
                return DataService.dateFormat(new Date(d));
            };

            $scope.pageID = function pageID(page) { // fix for _
                return page._id;
            };

            $scope.searchMongo = function searchMongo() {
                $scope.pages = [];
                if (!$scope.form.query) {
                    $scope.pages.push({title: 'Fill search', url: 'Fill search', text: 'Search field required'});
                    return;
                };

                $scope.pages = [];
                $scope.pages.push({title: 'Loading data', url: 'Loading dara', text: 'Searching stored pages for "' + $scope.form.query +'"'});

                $http({
                    method: 'POST',
                    url: elegir.apiPfix + '/search',
                    data: $.param({
                        query: $scope.form.query
                    }),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).
                    success(function (data, status, headers, config) {
                        if(data.length === 0) {
                            $scope.pages = [];
                            $scope.pages.push({title: 'Not found', url: 'Not found', text: 'No data for search: ' + $scope.form.query});
                            return;
                        }
                        $scope.pages = data.sort(function compare(a, b) {
                            if (a.saved < b.saved)
                                return 1;
                            if (a.saved > b.saved)
                                return -1;
                            return 0;
                        });
                    }).
                    error(function (data, status, headers, config) {
                        $scope.pages.push({title: 'Error getting data', text: 'Check settings abd refresh page later'})
                    });
            }
        }]);

    angular.module('searchApp').controller('DocCtrl', ['$scope', '$http', '$location', '$routeParams', '$sce',
        function ($scope, $http, $location, $routeParams, $sce) {

            $scope.doc = {};
            var id = ($routeParams.id || "");
            if (id === "") {
                throw new Error('Post ID not specified');
            }
            else {
                $http.get(elegir.apiPfix + '/page/' + $routeParams.id).
                    success(function (data, status, headers, config) {
                        $scope.html = data.text;
                        $scope.trustedHtml = $sce.trustAsHtml($scope.html);
                        $scope.page = data;
                    }).
                    error(function (data, status, headers, config) {
                        console.log('Problem finding post ' + status);
                    });
            }
        }]);

    angular.module('searchApp').controller('LoginCtrl', ['$scope', '$http', '$location', '$routeParams',
        function ($scope, $http, $location, $routeParams) {

            if ($routeParams.login === '0') {
                $http.get(elegir.apiPfix + '/unauth').
                    success(function (data, status, headers, config) {
                        elegir.admin = false;
                        $location.path('/');
                    }).
                    error(function (data, status, headers, config) {
                        console.log('Problem logging out: ' + status);
                        $location.path('/err');
                    });
            }

            $scope.form = {};
            $scope.form.password = 'elegir';

            $scope.logIn = function () {
                if (!$scope.form.password)
                    return;
                $http.get(elegir.apiPfix + '/auth/' + $scope.form.password).
                    success(function (data, status, headers, config) {
                        elegir.admin = true;
                        $location.path('/');
                    }).
                    error(function (data, status, headers, config) {
                        console.log('Problem logging in: ' + status);
                        $location.path('/err');
                    });

            }
        }]);

})();