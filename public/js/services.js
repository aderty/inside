'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('inside.services', ['ngResource']).
  value('version', '0.1').
  factory('DataUsers', function ($resource) {
      var DataUsers = $resource('/data-users/:matricule',
             { matricule: '@id' }, {
             charge: {method:'POST', params:{charge:true}}
         });
      return DataUsers;/*{
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
  });
