var app = angular.module('inside', ['inside.directives', 'inside.services', 'ngGrid', 'ui.bootstrap', 'ui'])
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
          templateUrl: 'partials/users.html',
          controller: appController
      })
      .otherwise({
          redirectTo: '/index'
      });

        // configure html5 to get links working on jsfiddle
      $locationProvider.html5Mode(true);
  } ]);
