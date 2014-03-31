'use strict';

(function() {
    /* Controllers */
    // Contrôleur principal de la gestion des utilisateurs
    this.register('CongesMain', ['$scope', '$rootScope', '$dialog', 'UsersService', 'CongesService', CongesMain]);
    this.register('DialogAideConges', ['$scope', 'dialog', DialogAideConges]);
    this.register('CongesGauges', ['$scope', '$rootScope', CongesGauges]);
    this.register('CongesGrid', ['$scope', '$rootScope', '$filter', 'ngTableParams', 'ngTableFilter', 'CongesService', '$timeout', 'ConfigService', CongesGrid]);

function CongesMain($scope, $rootScope, $dialog, UsersService, CongesService) {
    $scope.edition = 0;
    $scope.mode = "";
    $scope.lblMode = "";
    $scope.currentConges = {};
    $scope.currentCongesSaved = null;

    $scope.placeholderDate = moment().format("DD/MM/YYYY");

    $scope.motifsConges = angular.copy($rootScope.motifsConges);
    for (var i = 0, l = $scope.motifsConges.length; i < l; i++) {
        if ($scope.motifsConges[i].id == 'RCE') {
            $scope.motifsConges.splice(i, 1);
            break;
        }
    }

    $scope.showMatricule = false;

    $scope.dateOptionsDebut = {
        dateFormat: 'dd/mm/yy',
        changeYear: true,
        changeMonth: true,
        yearRange: '0:+1Y',
        minDate: '0'
    };
    $scope.dateOptionsFin = {
        dateFormat: 'dd/mm/yy',
        changeYear: true,
        changeMonth: true,
        yearRange: '0:+1Y',
        minDate: '0'
    };
    $scope.$watch('currentConges.debut.date', function(newValue){
        $scope.dateOptionsFin.minDate = newValue;
    });

    UsersService.getCurrent().then(function(retour) {
        $scope.user = retour;
        $scope.cp = retour.cp;
        $scope.cp_ant = retour.cp_ant;
        $scope.rtt = retour.rtt;
    });

    $scope.showAide = function () {
        var d = $dialog.dialog({
            backdrop: true,
            keyboard: true,
            backdropClick: true,
            templateUrl: '/templates/aide-conges.html?v=' + config.version,
            controller: 'DialogAideConges'
        });
        d.open();
    }

    $scope.create = function () {
        $rootScope.error = null;
        $scope.editConges.$setPristine();
        $scope.currentConges = {
            etat: 1,
            debut: {
                type: 0
            },
            fin: {
                type: 1
            }
        };
        $scope.edition = 1;
        $scope.mode = "Création";
        $scope.lblMode = "Nouvelle demande d'absence";
    }

    $scope.cancel = function () {
        $rootScope.error = null;
        $scope.edition = 0;
        $.extend($scope.currentConges, $scope.currentCongesSaved);
    }

    $scope.edit = function (row) {
        $rootScope.error = null;
        $scope.currentConges = row;
        $scope.editConges.$setPristine();
        $scope.currentCongesSaved = angular.copy($scope.currentConges);
        $scope.edition = 2;
        $scope.mode = "Edition";
        $scope.lblMode = "Modification d'une demande d'absence";
    }

    $scope['delete'] = function (row) {
        var btns = [{ label: 'Oui', result: 'yes', cssClass: 'btn-primary' }, { label: 'Non', result: 'no' }];
        var msgbox = $dialog.messageBox('Suppression d\'une absence', 'Etes-vous sûr de supprimer la demande d\'absence ?', btns);
        msgbox.open().then(function(result){
            if (result === 'yes') {
                CongesService.remove(row).then(function (reponse) {
                    $rootScope.error = null;
                    var index = $rootScope.conges.indexOf(row);
                    $rootScope.conges.splice(index, 1);
                    UsersService.getCurrent({ reload: true }).then(function (retour) {
                        $scope.cp = retour.cp;
                        $scope.cp_ant = retour.cp_ant;
                        $scope.rtt = retour.rtt;
                    });
                });
            }
        });
    }
    
    $scope.isEditable = function(currentConges) {
        return moment(currentConges.creation).add('days', 2) > moment() && currentConges.etat == 1;
    };

    $scope.isUnchanged = function(currentConges) {
        $scope.haschanged = angular.equals(currentConges, $scope.currentCongesSaved);
        return 
    };


    $scope.save = function (currentConges) {
        var conges = angular.copy(currentConges);
        delete conges.etat;
        if ($scope.edition == 1) {
            // Création -> Flag création
            conges.create = true;
        }
        $scope.saving = true;
        CongesService.save(conges, $scope.edition == 1).then(function (reponse) {
            $scope.saving = false;
            $rootScope.error = null;
            if ($scope.edition == 1) {
                $rootScope.infos.nbCongesVal++;
            }
            $scope.edition = 0;
            if (reponse.id) {
                currentConges.id = reponse.id;
            }
            if (reponse.duree) {
                currentConges.duree = reponse.duree;
            }
            var index = $rootScope.conges.indexOf(currentConges);
            if (index == -1) {
                $rootScope.conges.push(currentConges);
            }
            UsersService.getCurrent({ reload: true }).then(function (retour) {
                $scope.cp = retour.cp;
                $scope.cp_ant = retour.cp_ant;
                $scope.rtt = retour.rtt;
            });
        }, function () {
            $scope.saving = false;
        });
    }

    $scope.selectUserOptions = {
        query: function (options) {
            options.callback({
                more: false,
                results: [
                ]
            });
        },
        initSelection: function (e, d, f) {
        }
    };
}

// Contrôleur de la popup de modification de password
function DialogAideConges($scope, dialog) {
    $scope.close = function () {
        dialog.close();
    };
}

function CongesGauges($scope, $rootScope) {
    /*$scope.cp = 22;
    $scope.cpacc = 7.25;  
    $scope.rtt = 15;*/
}

// Contrôleur de la grille des congés
function CongesGrid($scope, $rootScope, $filter, ngTableParams, ngTableFilter, CongesService, $timeout, ConfigService) {

    $scope.filterOptions = {
        filterText: "",
        useExternalFilter: false,
        filterRow: { etat: 2 }
    };

    $scope.pagingOptions = {
        pageSizes: [25, 50, 100],
        pageSize: 50,
        totalServerItems: 0,
        currentPage: 1
    };
    var dataCong;
    var past = true;
    $rootScope.conges = [];
    
    $scope.updateFilter = function(etat){
        past = !past;
        $rootScope.tableParamsConges.reload();
        $rootScope.tableParamsConges.page(1);
    }

    $rootScope.tableParamsConges = new ngTableParams({
        page: 1,            // show first page
        count: ConfigService.pageSize(),
        sorting: {
            'debut.date': 'asc'     // initial sorting
        },
    },
        {
            getData: function ($defer, params) {
                CongesService.list({ past: past }).then(function (conges) {
                    $rootScope.conges = ngTableFilter(conges, params);
                    $defer.resolve($rootScope.conges);
                });
            }
        });
};
}).call(app.controllerProvider);