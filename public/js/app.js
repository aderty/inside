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
    
    var prefix = window.prefix != undefined;
    var appScripts = {
        accueil: (prefix ? 'dist/' : '') + 'js/accueil.js?v=' + config.version,
        users: (prefix ? 'dist/' : '') + 'js/users.js?v=' + config.version,
        conges: (prefix ? 'dist/' : '') + 'js/conges.js?v=' + config.version,
        'admin-conges': (prefix ? 'dist/' : '') + 'js/admin-conges.js?v=' + config.version,
        activite: (prefix ? 'dist/' : '') + 'js/activite.js?v=' + config.version,
        'admin-activite': (prefix ? 'dist/' : '') + 'js/admin-activite.js?v=' + config.version
    };

    window.app = angular.module('inside', [/*'ngRoute', 'ngAnimate', */'inside.directives', 'inside.filters', 'inside.services', 'ui.bootstrap', 'ui', 'ui.calendar', 'ngTable', 'chieffancypants.loadingBar'])
        .config(['$routeProvider', '$locationProvider', '$controllerProvider', '$compileProvider', '$provide', function($routeProvider, $locationProvider, $controllerProvider, $compileProvider, $provide) {
            window.app.controllerProvider = $controllerProvider;
            //window.app.compileProvider = $compileProvider;
            //window.app.routeProvider = $routeProvider;
            //window.app.filterProvider = $filterProvider;
            window.app.provide = $provide;
            $routeProvider
            .when('/index', {
                templateUrl: 'partials/index.html?v=' + config.version,
                controller: 'appController',
                resolve: { deps: resolve([appScripts.accueil]) }
            })
            .when('/lost', {
                templateUrl: 'partials/index.html?v=' + config.version,
                controller: 'appController',
                resolve: { deps: resolve([appScripts.accueil]) }
            })
          .when('/products/:productSku', {
              templateUrl: 'partials/product.html?v=' + config.version,
              controller: 'appController'
          })
          .when('/users', {
              templateUrl: 'admin-partials/users.html?v=' + config.version,
              controller: 'appController',
              resolve: { deps: resolve([appScripts.users]) }
          })
          .when('/conges', {
              templateUrl: 'partials/conges.html?v=' + config.version,
              controller: 'appController',
              resolve: { deps: resolve([appScripts.conges]) }
          })
          .when('/admin-conges', {
              templateUrl: 'admin-partials/admin-conges.html?v=' + config.version,
              controller: 'appController',
              resolve: { deps: resolve([appScripts['admin-conges']]) }
          })
          .when('/activite', {
              templateUrl: 'partials/activite.html?v=' + config.version,
              controller: 'appController',
              resolve: { deps: resolve([appScripts.activite]) }
          })
          .when('/admin-activite', {
              templateUrl: 'admin-partials/admin-activite.html?v=' + config.version,
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
        } ])
        .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
            cfpLoadingBarProvider.includeSpinner = false;
        }]).run(["$rootScope", "$location", function($rootScope, $location) {
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
    var isNumber, ngTableParams, ngTableFilter;
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