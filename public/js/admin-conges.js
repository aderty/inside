'use strict';

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
    
    $scope.$watch('currentConges.debut.date', function(newValue){
        $scope.dateOptionsFin.minDate = newValue;
    });
    
    /*setTimeout(function () {
        $(".tabbable").each(function () {
            $(this).scope().select = (function (select) {
                return function (e) {
                    select.apply(this, arguments);
                    if (e.heading == "Congés en attente de validation") {
                        $timeout(layoutPlugin1.updateGridLayout, 0);
                    }
                    else if (e.heading == "Congés validés") {
                        $timeout(layoutPlugin2.updateGridLayout, 0);
                    }
                    else {
                        $timeout(layoutPlugin3.updateGridLayout, 0);
                    }
                };
            })($(this).scope().select)
        });
        updateLayout();
    }, 250);*/

    $scope.accepter = function (row) {
        $scope.currentConges = row;
        if ($scope.currentConges.etat == 2 || $scope.currentConges.etat == 3) return;
        var conges = angular.copy($scope.currentConges);
        conges.etat = 2;
        var msg = 'Etes-vous sûr de vouloir valider la demande de congés ?';
        var btns = [{ label: 'Oui', result: 'yes' , cssClass: 'btn-primary'}, { label: 'Non', result: 'no' }];
        var msgbox = $dialog.messageBox('Validation d\'un congé', msg, btns);
        msgbox.open().then(function (result) {
            if (result === 'yes') {
                CongesAdminService.updateEtat(conges, false).then(function (reponse) {
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

    $scope.refuser = function (row) {
        $scope.currentConges = row;
        if ($scope.currentConges.etat == 3) return;
        var conges = angular.copy($scope.currentConges);
        conges.etat = 3;
        $rootScope.dialogModel = conges;
        //var btns = [{ label: 'Oui', result: 'yes', cssClass: 'btn-primary' }, { label: 'Non', result: 'no' }];
        //var msgbox = $dialog.messageBox('Refus d\'un congé', 'Etes-vous sûr de vouloir refuser la demande de congés ?', btns);
        var msgbox = $dialog.dialog($scope.opts);
        msgbox.open().then(function (result) {
            if (result === 'yes') {
                CongesAdminService.updateEtat(conges, false).then(function (reponse) {
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

    $scope.create = function () {
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
        $scope.lblMode = "Modification d'un congé";
        $scope.dateOptionsFin.minDate = $scope.currentConges.debut.date;
    }

    $scope['delete'] = function (row) {
        var btns = [{ label: 'Oui', result: 'yes', cssClass: 'btn-primary' }, { label: 'Non', result: 'no' }];
        var msgbox = $dialog.messageBox('Suppression d\'un congé', 'Etes-vous sûr de supprimer la demande de congés ?', btns);
        msgbox.open().then(function (result) {
            if (result === 'yes') {
                CongesAdminService.remove(row).then(function (reponse) {
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

    $scope.isEditable = function (currentConges) {
        return currentConges.etat != 3;
    };

    $scope.isUnchanged = function (currentConges) {
        $scope.haschanged = angular.equals(currentConges, $scope.currentCongesSaved);
        return
    };


    $scope.save = function (currentConges) {
        var conges = angular.copy(currentConges);
        CongesAdminService.save(conges, $scope.edition == 1).then(function (reponse) {
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
        query: function(options){
            var type = isNaN(options.term) ? "text" : "id";
            $rootScope.$apply(function () {
                UsersService.search({ type: type, search: options.term }).then(function (result) {
                    options.callback({
                        more: false,
                        results: result
                    });
                });
            });
        },
        data: [{id:2, nom: "tous", prenom: ""}],
        initSelection: function(e,d,f){
        },
        formatResult: format, // omitted for brevity, see the source of this page
        formatSelection: format, // omitted for brevity, see the source of this page
        dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
        escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
    };

    function format(user) {
        return user.nom.toLowerCase()+ " " + user.prenom;
    }

    $scope.showAide = function () {
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
    $scope.close = function (param) {
        dialog.close(param);
    };
}

// Contrôleur de la popup de modification de password
function DialogAideConges($scope, dialog) {
    $scope.close = function () {
        dialog.close();
    };
}

// Contrôleur de la grille des congés
function CongesAdminGrid($scope, $rootScope, $timeout, $filter, ngTableParams, ngTableFilter, CongesAdminService) {

    $scope.filterOptions = {
        filterText: "",
        useExternalFilter: false
    };

    $scope.$on('search', function (event, data) {
        if (data.searcher == "admin-conges") {
            $scope.gridOptionsConges.filterOptions.filterText = data.search;
            $scope.gridOptionsCongesVal.filterOptions.filterText = data.search;
            $scope.gridOptionsCongesRef.filterOptions.filterText = data.search;
        }
    });

    $scope.pagingOptions = {
        pageSizes: [25, 50, 100],
        pageSize: 50,
        totalServerItems: 0,
        currentPage: 1
    };

    /*CongesAdminService.list({etat: 1}).then(function (conges) {
        //$rootScope.congesAvalider = conges;
        //dataConges = conges;
        $scope.tableParamsCongesAValiderData = conges;
        filter.call(scope, $scope.tableParamsCongesAValiderData, $scope.tableParamsCongesAValider, 'congesAvalider');
    });

    CongesAdminService.list({ etat: 2 }).then(function (conges) {
        //$rootScope.congesValider = conges;
        //dataValider = conges;
        $scope.tableParamsValiderData = conges;
    });

    CongesAdminService.list({etat: 3}).then(function (conges) {
        //$rootScope.congesRefuser = conges;
        //dataRefuser = conges;
        $scope.tableParamsRefuserData = conges;
    });  */

    $scope.etatOptions = {
        type: 1
    };
    var scope = $scope;
    /*scope.$watch('tableParamsCongesAValiderData', function(donnees) {
        filter.call(scope, donnees, $scope.tableParamsCongesAValider, 'congesAvalider');
    }, true);*/
    
    /*scope.$watch('tableParamsCongesAValider', function(args) {
        filter.call(scope, $scope.tableParamsCongesAValiderData, args, 'congesAvalider');
    }, true);*/
   
    
    $rootScope.tableParamsCongesAValider = new ngTableParams({
        page: 1,            // show first page
        //total: 0, // length of data
        count: 10/*,
        sorting: {
            debut: 'asc'     // initial sorting
        }*/
    },
    {
        getData: function ($defer, params) {
            CongesAdminService.list({ etat: 1 }).then(function (conges) {
                /*$rootScope.congesAvalider = conges;
                dataConges = conges;*/
                $rootScope.congesAvalider = ngTableFilter(conges, params);
                $defer.resolve($rootScope.congesAvalider);
            });
        }
    });
    $rootScope.tableParamsValider = new ngTableParams({
        page: 1,            // show first page
        //total: 0, // length of data
        count: 10/*,
        sorting: {
            debut: 'asc'     // initial sorting
        }*/
    },
    {
        getData: function ($defer, params) {
            CongesAdminService.list({ etat: 2 }).then(function (conges) {
                /*$rootScope.congesAvalider = conges;
                dataConges = conges;*/
                $rootScope.congesValider = ngTableFilter(conges, params);
                $defer.resolve($rootScope.congesValider);
            });
        }
    });
    $rootScope.tableParamsRefuser = new ngTableParams({
        page: 1,            // show first page
        //total: 0, // length of data
        count: 10/*,
        sorting: {
            debut: 'asc'     // initial sorting
        }*/
    },
    {
        getData: function ($defer, params) {
            CongesAdminService.list({ etat: 3 }).then(function (conges) {
                /*$rootScope.congesAvalider = conges;
                dataConges = conges;*/
                $rootScope.congesRefuser = ngTableFilter(conges, params);
                $defer.resolve($rootScope.congesRefuser);
            });
        }
    });

    /*$scope.$watch('congesAvalider', function(conges) {
        $rootScope.congesAvalider = conges;
    }, true);

    $scope.$watch('congesValider', function(conges) {
        $rootScope.congesValider = conges;
    }, true);

    $scope.$watch('congesRefuser', function(conges) {
        $rootScope.congesRefuser = conges;
    }, true);

    $scope.$watch('tableParamsCongesAValider', function(params) {
        // use build-in angular filter
        $rootScope.tableParamsCongesAValider = params;
    }, true);
    $scope.$watch('tableParamsValider', function(params) {
        // use build-in angular filter
        $rootScope.tableParamsValider = params;
    }, true);
    $scope.$watch('tableParamsRefuser', function(params) {
        // use build-in angular filter
        $rootScope.tableParamsRefuser = params;
    }, true);*/

    //ngTableFilter.call($scope, 'tableParamsCongesAValiderData', 'tableParamsCongesAValider', 'congesAvalider');
    //ngTableFilter.call($scope, 'tableParamsValiderData', 'tableParamsValider', 'congesValider');
    //ngTableFilter.call($scope, 'tableParamsRefuserData', 'tableParamsRefuser', 'congesRefuser');

    var myHeaderCellTemplate = $.trim($('#headerTmpl').html());
    var matriculeCellTemplate = $.trim($('#matriculeTmpl').html());
    var justificationCellTemplate = $.trim($('#justificationTmpl').html());
    var validationCellTemplate = $.trim($('#validationTmpl').html());

    /*var defauts = {
        columnDefs: [
            { field: 'user', displayName: 'Utilisateur', width: 85, cellTemplate: matriculeCellTemplate, resizable: false },
            { field: 'debut', displayName: 'Date de début', width: 130, cellFilter: "momentCongesDebut:'DD/MM/YYYY'", headerCellTemplate: myHeaderCellTemplate, resizable: false, sort: 'debut.date' },
            { field: 'fin', displayName: 'Date de fin', width: 130, cellFilter: "momentCongesFin:'DD/MM/YYYY'", headerCellTemplate: myHeaderCellTemplate, resizable: false, sort: 'fin.date' },
            { field: 'duree', displayName: 'Duree', width: 60, headerCellTemplate: myHeaderCellTemplate, resizable: false },
            { field: 'motif', displayName: 'Modif', width: 60, cellFilter: "motifCongesShort", headerCellTemplate: myHeaderCellTemplate, resizable: false },
            { field: 'justification', displayName: 'Justification', headerCellTemplate: myHeaderCellTemplate, cellTemplate: justificationCellTemplate, resizable: false },
            { field: '', displayName: 'Validation', width: 85, headerCellTemplate: myHeaderCellTemplate, cellTemplate: validationCellTemplate, resizable: false },
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
    $scope.gridOptionsConges = angular.extend({
        data: "congesAvalider"
    }, defauts);
    $scope.gridOptionsCongesVal = angular.extend({
        data: "congesValider"
    }, defauts);
    $scope.gridOptionsCongesRef = angular.extend({
        data: "congesRefuser"
    }, defauts);*/
    
    
    $scope.$on('ngGridEventColumns', function (e) {
        setTimeout(function () {
            $('.matriculeCell>span').tooltip({ container: 'body' });
        }, 250);
    });

    function filter(data, params, out) {
        // use build-in angular filter
        var orderedData = params.sorting ?
                                    $filter('orderBy')(data, params.orderBy()) :
                                    data;
        orderedData = orderedData || [];
        orderedData = params.filter ?
                                    $filter('filter')(orderedData, params.filter) :
                                    orderedData;
        if (params.filterText && params.filterText != "") {
            var result = [], found = false;

            angular.forEach(orderedData, function(datarow) {
                found = false;
                angular.forEach(datarow, function(col) {
                    if (found) return;
                    if (typeof col == "string" && col.toLowerCase().indexOf(params.filterText.toLowerCase()) > -1) {
                        found = true;
                        result.push(datarow);
                        return;
                    }
                    if (typeof col == "number" && col.toString().indexOf(params.filterText.toLowerCase()) > -1) {
                        found = true;
                        result.push(datarow);
                        return;
                    }
                });
            });
            orderedData = result;
        }

        params.total = orderedData.length; // set total for recalc pagination
        this[out] = orderedData.slice((params.page - 1) * params.count, params.page * params.count);
    }
};
