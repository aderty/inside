'use strict';

function CongesMain($scope, $rootScope, $dialog, UsersService, CongesService) {
    $scope.edition = 0;
    $scope.mode = "";
    $scope.lblMode = "";
    $scope.currentConges = {};
    $scope.currentCongesSaved = null;

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

    $scope.user = UsersService.get({ id: 0 }, function(retour) {
        $scope.cp = $scope.user.cp;
        $scope.cp_ant = $scope.user.cp_ant;
        $scope.rtt = $scope.user.rtt;
    });

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
        $scope.lblMode = "Nouvelle demande de congés";
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
        $scope.lblMode = "Modification d'une demande de congés";
    }

    $scope['delete'] = function (row) {
        var btns = [{ label: 'Oui', result: 'yes', cssClass: 'btn-primary' }, { label: 'Non', result: 'no' }];
        var msgbox = $dialog.messageBox('Suppression d\'un congé', 'Etes-vous sûr de supprimer la demande de congés ?', btns);
        msgbox.open().then(function(result){
            if (result === 'yes') {
                CongesService.remove(row).then(function (reponse) {
                    $rootScope.error = null;
                    var index = $rootScope.conges.indexOf(row);
                    $rootScope.conges.splice(index, 1);
                    user = UsersService.get({ id: 0 }, function (retour) {
                        $scope.cp = user.cp;
                        $scope.cp_ant = user.cp_ant;
                        $scope.rtt = user.rtt;
                    });
                });
            }
        });
    }
    
    $scope.isEditable = function(currentConges) {
        return moment(currentConges.creation).add('days', 1) > moment() && currentConges.etat == 1;
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
        CongesService.save(conges, $scope.edition == 1).then(function (reponse) {
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
            user = UsersService.get({ id: 0 }, function (retour) {
                $scope.cp = user.cp;
                $scope.cp_ant = user.cp_ant;
                $scope.rtt = user.rtt;
            });
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

function CongesGauges($scope, $rootScope) {
    /*$scope.cp = 22;
    $scope.cpacc = 7.25;  
    $scope.rtt = 15;*/
}

// Contrôleur de la grille des congés
function CongesGrid($scope, $rootScope, CongesService, $timeout) {

    $scope.filterOptions = {
        filterText: "",
        useExternalFilter: false,
        filterRow: null
    };

    $scope.pagingOptions = {
        pageSizes: [25, 50, 100],
        pageSize: 50,
        totalServerItems: 0,
        currentPage: 1
    };

    $rootScope.conges = [];

    CongesService.list().then(function (conges) {
        $rootScope.conges = conges;
    });
    
    setTimeout(function () {
        $(".tabbable").each(function () {
            $(this).scope().select = (function (select) {
                return function (e) {
                    select.apply(this, arguments);
                    if(e.heading == "Tous mes congés à venir"){
                        updateFilter(null);
                    }
                    else if (e.heading == "Congés en attente de validation") {
                        updateFilter(1);
                    }
                    else if (e.heading == "Congés validés") {
                        updateFilter(2);
                    }
                    else {
                        updateFilter(3);
                    }
                };
            })($(this).scope().select)
        });
    }, 250);
    
    function updateFilter(etat){
        $timeout(function(){
            if(etat){
                $scope.gridOptionsConges.filterOptions.filterRow = {etat: etat};
            }
            else{
                $scope.gridOptionsConges.filterOptions.filterRow = null;
            }
        },0);
    }

    var myHeaderCellTemplate = $.trim($('#headerTmpl').html());
    var justificationCellTemplate = $.trim($('#justificationTmpl').html());

    $scope.gridOptionsConges = {
        data: 'conges',
        columnDefs: [
            { field: '', displayName: '', width: 22, cellTemplate: '<span class="etatConges {{cssConges[row.etat]}}">&nbsp;</span>', resizable: false },
            { field: 'debut', displayName: 'Date de début', width: 160, cellFilter: "momentCongesDebut:'DD/MM/YYYY'", headerCellTemplate: myHeaderCellTemplate, resizable: false, sort: 'debut.date' },
            { field: 'fin', displayName: 'Date de fin', width: 160, cellFilter: "momentCongesFin:'DD/MM/YYYY'", headerCellTemplate: myHeaderCellTemplate, resizable: false, sort: 'fin.date' },
            { field: 'duree', displayName: 'Durée', width: 35, headerCellTemplate: myHeaderCellTemplate, resizable: false },
            { field: 'motif', displayName: 'Modif', width: 65, cellFilter: "motifCongesShort", headerCellTemplate: myHeaderCellTemplate, resizable: false },
            { field: 'etat', displayName: 'Etat', width: 165, cellFilter: "etatConges", headerCellTemplate: myHeaderCellTemplate, resizable: false },
            { field: 'justification', displayName: 'Justification', headerCellTemplate: myHeaderCellTemplate, cellTemplate: justificationCellTemplate, resizable: false },
            { field: '', cellTemplate: $.trim($('#actionRowTmplEdit').html()), width: 15, headerCellTemplate: myHeaderCellTemplate },
            { field: '', cellTemplate: $.trim($('#actionRowTmplDel').html()), width: 15, headerCellTemplate: myHeaderCellTemplate }
        ],
        enablePaging: false,
        showFooter: false,
        enableRowSelection: false,
        enableColumnResize: true,
        showColumnMenu: false,
        showFilter: false,
        pagingOptions: $scope.pagingOptions,
        filterOptions: $scope.filterOptions
    };

    $scope.$on('ngGridEventColumns', function (e) {
        setTimeout(function () {
            $('.ngHeaderText').tooltip({ container: 'body' });
        }, 250);
    });
};