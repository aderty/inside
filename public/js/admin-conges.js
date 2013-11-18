'use strict';

(function() {
    /* Controllers */
    // Contrôleur principal de la gestion des utilisateurs
    this.register('CongesAdmin', ['$scope', '$rootScope', '$dialog', 'CongesAdminService', 'UsersService', CongesAdmin]);
    this.register('DialogConges', ['$scope', '$rootScope', 'dialog', DialogConges]);
    this.register('DialogAideConges', ['$scope', 'dialog', DialogAideConges]);
    this.register('CongesAdminGrid', ['$scope', '$rootScope', '$timeout', '$filter', 'ngTableParams', 'ngTableFilter', 'CongesAdminService', CongesAdminGrid]);

    /* Controllers */
    function CongesAdmin($scope, $rootScope, $dialog, CongesAdminService, UsersService) {
        $scope.edition = 0;
        $scope.mode = "";
        $scope.lblMode = "";
        $scope.currentConges = {};
        $scope.currentCongesSaved = null;

        $scope.showMatricule = true;

        $scope.dateOptionsDebut = {
            dateFormat: 'dd/mm/yy',
            changeYear: true,
            changeMonth: true,
            yearRange: '-2Y:+1Y'
        };
        $scope.dateOptionsFin = {
            dateFormat: 'dd/mm/yy',
            changeYear: true,
            changeMonth: true,
            yearRange: '-2Y:+1Y'
        };

        $scope.$watch('currentConges.debut.date', function(newValue) {
            $scope.dateOptionsFin.minDate = newValue;
        });

        $scope.accepter = function(row) {
            $scope.currentConges = row;
            if ($scope.currentConges.etat == 2 || $scope.currentConges.etat == 3) return;
            var conges = angular.copy($scope.currentConges);
            conges.etat = 2;
            var msg = 'Etes-vous sûr de vouloir valider la demande de congés ?';
            var btns = [{ label: 'Oui', result: 'yes', cssClass: 'btn-primary' }, { label: 'Non', result: 'no'}];
            var msgbox = $dialog.messageBox('Validation d\'un congé', msg, btns);
            msgbox.open().then(function(result) {
                if (result === 'yes') {
                    CongesAdminService.updateEtat(conges, false).then(function(reponse) {
                        $rootScope.error = null;
                        $rootScope.infos.nbCongesVal--;
                        $scope.currentConges.etat = 2;
                        var index = $rootScope.congesAvalider.indexOf(row);
                        if (index > -1) {
                            $rootScope.congesAvalider.splice(index, 1);
                        }
                        else {
                            index = $rootScope.congesRefuser.indexOf(row);
                            if (index > -1) {
                                $rootScope.congesRefuser.splice(index, 1);
                            }
                        }
                        $rootScope.congesValider.push(row);
                    });
                }
            });
        };

        // Inlined template for demo 
        $scope.opts = {
            backdrop: true,
            keyboard: true,
            backdropClick: true,
            template: $.trim($("#refusTmpl").html()),
            controller: 'DialogConges'
        };

        $scope.refuser = function(row) {
            $scope.currentConges = row;
            if ($scope.currentConges.etat == 3) return;
            var conges = angular.copy($scope.currentConges);
            conges.etat = 3;
            $rootScope.dialogModel = conges;
            //var btns = [{ label: 'Oui', result: 'yes', cssClass: 'btn-primary' }, { label: 'Non', result: 'no' }];
            //var msgbox = $dialog.messageBox('Refus d\'un congé', 'Etes-vous sûr de vouloir refuser la demande de congés ?', btns);
            var msgbox = $dialog.dialog($scope.opts);
            msgbox.open().then(function(result) {
                if (result === 'yes') {
                    CongesAdminService.updateEtat(conges, false).then(function(reponse) {
                        $rootScope.error = null;
                        $rootScope.infos.nbCongesVal--;
                        $scope.currentConges.etat = 3;
                        var index = $rootScope.congesAvalider.indexOf(row);
                        if (index > -1) {
                            $rootScope.congesAvalider.splice(index, 1);
                        }
                        else {
                            index = $rootScope.congesValider.indexOf(row);
                            if (index > -1) {
                                $rootScope.congesValider.splice(index, 1);
                            }
                        }
                        $rootScope.congesRefuser.push(row);
                    });
                }
            });
        };

        $scope.create = function() {
            $rootScope.error = null;
            $scope.editConges.$setPristine();
            $scope.currentConges = {
                typeuser: 1,
                etat: 2,
                debut: {
                    type: 0
                },
                fin: {
                    type: 1
                }
            };
            $scope.edition = 1;
            $scope.mode = "Création";
            $scope.lblMode = "Nouveau congé de régulation";
        }

        $scope.cancel = function() {
            $rootScope.error = null;
            $scope.edition = 0;
            $.extend($scope.currentConges, $scope.currentCongesSaved);
        }

        $scope.edit = function(row) {
            $rootScope.error = null;
            $scope.currentConges = row;
            $scope.editConges.$setPristine();
            $scope.currentCongesSaved = angular.copy($scope.currentConges);
            $scope.edition = 2;
            $scope.mode = "Edition";
            $scope.lblMode = "Modification d'un congé";
            $scope.dateOptionsFin.minDate = $scope.currentConges.debut.date;
        }

        $scope['delete'] = function(row) {
            var btns = [{ label: 'Oui', result: 'yes', cssClass: 'btn-primary' }, { label: 'Non', result: 'no'}];
            var msgbox = $dialog.messageBox('Suppression d\'un congé', 'Etes-vous sûr de supprimer la demande de congés ?', btns);
            msgbox.open().then(function(result) {
                if (result === 'yes') {
                    CongesAdminService.remove(row).then(function(reponse) {
                        var index = $rootScope.congesAvalider.indexOf(row);
                        if (index > -1) {
                            $rootScope.congesAvalider.splice(index, 1);
                        }
                        else {
                            index = $rootScope.congesValider.indexOf(row);
                            if (index > -1) {
                                $rootScope.congesValider.splice(index, 1);
                            }
                            else {
                                index = $rootScope.congesRefuser.indexOf(row);
                                if (index > -1) {
                                    $rootScope.congesRefuser.splice(index, 1);
                                }
                            }
                        }
                    });
                }
            });
        }

        $scope.isEditable = function(currentConges) {
            return currentConges.etat != 3;
        };

        $scope.isUnchanged = function(currentConges) {
            $scope.haschanged = angular.equals(currentConges, $scope.currentCongesSaved);
            return
        };


        $scope.save = function(currentConges) {
            var conges = angular.copy(currentConges);
            CongesAdminService.save(conges, $scope.edition == 1).then(function(reponse) {
                $rootScope.error = null;
                if (currentConges.typeuser == 2) {
                    currentConges.user = conges.user;
                }
                if (reponse.id) {
                    currentConges.id = reponse.id;
                }
                if (reponse.duree) {
                    currentConges.duree = reponse.duree;
                }
                if ($scope.edition == 1) {
                    $rootScope.congesValider.push(currentConges);
                }
                $scope.edition = 0;
                $scope.currentConges = null;
            });
        }
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
            data: [{ id: 2, nom: "tous", prenom: ""}],
            initSelection: function(e, d, f) {
            },
            formatResult: format, // omitted for brevity, see the source of this page
            formatSelection: format, // omitted for brevity, see the source of this page
            dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
            escapeMarkup: function(m) { return m; } // we do not want to escape markup since we are displaying html in results
        };

        function format(user) {
            return user.nom.toLowerCase() + " " + user.prenom;
        }

        $scope.showAide = function() {
            var d = $dialog.dialog({
                backdrop: true,
                keyboard: true,
                backdropClick: true,
                templateUrl: '/templates/aide-conges.html',
                controller: 'DialogAideConges'
            });
            d.open();
        }
    }

    // Contrôleur de la popup de modification de password
    function DialogConges($scope, $rootScope, dialog) {
        $scope.close = function(param) {
            dialog.close(param);
        };
    }

    // Contrôleur de la popup de modification de password
    function DialogAideConges($scope, dialog) {
        $scope.close = function() {
            dialog.close();
        };
    }

    // Contrôleur de la grille des congés
    function CongesAdminGrid($scope, $rootScope, $timeout, $filter, ngTableParams, ngTableFilter, CongesAdminService) {

        $scope.filterOptions = {
            filterText: "",
            useExternalFilter: false
        };

        $scope.$on('search', function(event, data) {
            if (data.searcher == "admin-conges") {
                $scope.tableParamsCongesAValider.$params.filter = data.search;
                $scope.tableParamsValider.$params.filter = data.search;
                $scope.tableParamsRefuser.$params.filter = data.search;
            }
        });

        $scope.pagingOptions = {
            pageSizes: [25, 50, 100],
            pageSize: 50,
            totalServerItems: 0,
            currentPage: 1
        };

        $scope.etatOptions = {
            type: 1
        };
        var scope = $scope;


        $rootScope.tableParamsCongesAValider = new ngTableParams({
            page: 1,            // show first page
            count: 10,
            sorting: {
                'debut.date': 'asc'     // initial sorting
            }
        },
    {
        getData: function($defer, params) {
            CongesAdminService.list({ etat: 1 }).then(function(conges) {
                $rootScope.congesAvalider = ngTableFilter(conges, params);
                $defer.resolve($rootScope.congesAvalider);
            });
        }
    });
        $rootScope.tableParamsValider = new ngTableParams({
            page: 1,            // show first page
            count: 10,
            sorting: {
                'debut.date': 'asc'     // initial sorting
            }
        },
    {
        getData: function($defer, params) {
            CongesAdminService.list({ etat: 2 }).then(function(conges) {
                $rootScope.congesValider = ngTableFilter(conges, params);
                $defer.resolve($rootScope.congesValider);
            });
        }
    });
        $rootScope.tableParamsRefuser = new ngTableParams({
            page: 1,            // show first page
            count: 10,
            sorting: {
                'debut.date': 'asc'     // initial sorting
            }
        },
    {
        getData: function($defer, params) {
            CongesAdminService.list({ etat: 3 }).then(function(conges) {
                $rootScope.congesRefuser = ngTableFilter(conges, params);
                $defer.resolve($rootScope.congesRefuser);
            });
        }
    });

        $scope.$on('ngGridEventColumns', function(e) {
            setTimeout(function() {
                $('.matriculeCell>span').tooltip({ container: 'body' });
            }, 250);
        });
    };
}).call(app.controllerProvider);