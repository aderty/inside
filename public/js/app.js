var app = angular.module('inside', ['inside.directives', 'inside.filters', 'inside.services', 'ui.bootstrap', 'ui', 'ui.calendar'])
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
      $routeProvider
        .when('/index', {
            templateUrl: 'partials/index.html',
            controller: appController
        })
      .when('/products/:productSku', {
          templateUrl: 'partials/product.html',
          controller: appController
      })
      .when('/users', {
          templateUrl: 'admin-partials/users.html',
          controller: appController
      })
      .when('/conges', {
           templateUrl: 'partials/conges.html',
           controller: appController
      })
      .when('/admin-conges', {
           templateUrl: 'admin-partials/admin-conges.html',
           controller: appController
      })
      .when('/activite', {
          templateUrl: 'partials/activite.html',
          controller: appController
      })
      .when('/logout', {
          redirectTo: '/logout'
      })
      .otherwise({
          redirectTo: '/index'
      });

        // configure html5 to get links working on jsfiddle
      $locationProvider.html5Mode(true);
    }]).run(function ($rootScope, $location) {
        // Suppression de la classe CSS de démarrage.
        $(document.documentElement).removeClass("start");
        $(".background").empty();
        // register listener to watch route changes
        $rootScope.$on("$routeChangeStart", function (event, next, current) {
                // no logged user, we should be going to #login
            if (next.redirectTo == "/logout") {
                // not going to #login, we should redirect now
                location.href ="/logout";
            }
        });
    })
