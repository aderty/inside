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
  factory('UsersService', function ($resource, $q) {
      var resource = $resource('/data-users/:id',
             { id: '@id' }, {
                 charge: { method: 'POST', params: { charge: true } },
                 searcher: { method: 'GET', params: { search: true }, isArray: true }
             });
      resource.search = function (recherche) {
          var defered = $q.defer();
          var users = resource.searcher(recherche, function () {
              defered.resolve(users);
          });
          return defered.promise;
      };
      return resource;/*{
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
  }).
  factory('CongesAdminService', function ($resource, $q) {
      var resource = $resource('/data-admin-conges/:id',
             { id: '@id' }, {
                 'queryValidation': { method: 'GET', isArray: true, params: { etat: 1 } },
                 'queryValider': { method: 'GET', isArray: true, params: { etat: 2 } },
                 create: { method: 'POST', params: { create: true } },
                 updateEtat: { method: 'POST', params: { etat: true } }
             });
      function list(query) {
          var defered = $q.defer();
          var conges = resource[query](function () {
              // GET: /user/123/card
              // server returns: [ {id:456, number:'1234', name:'Smith'} ];
              for (var i = 0, l = conges.length; i < l; i++) {
                  conges[i].creation = new Date(conges[i].creation);
                  conges[i].debut = new Date(conges[i].debut);
                  conges[i].fin = new Date(conges[i].fin);
                  conges[i].debutType = conges[i].debut.getHours() > 14 ? 1 : 0;
                  conges[i].finType = conges[i].fin.getHours() > 14 ? 0 : 1;
                  if (conges[i].motif != 'CP' && conges[i].motif != 'RTT' && conges[i].motif != 'CP_ANT') {
                      conges[i].motifExcep = conges[i].motif;
                      conges[i].motif = 'AE';
                  }
              }
              defered.resolve(conges);
          });
          return defered.promise;
      }
      return {
          listValidation: function () {
              return list('queryValidation');
          },
          listValider: function () {
              return list('queryValider');
          },
          save: function (conges, creation) {
              var defered = $q.defer();
              if (creation) {
                  // Création -> Flag création
                  conges.create = true;
              }
              if (conges.motifExcep) {
                  conges.motif = conges.motifExcep;
              }
              conges.debut.setHours(22);
              if (conges.debutType == 1) {
                  conges.debut.setHours(12);
              }
              delete conges.debutType;
              conges.fin.setHours(22);
              if (conges.finType == 0) {
                  conges.fin.setHours(12);
              }
              if (conges.user && conges.user.id) {
                  conges.user = conges.user.id;
              }
              resource.save(conges, function (reponse) {
                  if (reponse.error) {
                      defered.reject(reponse.error);
                      return;
                  }
                  defered.resolve(reponse);
              }, function (response) {
                  defered.reject(response);
              });
              return defered.promise;
          },
          remove: function (conges) {
              var defered = $q.defer();
              resource.remove(conges, function (reponse) {
                  if (reponse.error) {
                      defered.reject(reponse.error);
                      return;
                  }
                  defered.resolve(reponse);
              }, function (response) {
                  defered.reject(response);
              });
              return defered.promise;
          },
          updateEtat: function (conges) {
              var defered = $q.defer();
              resource.updateEtat(conges, function (reponse) {
                  if (reponse.error) {
                      defered.reject(reponse.error);
                      return;
                  }
                  defered.resolve(reponse);
              }, function (response) {
                  defered.reject(response);
              });
              return defered.promise;
          }
      };
  });
