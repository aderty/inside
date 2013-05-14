'use strict';

/* Services */

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('inside.services', ['ngResource']).
  value('version', '0.1').
  factory('LoginService', function($resource, $http, $q, $rootScope) {
      return {
          login: function(email, pwd, options, callback) {
              $http({
                  method: 'POST',
                  url: '/login',
                  data: {
                      email: email,
                      pwd: pwd,
                      options: options
                  }
              }).
              success(function(data, status, headers, config) {
                  // this callback will be called asynchronously
                  // when the response is available
                  if (data && data != "false") {
                      return callback(data);
                  }
                  callback(false);
              }).
              error(function(data, status, headers, config) {
                  // called asynchronously if an error occurs
                  // or server returns response with an error status.
                  callback(false);
              });
          },
          logout: function(callback) {
              $http({
                  method: 'POST',
                  url: '/logout'
              }).
              success(function(data, status, headers, config) {
                  // this callback will be called asynchronously
                  // when the response is available
                  callback(data);
              }).
              error(function(data, status, headers, config) {
                  // called asynchronously if an error occurs
                  // or server returns response with an error status.
                  callback(data);
              });
          },
          passwordLost: function(password) {
              var defered = $q.defer();
              var method = password.etat == 1 ? 'POST' : 'PUT';
              $http({
                  method: method,
                  url: '/passwordLost',
                  data: password
              }).then(function(reponse) {
                  if (reponse.data.error) {
                      $rootScope.error = reponse.data.error;
                      defered.reject(reponse.data.error);
                      return;
                  }
                  if(password.etat == 0){
                    password.etat = 1;
                  }
                  else if (password.etat == 1) {
                      password.etat = 2;
                  }
                  defered.resolve(reponse.data);
              }, function(reponse) {
                  $rootScope.error = reponse;
                  defered.reject(reponse);
              });
              return defered.promise;
          }
      };
  }).
    factory('MotifsService', function($http, $q) {
        var motifs = null;
        return {
            list: function() {
                var defered = $q.defer();
                if (motifs) {
                    defered.resolve(motifs);
                }
                else {
                    $http({
                        method: 'GET',
                        url: '/data-conges-motifs'
                    }).then(function(response) {
                        motifs = response.data;
                        defered.resolve(motifs);
                    });
                }
                return defered.promise;
            }
        };
    }).
  factory('UsersService', function($resource, $q, $rootScope) {
      var resource = $resource('/data-users/:id',
             { id: '@id' }, {
                 charge: { method: 'POST', params: { charge: true} },
                 changePassword: { method: 'PUT', params: { password: true} },
                 searcher: { method: 'GET', params: { search: true }, isArray: true }
             });
      resource.search = function(recherche) {
          var defered = $q.defer();
          var users = resource.searcher(recherche, function() {
              defered.resolve(users);
          });
          return defered.promise;
      };
      resource.password = function(options) {
          var defered = $q.defer();
          resource.changePassword(options, function(reponse) {
              if (reponse.error) {
                  $rootScope.error = reponse.error;
                  defered.reject(reponse.error);
                  return;
              }
              defered.resolve(reponse);
          }, function(reponse) {
              $rootScope.error = reponse;
              defered.reject(reponse);
          });
          return defered.promise;
      };
      return resource; /*{
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
  factory('CongesService', function($resource, $q, $rootScope) {
      var resource = $resource('/data-conges/:id',
             { id: '@id' }, {
                 create: { method: 'POST', params: { creation: true} }
             });
      return {
          list: function(options) {
              var defered = $q.defer();
              var conges = resource.query(options, function() {
                  // GET: /user/123/card
                  // server returns: [ {id:456, number:'1234', name:'Smith'} ];
                  for (var i = 0, l = conges.length; i < l; i++) {
                      conges[i].creation = new Date(conges[i].creation);
                      conges[i].debut = {
                          date: new Date(conges[i].debut),
                          type: new Date(conges[i].debut).getHours() < 8 ? 0 : 1
                      };
                      conges[i].fin = {
                          date: new Date(conges[i].fin),
                          type: new Date(conges[i].fin).getHours() > 14 ? 1 : 0
                      };
                      //conges[i].debutType = conges[i].debut.getHours() > 14 ? 0 : 1;
                      //conges[i].finType = conges[i].fin.getHours() > 14 ? 1 : 0;
                      if (conges[i].motif != 'CP' && conges[i].motif != 'RTT' && conges[i].motif != 'RTTE' && conges[i].motif != 'CP_ANT') {
                          conges[i].motifExcep = conges[i].motif;
                          conges[i].motif = 'AE';
                      }
                      if (conges[i].user) {
                          conges[i].user = {
                              nom: conges[i].nom,
                              prenom: conges[i].prenom,
                              id: conges[i].user
                          }
                          delete conges[i].nom;
                          delete conges[i].prenom;
                      }
                  }
                  defered.resolve(conges);
              });
              return defered.promise;
          },
          save: function(conges, creation) {
              var defered = $q.defer();
              if (creation) {
                  // Création -> Flag création
                  conges.create = true;
              }
              if (conges.motifExcep) {
                  conges.motif = conges.motifExcep;
              }
              conges.debut.date.setHours(0);
              if (conges.debut.type == 1) {
                  conges.debut.date.setHours(12);
              }
              conges.fin.date.setHours(22);
              if (conges.fin.type == 0) {
                  conges.fin.date.setHours(12);
              }
              conges.debut = conges.debut.date;
              conges.fin = conges.fin.date;
              resource.save(conges, function(reponse) {
                  if (reponse.error) {
                      $rootScope.error = reponse.error;
                      defered.reject(reponse.error);
                      return;
                  }
                  conges.user = {
                      nom: conges.nom,
                      prenom: conges.prenom,
                      id: conges.user
                  }
                  defered.resolve(reponse);
              }, function(response) {
                  $rootScope.error = reponse;
                  defered.reject(response);
              });
              return defered.promise;
          },
          remove: function(conges) {
              var defered = $q.defer();
              resource.remove(conges, function(reponse) {
                  if (reponse.error) {
                      $rootScope.error = reponse.error;
                      defered.reject(reponse.error);
                      return;
                  }
                  defered.resolve(reponse);
              }, function(response) {
                  $rootScope.error = reponse;
                  defered.reject(response);
              });
              return defered.promise;
          }
      };
  }).
  factory('CongesAdminService', function ($resource, $q, $rootScope, $filter) {
      var resource = $resource('/data-admin-conges/:id',
             { id: '@id' }, {
                 /*'queryValidation': { method: 'GET', isArray: true, params: { etat: 1} },
                 'queryValider': { method: 'GET', isArray: true, params: { etat: 2} },*/
                 create: { method: 'POST', params: { create: true} },
                 updateEtat: { method: 'POST', params: { etat: true} }
             });
      return {
          list: function(options) {
              var defered = $q.defer();
              var conges = resource.query(options, function() {
                  // GET: /user/123/card
                  // server returns: [ {id:456, number:'1234', name:'Smith'} ];
                  for (var i = 0, l = conges.length; i < l; i++) {
                      conges[i].creation = new Date(conges[i].creation);
                      conges[i].debut = {
                          date: new Date(conges[i].debut),
                          type: new Date(conges[i].debut).getHours() < 8 ? 0 : 1
                      };
                      conges[i].fin = conges[i].fin = {
                          date: new Date(conges[i].fin),
                          type: new Date(conges[i].fin).getHours() > 14 ? 1 : 0
                      }
                      if (conges[i].motif != 'CP' && conges[i].motif != 'RTT' && conges[i].motif != 'RTTE' && conges[i].motif != 'CP_ANT') {
                          conges[i].motifExcep = conges[i].motif;
                          conges[i].motif = 'AE';
                      }
                      if (conges[i].user) {
                          conges[i].user = {
                              nom: conges[i].nom,
                              prenom: conges[i].prenom,
                              id: conges[i].user
                          }
                          delete conges[i].nom;
                          delete conges[i].prenom;
                          conges[i].typeuser = conges[i].user.id == 999999 ? 2 : 1;
                      }
                  }
                  defered.resolve(conges);
              });
              return defered.promise;
          },
          save: function(conges, creation) {
              var defered = $q.defer();
              if (creation) {
                  // Création -> Flag création
                  conges.create = true;
              }
              if (conges.motifExcep) {
                  conges.motif = conges.motifExcep;
              }
              if (conges.typeuser == 2) {
                  conges.user = {
                      id: 999999,
                      nom: 'Tous',
                      prenom: ''
                  };
              }
              delete conges.typeuser;
              conges.debut.date.setHours(0);
              if (conges.debut.type == 1) {
                  conges.debut.date.setHours(12);
              }
              conges.fin.date.setHours(22);
              if (conges.fin.type == 0) {
                  conges.fin.date.setHours(12);
              }
              conges.debut = conges.debut.date;
              conges.fin = conges.fin.date;
              if (conges.user && conges.user.id) {
                  conges.nom = conges.user.nom;
                  conges.prenom = conges.user.prenom;
                  conges.user = conges.user.id;
              }
              resource.save(conges, function(reponse) {
                  if (reponse.error) {
                      $rootScope.error = reponse.error;
                      defered.reject(reponse.error);
                      return;
                  }
                  conges.user = {
                      nom: conges.nom,
                      prenom: conges.prenom,
                      id: conges.user
                  }
                  defered.resolve(reponse);
              }, function(response) {
                  $rootScope.error = response;
                  defered.reject(response);
              });
              return defered.promise;
          },
          remove: function(conges) {
              var defered = $q.defer();
              resource.remove(conges, function(reponse) {
                  if (reponse.error) {
                      $rootScope.error = reponse.error;
                      defered.reject(reponse.error);
                      return;
                  }
                  defered.resolve(reponse);
              }, function(response) {
                  $rootScope.error = response;
                  defered.reject(response);
              });
              return defered.promise;
          },
          updateEtat: function(conges) {
              var defered = $q.defer();
              conges.libelle = $filter('motifConges')(conges.motif);
              resource.updateEtat(conges, function(reponse) {
                  if (reponse.error) {
                      $rootScope.error = reponse.error;
                      defered.reject(reponse.error);
                      return;
                  }
                  defered.resolve(reponse);
              }, function(response) {
                  $rootScope.error = response;
                  defered.reject(response);
              });
              return defered.promise;
          }
      };
  }).
  factory('ActiviteService', function($resource, $q, $rootScope) {
      var resource = $resource('/data-activite/:mois',
             { id: '@mois' }, {
                 list: { method: 'GET' },
                 create: { method: 'POST', params: { create: true} },
                 updateEtat: { method: 'POST', params: { etat: true} }
             });
      return {
          list: function(options) {
              var defered = $q.defer();
              var activite = resource.list(options, function() {
                  // GET: /user/123/card
                  // server returns: [ {id:456, number:'1234', name:'Smith'} ];
                  var mois;
                  if (options.start.getDate() == 1) {
                      mois = new Date(options.start.getFullYear(), options.start.getMonth(), 1);
                  }
                  else {
                      mois = new Date(options.start.getFullYear(), options.start.getMonth() + 1, 1);
                  }
                  if (activite.mois) {
                      activite.mois = new Date(activite.mois);
                      if (activite.mois.getMonth() != mois.getMonth()) {
                          activite.etat = -1;
                          activite.activite = [];
                      }
                  }
                  else {
                      activite.mois = mois;
                  }
                  for (var i = 0, l = activite.activite.length; i < l; i++) {
                      if (activite.activite[i].jour) {
                          activite.activite[i].jour = {
                              date: new Date(activite.activite[i].jour),
                              type: new Date(activite.activite[i].jour).getHours() < 8 ? 0 : 1
                          };
                          if (activite.activite[i].jour.date.getHours() == 0) {
                              activite.activite[i].duree = 0;
                          }
                          else if (activite.activite[i].jour.date.getHours() < 14) {
                              activite.activite[i].duree = 1;
                          }
                          else {
                              activite.activite[i].duree = 2;
                          }
                      }
                      else {
                          activite.activite[i].debut = {
                              date: new Date(activite.activite[i].debut),
                              type: new Date(activite.activite[i].debut).getHours() < 8 ? 0 : 1
                          };
                          activite.activite[i].fin = {
                              date: new Date(activite.activite[i].fin),
                              type: new Date(activite.activite[i].fin).getHours() > 14 ? 1 : 0
                          }

                      }
                      var types = ['JT', 'JF', 'CP', 'CP_ANT', 'RTT', 'RTTE']
                      if (types.indexOf(activite.activite[i].type) == -1) {
                          activite.activite[i].type = 'AE';
                      }
                      if (activite.activite[i].type == 'JF' && activite.activite[i].debut && activite.activite[i].fin) {
                          activite.activite[i].debut.date.setHours(0);
                          activite.activite[i].debut.date.setMinutes(0);
                          activite.activite[i].fin.date.setHours(0);
                          activite.activite[i].fin.date.setMinutes(0);
                          activite.activite[i].debut.type = 0;
                          activite.activite[i].fin.type = 1;
                      }
                  }
                  defered.resolve(activite);
              });
              return defered.promise;
          },
          save: function(activite, creation) {
              var defered = $q.defer();
              if (creation) {
                  // Création -> Flag création
                  activite.create = true;
              }
              resource.save(activite, function(reponse) {
                  if (reponse.error) {
                      $rootScope.error = reponse.error;
                      defered.reject(reponse.error);
                      return;
                  }
                  defered.resolve(reponse);
              }, function(response) {
                  $rootScope.error = response;
                  defered.reject(response);
              });
              return defered.promise;
          }
      };
  }).
 factory('ActiviteAdminService', function($resource, $q, $rootScope) {
     var resource = $resource('/data-admin-activite/:id',
             { id: '@id' }, {
                 list: { method: 'GET', isArray: true },
                 removeActivite: { method: 'DELETE' },
                 create: { method: 'POST', params: { create: true} },
                 updateEtat: { method: 'POST', params: { etat: true} }
             });
     return {
         list: function(options) {
             var defered = $q.defer();
             var activites = resource.list(options, function() {
                 // GET: /user/123/card
                 // server returns: [ {id:456, number:'1234', name:'Smith'} ];
                 for (var i = 0, l = activites.length; i < l; i++) {
                     if (activites[i].mois) {
                         activites[i].mois = new Date(activites[i].mois);
                     }
                     if (activites[i].user) {
                         activites[i].user = {
                             nom: activites[i].nom,
                             prenom: activites[i].prenom,
                             id: activites[i].user
                         }
                         delete activites[i].nom;
                         delete activites[i].prenom;
                     }
                 }
                 defered.resolve(activites);
             });
             return defered.promise;
         },
         get: function(options) {
             var params = {
                id: options.user.id,
                start: options.mois,
                end: moment(options.mois).add('month', 1).toDate(),
             }
             var defered = $q.defer();
             var activite = resource.get(params, function() {
                 // GET: /user/123/card
                 // server returns: [ {id:456, number:'1234', name:'Smith'} ];
                 if (activite.mois) {
                     activite.mois = new Date(activite.mois);
                 }
                 for (var i = 0, l = activite.activite.length; i < l; i++) {
                     if (activite.activite[i].jour) {
                         activite.activite[i].jour = {
                             date: new Date(activite.activite[i].jour),
                             type: new Date(activite.activite[i].jour).getHours() < 8 ? 0 : 1
                         };
                         if (activite.activite[i].jour.date.getHours() == 0) {
                             activite.activite[i].duree = 0;
                         }
                         else if (activite.activite[i].jour.date.getHours() < 14) {
                             activite.activite[i].duree = 1;
                         }
                         else {
                             activite.activite[i].duree = 2;
                         }
                     }
                     var types = ['JT', 'JF', 'CP', 'CP_ANT', 'RTT', 'RTTE']
                     if (types.indexOf(activite.activite[i].type) == -1) {
                         activite.activite[i].type = 'AE';
                     }
                 }
                 defered.resolve(activite);
             });
             return defered.promise;
         },
         remove: function(activite) {
             var defered = $q.defer();
             activite = {
                user: activite.user.id,
                mois: activite.mois,
                etat: activite.etat
             }
             resource.removeActivite(activite, function(reponse) {
                 if (reponse.error) {
                     $rootScope.error = reponse.error;
                     defered.reject(reponse.error);
                     return;
                 }
                 defered.resolve(reponse);
             }, function(response) {
                 $rootScope.error = response;
                 defered.reject(response);
             });
             return defered.promise;
         },
         updateEtat: function(activite) {
             var defered = $q.defer();
             if (activite.user) {
                 activite.user = activite.user.id;
             }
             resource.updateEtat(activite, function(reponse) {
                 if (reponse.error) {
                     $rootScope.error = reponse.error;
                     defered.reject(reponse.error);
                     return;
                 }
                 defered.resolve(reponse);
             }, function(response) {
                 $rootScope.error = response;
                 defered.reject(response);
             });
             return defered.promise;
         }
     };
 });
