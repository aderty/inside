(function() {
    function resolve(dependencies) {
        return function($q, $rootScope) {
            var deferred = $q.defer();
            $script(dependencies, function() {
                // all dependencies have now been loaded by $script.js so resolve the promise
                $rootScope.$apply(function() {
                    deferred.resolve();
                });
            });
            return deferred.promise;
        }
    }

    window.app = angular.module('inside', ['inside.directives', 'inside.filters', 'inside.services', 'ui.bootstrap', 'ui', 'ui.calendar'])
    .config(['$routeProvider', '$locationProvider', '$controllerProvider', '$compileProvider', '$provide', function($routeProvider, $locationProvider, $controllerProvider, $compileProvider, $provide) {
        //window.app.controllerProvider = $controllerProvider;
        //window.app.compileProvider = $compileProvider;
        //window.app.routeProvider = $routeProvider;
        //window.app.filterProvider = $filterProvider;
        window.app.provide = $provide;
        $routeProvider
        .when('/index', {
            templateUrl: 'partials/index.html',
            controller: appController,
            resolve: { deps: resolve(['js/accueil.js']) }
        })
      .when('/products/:productSku', {
          templateUrl: 'partials/product.html',
          controller: appController
      })
      .when('/users', {
          templateUrl: 'admin-partials/users.html',
          controller: appController,
          resolve: { deps: resolve(['js/users.js']) }
      })
      .when('/conges', {
          templateUrl: 'partials/conges.html',
          controller: appController,
          resolve: { deps: resolve(['js/conges.js']) }
      })
      .when('/admin-conges', {
          templateUrl: 'admin-partials/admin-conges.html',
          controller: appController,
          resolve: { deps: resolve(['js/admin-conges.js']) }
      })
      .when('/activite', {
          templateUrl: 'partials/activite.html',
          controller: appController,
          resolve: { deps: resolve(['js/activite.js']) }
      })
      .when('/admin-activite', {
          templateUrl: 'admin-partials/admin-activite.html',
          controller: appController,
          resolve: { deps: resolve(['js/admin-activite.js']) }
      })
      .when('/logout', {
          redirectTo: '/logout'
      })
      .otherwise({
          redirectTo: '/index'
      });

        // configure html5 to get links working on jsfiddle
        $locationProvider.html5Mode(true);
    } ]).run(function($rootScope, $location) {
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
    })

})();