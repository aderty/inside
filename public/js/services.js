'use strict';

/* Services */

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('inside.services', ['ngResource']).
  value('version', '0.1').
  factory('LoginService', function ($resource, $http) {
      return {
          login: function (email, pwd, options, callback) {
              $http({
                  method: 'POST',
                  url: '/login',
                  data: {
                      email: email,
                      pwd: pwd,
                      options: options
                  }
              }).
              success(function (data, status, headers, config) {
                  // this callback will be called asynchronously
                  // when the response is available
                  if (data && data != "false") {
                      return callback(data);
                  }
                  callback(false);
              }).
              error(function (data, status, headers, config) {
                  // called asynchronously if an error occurs
                  // or server returns response with an error status.
                  callback(false);
              });
          },
          logout: function (callback) {
              $http({
                  method: 'POST',
                  url: '/logout'
              }).
              success(function (data, status, headers, config) {
                  // this callback will be called asynchronously
                  // when the response is available
                  callback(data);
              }).
              error(function (data, status, headers, config) {
                  // called asynchronously if an error occurs
                  // or server returns response with an error status.
                  callback(data);
              });
          }
      };
  }).
  factory('UsersService', function ($resource) {
      var UsersService = $resource('/data-users/:id',
             { id: '@id' }, {
             charge: {method:'POST', params:{charge:true}}
         });
      return UsersService;/*{
          on: function (eventName, callback) {
              socket.on(eventName, function () {
                  var args = arguments;
                  $rootScope.$apply(function () {
                      callback.apply(socket, args);
                  });
              });
          },
          emit: function (eventName, data, callback) {
              socket.emit(eventName, data, function () {
                  var args = arguments;
                  $rootScope.$apply(function () {
                      if (callback) {
                          callback.apply(socket, args);
                      }
                  });
              })
          }
      };*/
  }).
  factory('CongesService', function ($resource) {
      var CongesService = $resource('/data-conges/:id',
             { id: '@id' }, {
                 create: { method: 'POST', params: { creation: true } }
             });
      return CongesService;
  });
