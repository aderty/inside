(function() {
    function resolve(dependencies) {
        return ['$q', '$rootScope', function($q, $rootScope) {
            var deferred = $q.defer();
            $script(dependencies, function() {
                // all dependencies have now been loaded by $script.js so resolve the promise
                $rootScope.$apply(function() {
                    deferred.resolve();
                });
            });
            return deferred.promise;
        }];
    }
    
    var prefix = window.prefix || '';
    var appScripts = {
        accueil: 'js/'+ prefix +'accueil.js',
        users: 'js/'+ prefix +'users.js',
        conges: 'js/'+ prefix +'conges.js',
        'admin-conges': 'js/'+ prefix +'admin-conges.js',
        activite: 'js/'+ prefix +'activite.js',
        'admin-activite': 'js/'+ prefix +'admin-activite.js',
    };

    window.app = angular.module('inside', [/*'ngRoute', */'inside.directives', 'inside.filters', 'inside.services', 'ui.bootstrap', 'ui', 'ui.calendar', 'ngTable'])
        .config(['$routeProvider', '$locationProvider', '$controllerProvider', '$compileProvider', '$provide', function($routeProvider, $locationProvider, $controllerProvider, $compileProvider, $provide) {
            window.app.controllerProvider = $controllerProvider;
            //window.app.compileProvider = $compileProvider;
            //window.app.routeProvider = $routeProvider;
            //window.app.filterProvider = $filterProvider;
            window.app.provide = $provide;
            $routeProvider
            .when('/index', {
                templateUrl: 'partials/index.html',
                controller: 'appController',
                resolve: { deps: resolve([appScripts.accueil]) }
            })
          .when('/products/:productSku', {
              templateUrl: 'partials/product.html',
              controller: 'appController'
          })
          .when('/users', {
              templateUrl: 'admin-partials/users.html',
              controller: 'appController',
              resolve: { deps: resolve([appScripts.users]) }
          })
          .when('/conges', {
              templateUrl: 'partials/conges.html',
              controller: 'appController',
              resolve: { deps: resolve([appScripts.conges]) }
          })
          .when('/admin-conges', {
              templateUrl: 'admin-partials/admin-conges.html',
              controller: 'appController',
              resolve: { deps: resolve([appScripts['admin-conges']]) }
          })
          .when('/activite', {
              templateUrl: 'partials/activite.html',
              controller: 'appController',
              resolve: { deps: resolve([appScripts.activite]) }
          })
          .when('/admin-activite', {
              templateUrl: 'admin-partials/admin-activite.html',
              controller: 'appController',
              resolve: { deps: resolve([appScripts['admin-activite']]) }
          })
          .when('/logout', {
              redirectTo: '/logout'
          })
          .otherwise({
              redirectTo: '/index'
          });

            // configure html5 to get links working on jsfiddle
            $locationProvider.html5Mode(true);
        } ]).run(["$rootScope", "$location", function($rootScope, $location) {
            // Suppression de la classe CSS de démarrage.
            $(document.documentElement).removeClass("start");
            $(".background").empty();
            // register listener to watch route changes
            $rootScope.$on("$routeChangeStart", function(event, next, current) {
                // no logged user, we should be going to #login
                if (next.redirectTo == "/logout") {
                    // not going to #login, we should redirect now
                    location.href = "/logout";
                }
            });
        }]);

window.app.factory("ngTableFilter", ["$filter", function($filter) {
    var isNumber, ngTableParams;
    isNumber = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };
    ngTableFilter = function(data, params) {
        var orderedData = params.sorting() ?
                                            $filter('orderBy')(data, params.orderBy()) :
                                            data;
        orderedData = orderedData || [];
        orderedData = params.filter() ?
                                    $filter('filter')(orderedData, params.filter()) :
                                    orderedData;
        if (params.filterText && params.filterText != "") {
            var result = [], found = false;

            angular.forEach(orderedData, function(datarow) {
                found = false;
                angular.forEach(datarow, function(col) {
                    if (found) return;
                    if (typeof col == "string" && col.toLowerCase().indexOf(params.filterText.toLowerCase()) > -1) {
                        found = true;
                        result.push(datarow);
                        return;
                    }
                    if (typeof col == "number" && col.toString().indexOf(params.filterText.toLowerCase()) > -1) {
                        found = true;
                        result.push(datarow);
                        return;
                    }
                });
            });
        }
        params.total(orderedData.length);
        return orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
    }

    return ngTableFilter;
}]);

/*window.app.factory("ngTableFilter", function($filter) {
var isNumber, ngTableParams;
isNumber = function(n) {
return !isNaN(parseFloat(n)) && isFinite(n);
};
ngTableFilter = function(data, params, out) {
var scope = this;
scope.$watch(data, function(donnees) {
filter.call(scope, donnees, scope[params], out);
}, true);
scope.$watch(params, function(args) {
filter.call(scope, scope[data], args, out);
}, true);
};

function filter(data, params, out) {
// use build-in angular filter
var orderedData = params.sorting ?
$filter('orderBy')(data, params.orderBy()) :
data;
orderedData = orderedData || [];
orderedData = params.filter ?
$filter('filter')(orderedData, params.filter) :
orderedData;
if (params.filterText && params.filterText != "") {
var result = [], found = false;

angular.forEach(orderedData, function(datarow) {
found = false;
angular.forEach(datarow, function(col) {
if (found) return;
if (typeof col == "string" && col.toLowerCase().indexOf(params.filterText.toLowerCase()) > -1) {
found = true;
result.push(datarow);
return;
}
if (typeof col == "number" && col.toString().indexOf(params.filterText.toLowerCase()) > -1) {
found = true;
result.push(datarow);
return;
}
});
});
orderedData = result;
}

params.total = orderedData.length; // set total for recalc pagination
this[out] = orderedData.slice((params.page - 1) * params.count, params.page * params.count);
}

return ngTableFilter;
});*/
})();