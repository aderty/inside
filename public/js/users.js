'use strict';

/* Controllers */

// Contrôleur principal de la gestion des utilisateurs
(function() {
    /* Controllers */
    // Contrôleur principal de la gestion des utilisateurs
    this.register('UsersMain', ['$scope', '$rootScope', '$dialog', 'UsersService', UsersMain]);
    this.register('UsersGrid', ['$scope', '$rootScope', '$filter', 'ngTableParams', 'ngTableFilter', 'UsersService', 'ConfigService', UsersGrid]);
    this.register('DialogHistory', ['$scope', '$rootScope', '$filter', 'ngTableParams', 'ngTableFilter', 'dialog', 'HistoryService', DialogHistory]);

    function UsersMain($scope, $rootScope, $dialog, UsersService) {
        if (!$rootScope.nextId) {
            $rootScope.nextId = max;
        }

        $scope.edition = 0;
        $scope.mode = "";
        $scope.lblMode = "";
        $scope.currentUserSaved = null;
        $scope.create = function() {
            $scope.error = null;
            $scope.editUser.$setPristine();
            document.getElementById('password').value = "";
            document.getElementById('confirm_password').value = "";
            $scope.currentUser = {
                id: $rootScope.nextId,
                role: 1,
                admin: {
                    id: 0,
                    nom: 'Admin'
                },
                hasRtt: true,
                cp: 0,
                cp_ant: 0,
                rtt: 0
            };
            $scope.edition = 1;
            $scope.mode = "Création";
            $scope.lblMode = "Création d'un nouvel utilisateur";
        };

        $scope.cancel = function() {
            $scope.error = null;
            $scope.edition = 0;
            $.extend($scope.currentUser, $scope.currentUserSaved);
        };

        $scope.edit = function(row) {
            $scope.error = null;
            $scope.currentUser = row;
            $scope.editUser.$setPristine();
            $scope.currentUserSaved = angular.copy($scope.currentUser);
            $scope.edition = 2;
            $scope.mode = "Edition";
            $scope.lblMode = "Modification de ";
        };
        $scope.histo = function(row) {
            $scope.error = null;
            $rootScope.error = "";
            $rootScope.currentUser = row;
            // Inlined template for demo 
            var opts = {
                backdrop: true,
                keyboard: true,
                backdropClick: true,
                templateUrl: '/templates/history.html?v=' + config.version,
                controller: 'DialogHistory'
            };
            var d = $dialog.dialog(opts);
            d.open().then(function(result) {
                if (result) {
                }
            });
        };

        $scope['delete'] = function(row) {
            var btns = [{ label: 'Oui', result: 'yes', cssClass: 'btn-primary' }, { label: 'Non', result: 'no'}];
            var msgbox = $dialog.messageBox('Suppression d\'un utilisateur', 'Etes-vous sûr de supprimer ' + row.prenom + ' ' + row.nom + '?', btns);
            msgbox.open().then(function(result) {
                if (result === 'yes') {
                    UsersService.remove(row, function(err) {
                        var index = $rootScope.users.indexOf(row);
                        $rootScope.users.splice(index, 1);
                    });
                }
            });
        };

        $scope.isUnchanged = function(currentUser) {
            $scope.haschanged = angular.equals(currentUser, $scope.currentUserSaved);
            return
        };


        $scope.save = function(currentUser) {
            var user = angular.copy(currentUser);
            delete user.pwdtest;
            if ($scope.edition == 1) {
                // Création -> Flag création
                user.create = true;
                $rootScope.nextId++;
            }
            else {
                // Modif de matricule
                if (user.id != $scope.currentUserSaved.id) {
                    user.lastId = $scope.currentUserSaved.id;
                }
            }
            if (user.admin) {
                user.admin = user.admin.id;
            }
            UsersService.save(user, function(reponse) {
                if (reponse.error) {
                    $scope.error = reponse.error;
                    return;
                }
                $scope.error = null;
                $scope.edition = 0;
                var index = $rootScope.users.indexOf(currentUser);
                if (index == -1) {
                    $rootScope.users.push(currentUser);
                }
            });
        };

        $scope.selectUserOptions = {
            placeholder: "Rechercher un utilisateur",
            minimumInputLength: 1,
            query: function(options) {
                var type = isNaN(options.term) ? "text" : "id";
                $rootScope.$apply(function() {
                    UsersService.search({ type: type, search: options.term }).then(function(result) {
                        options.callback({
                            more: false,
                            results: result
                        });
                    });
                });
            },
            //data: [{ id: 1, nom: "Admin", prenom: ""}],
            initSelection: function(e, d, f) {
            },
            formatResult: format, // omitted for brevity, see the source of this page
            formatSelection: format, // omitted for brevity, see the source of this page
            dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
            escapeMarkup: function(m) { return m; } // we do not want to escape markup since we are displaying html in results
        };

        function format(user) {
            return user.nom + " " + (user.prenom || "");
        }

        $scope.currentUser = {};
    }

    // Contrôleur de la grille des utilisateurs
    function UsersGrid($scope, $rootScope, $filter, ngTableParams, ngTableFilter, UsersService, ConfigService) {
        $scope.filterOptions = {
            filterText: "",
            useExternalFilter: false
        };
        var filterTimer;
        $scope.$on('search', function(event, data) {
            if (data.searcher == "users") {
                $scope.filterOptions = {
                    filterText: data.search,
                    useExternalFilter: false
                };
                $scope.tableParamsUser.$params.filter = data.search;
            }
        });

        $scope.pagingOptions = {
            pageSizes: [25, 50, 100],
            pageSize: 50,
            totalServerItems: 0,
            currentPage: 1
        };

        $scope.tableParamsUser = new ngTableParams({
            page: 1,            // show first page
            //total: 0, // length of data
            count: ConfigService.pageSize(),           // count per page
            sorting: {
                id: 'asc'     // initial sorting
            }
        },
        {
            getData: function($defer, params) {
                // use build-in angular filter
                $rootScope.users = UsersService.query(function() {
                    // GET: /user/123/card
                    // server returns: [ {id:456, number:'1234', name:'Smith'} ];
                    for (var i = 0, l = $rootScope.users.length; i < l; i++) {
                        $rootScope.users[i].dateNaissance = new Date($rootScope.users[i].dateNaissance);
                        if (typeof $rootScope.users[i].admin != "undefined") {
                            $rootScope.users[i].admin = {
                                id: $rootScope.users[i].admin,
                                nom: $rootScope.users[i].adminNom,
                                prenom: $rootScope.users[i].adminPrenom
                            };
                            delete $rootScope.users[i].adminNom;
                            delete $rootScope.users[i].adminPrenom;
                        }
                    }
                    $rootScope.users = ngTableFilter($rootScope.users, params);
                    // use build-in angular filter
                    $defer.resolve($rootScope.users);
                });

            }
        });

        $scope.$watch('users', function(users) {
            $rootScope.users = users;
        }, true);
    };

    // Contrôleur de la popup de l'historique des actions de l'utilisateur
    function DialogHistory($scope, $rootScope, $filter, ngTableParams, ngTableFilter, dialog, HistoryService) {
        $rootScope.error = "";
        $rootScope.history = null;
        var data;

        $scope.close = function() {
            $rootScope.error = "";
            dialog.close();
        };

        $scope.tableParams = new ngTableParams({
            page: 1,            // show first page
            //total: 0, // length of data
            count: 5,           // count per page
            sorting: {
                date: 'desc'     // initial sorting
            }
        },
        {
            counts: [5, 10, 25, 50, 100],
            getData: function($defer, params) {
                HistoryService.list($rootScope.currentUser.id).then(function(histo) {
                    $rootScope.history = ngTableFilter(histo, params);
                    // $scope.tableParamsUserData = $rootScope.usersData;
                    // use build-in angular filter
                    $defer.resolve($rootScope.history);
                });
            }
        });
    }
}).call(app.controllerProvider);