﻿'use strict';

/* Controllers */
function ActiviteAdmin($scope, $rootScope, $dialog, $timeout, $compile, $filter, ngTableParams, ngTableFilter, ActiviteAdminService) {
    var currentYear = new Date().getFullYear();
    $scope.lstAnnees = [currentYear, currentYear - 1, currentYear - 2];
    $scope.lstMois = [];
    $scope.lstMois.push.apply($scope.lstMois, jQuery.fullCalendar.monthNames);
    $scope.lstMois.splice(0, 0, "Tous");
    
    $scope.selection = {
        annee: currentYear, // Année courante
        mois: $scope.lstMois[new Date().getMonth() + 1] // Mois courant
    };

    $rootScope.tableParamsActivite = new ngTableParams({
        page: 1,            // show first page
        count: 10,
        sorting: {
            mois: 'asc'     // initial sorting
        }
    },
    {
        getData: function ($defer, params) {
            var options = angular.copy($scope.selection);
            options.mois = $scope.lstMois.indexOf(options.mois);
            ActiviteAdminService.list(options).then(function (result) {
                $rootScope.activites = ngTableFilter(result, params);
                $defer.resolve($rootScope.activites);
            });
        }
    });
    $rootScope.tableParamsSansActivite = new ngTableParams({
        page: 1,            // show first page
        count: 10,
        sorting: {
            mois: 'asc'     // initial sorting
        }
    },
    {
        getData: function ($defer, params) {
            var options = angular.copy($scope.selection);
            options.mois = $scope.lstMois.indexOf(options.mois);
            ActiviteAdminService.listSans(options).then(function (result) {
                $rootScope.sansActivites = ngTableFilter(result, params);
                $defer.resolve($rootScope.sansActivites);
            });
        }
    });

    $scope.$watch('selection', function(selection) {
        var options = angular.copy(selection);
        options.mois = $scope.lstMois.indexOf(selection.mois);
        $rootScope.tableParamsActivite.reload();
        $rootScope.tableParamsSansActivite.reload();
        /*ActiviteAdminService.list(options).then(function(result) {
            $scope.eventSources = null;
            $rootScope.activites = result;
            $rootScope.tableParamsActiviteData = result;
            $rootScope.tableParamsActivite.total = result.length;
        });
        ActiviteAdminService.listSans(options).then(function(result) {
            $rootScope.sansActivites = result;
            $rootScope.tableParamsSansActiviteData = result;
            $rootScope.tableParamsSansActivite.total = result.length;
        });*/
    }, true);

    $scope.isEditable = function(row){
        return true;
    };

    $scope.valider = function (row) {
        var activite = angular.copy(row);
        var btns = [{ label: 'Oui', result: 'yes', cssClass: 'btn-primary' }, { label: 'Non', result: 'no' }];
        var msgbox = $dialog.messageBox('Validation d\'un mois d\'activité', 'Etes-vous sûr de valider l\'activité de '+ activite.user.prenom +' du mois de '+ moment(activite.mois).format('MMMM YYYY') +' ?', btns);
        msgbox.open().then(function(result){
            if (result === 'yes') {
                activite.etat = 2;
                ActiviteAdminService.updateEtat(activite).then(function (reponse) {
                    if(reponse.success){
                        row.etat = activite.etat;
                        $rootScope.infos.nbActivitesVal--;
                    }
                });
            }
        });
    };

    // Inlined template for demo 
    $scope.opts = {
        backdrop: true,
        keyboard: true,
        backdropClick: true,
        template: $.trim($("#showActiviteTmpl").html()),
        controller: 'DialogShowActivite'
    };

    $scope.visualiser = function(row) {

        $scope.currentActivite = angular.copy(row);

        //$("#activiteCalendar").fullCalendar('gotoDate', $scope.currentActivite.mois);
        ActiviteAdminService.get($scope.currentActivite).then(function(activites) {

            $rootScope.error = "";

            $scope.eventSources = null;
            $scope.activiteUser = [];
            if (activites.activite.length > 0) {
                for (var i = 0, l = activites.activite.length; i < l; i++) {
                    $scope.activiteUser.push({ title: activites.activite[i].type, start: activites.activite[i].jour.date, data: activites.activite[i] });
                }
            }
            if (!$scope.eventSources) {
                $scope.eventSources = [$scope.activiteUser];
            }
            $rootScope.currentActivite = $scope.currentActivite;
            $rootScope.eventSources = $scope.eventSources;
            var d = $dialog.dialog($scope.opts);
            d.open().then(function(result) {
                if (result) {
                }
            });


        });
    };
    $scope['delete'] = function (row) {
        var activite = angular.copy(row);
        var btns = [{ label: 'Oui', result: 'yes', cssClass: 'btn-primary' }, { label: 'Non', result: 'no' }];
        var msgbox = $dialog.messageBox('Suppression d\'un mois d\'activité', 'Etes-vous sûr de supprimer l\'activité de '+ activite.user.prenom +' du mois de '+ moment(activite.mois).format('MMMM YYYY') +' ?', btns);
        msgbox.open().then(function(result){
            if (result === 'yes') {
                ActiviteAdminService.remove(activite).then(function (reponse) {
                    if(reponse.success){
                        var index = $rootScope.activites.indexOf(row);
                        $rootScope.activites.splice(index, 1);
                        $rootScope.infos.nbActivitesVal--;
                    }
                });
            }
        });
    };

    function businessDay(momentDate) {
        return momentDate.format("d") != 0 && momentDate.format("d") != 6;
    }

    $scope.create = function(row) {

        $rootScope.currentActivite = angular.copy(row);
        $rootScope.currentActivite.mois.setHours(12);
        $scope.start = $rootScope.currentActivite.mois;
        // Correction bug "uniquement le matin"
        $scope.start.setHours(0);
        //$("#activiteCalendar").fullCalendar('gotoDate', $scope.start);
        ActiviteAdminService.get($rootScope.currentActivite).then(function(activites) {
            $scope.indexEvents = [];
            $rootScope.error = "";
            $scope.activite = activites;
            $scope.eventSources = null;
            $scope.activiteUser = [];
            $scope.events = [];

            function startEventConges(current, skip) {
                inConges = true;
                var toDo = true;
                if (businessDay(current) && !skip) {
                    var data = angular.copy(cong);
                    data.start = true;
                    if (data.fin.date.getMonth() <= current.month() && data.fin.date.getDate() <= current.date()) {
                        data.end = true;
                    }
                    if (!data.end && data.debut.type == 0) {
                        data.duree = 0;
                    }
                    else if (!data.end && data.debut.type == 1) {
                        data.duree = 2;
                        var date = new Date(current.toDate());
                        date.setHours(8);
                        if (lastCong.fin.date.getMonth() == current.month() && data.fin.date.getDate() < current.date()) {
                            $scope.events.push({ title: "Journée travaillée", allDay: false, start: date, data: { type: 'JT1', duree: 1, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0, heuresInt: 0 } });
                        }
                        date = new Date(current.toDate());
                        date.setHours(12);
                        $scope.events.push({ title: $filter('motifCongesShort')(data.type), start: date, data: data, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0, heuresInt: 0 });
                        $scope.indexEvents[current.date()] = $scope.events.length - 1;
                        toDo = false;
                    }
                    /*if (data.debut.type == 0 && !data.end) {
                    data.duree = 0;
                    }*/
                    /*if (data.debut.type == 1 && !data.end) {
                    data.duree = 2;
                    }*/
                    else if (data.debut.type == 0 && data.end && data.fin.type == 0) {
                        data.duree = 1;
                        var date = new Date(current.toDate());
                        date.setHours(8);
                        $scope.events.push({ title: $filter('motifCongesShort')(data.type), start: date, data: data, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0, heuresInt: 0 });
                        date = new Date(current.toDate());
                        date.setHours(12);
                        if ($scope.conges.length > 0 && $scope.conges[0].fin.date.getMonth() == current.month() && $scope.conges[0].fin.date.getDate() < current.date()) {
                            $scope.events.push({ title: "Journée travaillée", allDay: false, start: date, data: { type: 'JT1', duree: 2, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0, heuresInt: 0 } });
                        }
                        toDo = false;
                    }
                    else if (data.debut.type == 1 && data.end && data.fin.type == 1) {
                        data.duree = 2;
                        var date = new Date(current.toDate());
                        date.setHours(8);
                        if (lastCong.fin.date.getMonth() == current.month() && data.fin.date.getDate() < current.date()) {
                            $scope.events.push({ title: "Journée travaillée", allDay: false, start: date, data: { type: 'JT1', duree: 1, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0, heuresInt: 0 } });
                        }
                        date = new Date(current.toDate());
                        date.setHours(12);
                        $scope.events.push({ title: $filter('motifCongesShort')(data.type), start: date, data: data, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0, heuresInt: 0 });
                        $scope.indexEvents[current.date()] = $scope.events.length - 1;
                        toDo = false;
                    }
                    else if (data.debut.type == 0 && data.end && data.fin.type == 1) {
                        data.duree = 0;
                    }
                    if (toDo) {
                        data.heuresSup = 0;
                        data.heuresAstreinte = 0;
                        data.heuresNuit = 0;
                        data.heuresInt = 0;
                        $scope.events.push({ title: $filter('motifCongesShort')(data.type), start: new Date(current.toDate()), data: data });
                        $scope.indexEvents[current.date()] = $scope.events.length - 1;
                    }
                }
                lastCong = angular.copy(cong);
                cong = $scope.conges.shift();
            }
            function inEventConges(current) {
                var data = angular.copy(lastCong);
                var toDo = true;
                if (data.fin.date.getMonth() <= current.month() && data.fin.date.getDate() <= current.date()) {
                    data.end = true;
                }
                if (!data.end) {
                    data.duree = 0;
                }
                if (data.end && data.fin.type == 0) {
                    data.duree = 1;
                    var date = new Date(current.toDate());
                    date.setHours(8);
                    data.heuresSup = 0;
                    data.heuresAstreinte = 0;
                    data.heuresNuit = 0;
                    data.heuresInt = 0;
                    $scope.events.push({ title: $filter('motifCongesShort')(data.type), start: date, data: data });
                    $scope.indexEvents[current.date()] = $scope.events.length - 1;
                    date = new Date(current.toDate());
                    date.setHours(12);
                    if (cong && cong.fin.date.getMonth() == current.month() && cong.fin.date.getDate() < current.date()) {
                        $scope.events.push({ title: "Journée travaillée", allDay: false, start: date, data: { type: 'JT1', duree: 2, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0, heuresInt: 0 } });
                    }
                    toDo = false;
                }
                if (data.end && data.fin.type == 1) {
                    data.duree = 0;
                }
                if (toDo) {
                    data.duree = 0;
                    data.heuresSup = 0;
                    data.heuresAstreinte = 0;
                    data.heuresNuit = 0;
                    data.heuresInt = 0;
                    $scope.events.push({ title: $filter('motifCongesShort')(data.type), start: new Date(current.toDate()), data: data });
                    $scope.indexEvents[current.date()] = $scope.events.length - 1;
                }
            }
            function endEventConges(current) {
                inConges = false;
            }
            function workEvent(current) {
                if (businessDay(current)) {
                    $scope.events.push({ title: "Journée travaillée", start: new Date(current.toDate()), data: { type: 'JT1', duree: 0, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0, heuresInt: 0 } });
                }
                else {
                    $scope.events.push({ title: "Weekend", start: new Date(current.toDate()), data: { type: 'WK', duree: 0, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0, heuresInt: 0 } });
                }
                $scope.indexEvents[current.date()] = $scope.events.length - 1;
            }
            if ($scope.activite.etat > 0 && $scope.activite.activite.length > 0) {
                for (var i = 0, l = $scope.activite.activite.length; i < l; i++) {
                    $scope.events.push({ title: $scope.activite.activite[i].type, start: $scope.activite.activite[i].jour.date, data: $scope.activite.activite[i] });
                    $scope.indexEvents[$scope.activite.activite[i].jour.date] = $scope.events.length - 1;
                }
            }
            else {
                $scope.conges = $scope.activite.activite;
                var cong = $scope.conges.shift();
                var lastCong;
                var first = true;
                var inConges = false;
                var current = new moment($scope.start);

                // Si le calendrier commence avant le 1er -> on avance jusqu'au 1er en ajoutant les congés si présents
                if (current.date() != 1) {
                    while (current.date() != 1) {
                        /*if (inConges && businessDay(current)) {
                        inEventConges(current, true);
                        }*/
                        if (cong && cong.debut.date.getMonth() == current.month() && cong.debut.date.getDate() == current.date()) {
                            startEventConges(current, true);
                        }
                        if (inConges && lastCong && lastCong.fin.date <= current.toDate()) {
                            endEventConges(current);
                        }
                        current = current.add('days', 1);
                    }
                }
                // Traitement du 1er du mois à la fin du mois.
                while (current.date() != 1 || first) {
                    first = false; // On signale qu'on a démarré
                    if (inConges && businessDay(current)) {
                        // Dans une période de congés.
                        inEventConges(current);
                    }
                    if (cong && cong.debut.date.getMonth() == current.month() && cong.debut.date.getDate() == current.date()) {
                        // Au début d'une période de congés.
                        startEventConges(current);
                    }
                    if (inConges && lastCong && lastCong.fin.date.getMonth() <= current.month() && lastCong.fin.date.getDate() <= current.date()) {
                        // A la fin d'une période de congés.
                        endEventConges(current);
                    }
                    //if (!inConges && businessDay(current) && typeof $scope.indexEvents[current.date()] == "undefined") {
                    if (typeof $scope.indexEvents[current.date()] == "undefined") {
                        // Journée travaillée.
                        workEvent(current);
                    }
                    current = current.add('days', 1); // On incrément la date courante dans le mois.
                }
            }

            if (!$scope.eventSources) {
                $scope.eventSources = [$scope.events];
            }
            //$rootScope.currentActivite = $scope.currentActivite;
            $rootScope.eventSources = $scope.eventSources;
            var d = $dialog.dialog($scope.opts);
            d.open().then(function(activite) {
                if (activite) {
                    var index = $rootScope.activites.indexOf(row);
                    $rootScope.sansActivites.splice(index, 1);
                    $rootScope.infos.nbActivitesVal++;

                    $rootScope.activites.push(activite);
                }
            });

        });
    };
}

function ActiviteAdminGrid($scope, $rootScope, $filter, ngTableParams, ActiviteAdminService) {
    $scope.filterOptions = {
        filterText: "",
        useExternalFilter: false
    };

    var dataActivite, dataSansActivite;

    $scope.$on('search', function (event, data) {
        if (data.searcher == "admin-activite") {
            $scope.filterOptions = {
                filterText: data.search,
                useExternalFilter: false
            };
        }
    });
    /*$rootScope.tableParamsActivite = new ngTableParams({
        page: 1,            // show first page
        total: 0, // length of data
        count: 10,
        sorting: {
            mois: 'asc'     // initial sorting
        }
    },
    {
        getData: function ($defer, params) {
            ActiviteAdminService.list(options).then(function (result) {
                $rootScope.activites = result;
                $defer.resolve($rootScope.activites);
            });
        }
    });
    $rootScope.tableParamsSansActivite = new ngTableParams({
        page: 1,            // show first page
        total: 0, // length of data
        count: 10,
        sorting: {
            mois: 'asc'     // initial sorting
        }
    },
    {
        getData: function ($defer, params) {
            ActiviteAdminService.listSans(options).then(function (result) {
                $rootScope.sansActivites = result;
                $defer.resolve($rootScope.sansActivites);
            });
        }
    });*/
    $scope.$watch('tableParamsActivite', function(params) {
        // use build-in angular filter
        $rootScope.tableParamsActivite = params;
    }, true);
    $scope.$watch('tableParamsSansActivite', function(params) {
        // use build-in angular filter
        $rootScope.tableParamsSansActivite = params;
    }, true);
    /*$rootScope.$watch('tableParamsActivite', function(params) {
        // use build-in angular filter
        var orderedData = params.sorting ?
                                $filter('orderBy')($rootScope.tableParamsActiviteData, params.orderBy()) :
                                $rootScope.tableParamsActiviteData;
        orderedData = orderedData || [];
        orderedData = params.filter ?
                                $filter('filter')(orderedData, params.filter) :
                                orderedData;

        params.total = orderedData.length; // set total for recalc pagination
        $rootScope.activites = orderedData.slice((params.page - 1) * params.count, params.page * params.count);
    }, true);
    $rootScope.$watch('tableParamsSansActivite', function(params) {
        // use build-in angular filter
        var orderedData = params.sorting ?
                                $filter('orderBy')($rootScope.tableParamsSansActiviteData, params.orderBy()) :
                                $rootScope.tableParamsSansActiviteData;
        orderedData = orderedData || [];
        orderedData = params.filter ?
                                $filter('filter')(orderedData, params.filter) :
                                orderedData;

        params.total = orderedData.length; // set total for recalc pagination
        $rootScope.sansActivites = orderedData.slice((params.page - 1) * params.count, params.page * params.count);
    }, true);*/
    

    $scope.pagingOptions = {
        pageSizes: [25, 50, 100],
        pageSize: 50,
        totalServerItems: 0,
        currentPage: 1
    };
    

    var myHeaderCellTemplate = $.trim($('#headerTmpl').html());
    var matriculeCellTemplate = $.trim($('#matriculeTmpl').html());
    var validationCellTemplate = $.trim($('#validationTmpl').html());
    var moisCellTemplate = $.trim($('#moisTmpl').html());
    var actionEdit = $.trim($('#actionRowTmplEdit').html());
    var actionCreate = $.trim($('#actionRowTmplCreate').html());
    var actionDelete = $.trim($('#actionRowTmplDel').html());

    $scope.gridOptions = {
        data: 'activites',
        columnDefs: [
            { field: '', displayName: '', width: 22, cellTemplate: '<span class="etatConges {{cssConges[row.etat]}}">&nbsp;</span>', resizable: false },
            { field: 'mois', displayName: 'Mois', width: 70, cellTemplate: moisCellTemplate, resizable: false },
            { field: 'user', displayName: 'Utilisateur', cellTemplate: matriculeCellTemplate, resizable: false },
            { field: 'JT1', displayName: 'En mission', width: 100, headerCellTemplate: myHeaderCellTemplate, cssClass: "travail" },
            { field: 'FOR', displayName: 'Formation', width: 100, headerCellTemplate: myHeaderCellTemplate, cssClass: "travail" },
            { field: 'INT', displayName: 'Inter contrat', width: 100, headerCellTemplate: myHeaderCellTemplate, cssClass: "travail" },
            { field: 'CP', displayName: 'CP', width: 100, headerCellTemplate: myHeaderCellTemplate, cssClass: "conges" },
            { field: 'CP_ANT', displayName: 'CP anticipés', width: 100, headerCellTemplate: myHeaderCellTemplate, cssClass: "conges" },
            { field: 'RTT', displayName: 'RTT', width: 100, headerCellTemplate: myHeaderCellTemplate, cssClass: "conges" },
            //{ field: 'RCE', displayName: 'RC employeur', width: 100, headerCellTemplate: myHeaderCellTemplate, cssClass: "conges" },
            { field: 'AE', displayName: 'Autre', width: 100, headerCellTemplate: myHeaderCellTemplate, cssClass: "conges" },
            { field: 'heuresSup', displayName: 'Heures suplémentaires', width: 100, headerCellTemplate: myHeaderCellTemplate, cssClass: "heures" },
            { field: 'heuresAstreinte', displayName: 'Astreintes', width: 100, headerCellTemplate: myHeaderCellTemplate, cssClass: "heures" },
            { field: 'heuresNuit', displayName: 'Heures de nuit', width: 100, headerCellTemplate: myHeaderCellTemplate, cssClass: "heures" },
            { field: '', cellTemplate: validationCellTemplate, width: 15, headerCellTemplate: myHeaderCellTemplate },
            { field: '', cellTemplate: actionEdit, width: 15, headerCellTemplate: myHeaderCellTemplate },
            { field: '', cellTemplate: actionDelete, width: 15, headerCellTemplate: myHeaderCellTemplate }
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

    $scope.gridOptionsSans = {
        data: 'sansActivites',
        columnDefs: [
            { field: '', displayName: '', width: 22, cellTemplate: '<span class="etatConges refConges">&nbsp;</span>', resizable: false },
            { field: 'mois', displayName: 'Mois', width: 70, cellTemplate: moisCellTemplate, resizable: false },
            { field: 'id', displayName: 'Matricule', width: 100, resizable: false },
            { field: 'nom', displayName: 'Nom', headerCellTemplate: myHeaderCellTemplate },
            { field: 'prenom', displayName: 'Prénom', headerCellTemplate: myHeaderCellTemplate },
            { field: '', cellTemplate: actionCreate, width: 15, headerCellTemplate: myHeaderCellTemplate }
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

    setTimeout(function() {
        $('.motif-autre').tooltip({ html: true, container: 'body' });
    }, 250);
}

// Contrôleur de la popup de modification de password
function DialogShowActivite($scope, $rootScope, $timeout, $compile, dialog, ActiviteAdminService) {
    $rootScope.error = "";
    $scope.user = $scope.$parent.currentActivite.user;
    $scope.eventSources = $scope.$parent.eventSources;
    $scope.uiConfig = $scope.$parent.uiConfig;
    
    $scope.close = function() {
        $rootScope.error = "";
        dialog.close();
    };

    var currentYear = new Date().getFullYear();
    $scope.activiteUser = [];

    /*$rootScope.typeActivite = angular.copy($rootScope.motifsConges);
    $rootScope.typeActivite.splice(0, 0, { id: 'JT1', libelle: 'En mission' });
    $rootScope.typeActivite.splice(0, 0, { id: 'FOR', libelle: 'Formation' });
    $rootScope.typeActivite.splice(0, 0, { id: 'INT', libelle: 'Intercontrat' });
    $rootScope.typeActivite.push({ id: 'WK', libelle: 'Weekend' });
    $rootScope.typeActivite.push({ id: 'JF', libelle: 'Journée fériée' });*/

    /* alert on eventClick */
    $scope.alertEventOnClick = function(date, allDay, jsEvent, view) {
        $scope.$apply(function() {
            $scope.eventSelectionne = new moment(date).format('dddd D MMMM YYYY');
        });
    };
    $scope.eventOnClick = function(calEvent, jsEvent, view) {
        $scope.$apply(function() {
            $scope.currentEvent = calEvent.data;
            $scope.eventSelectionne = new moment(calEvent.start).format('dddd D MMMM YYYY');
        });
    };

    $scope.eventRender = function(event, element) {

        function indexOfEvent(start) {
            var index = 0, l = $scope.eventSources[0].length;
            for (; index < l; index++) {
                if ($scope.eventSources[0][index].start == start) return index;
            }
            return -1;
        }
        var eventScope = $scope.$new(true);
        angular.extend(eventScope, event);
        eventScope.typeActivite = $rootScope.typeActivite;
        eventScope.typeActiviteJour = $rootScope.typeActivite;
        eventScope.valid = function (event) {
            eventScope.error = null;
            $('[rel=popover]').popover('hide');
            var lastDuree = eventScope.savedEvent.duree;
            if (this.data.duree == lastDuree) return;
            if (this.data.duree == 1) {
                var date = new Date(this.start);
                date.setHours(16);
                this.start.setHours(8);
                this.allDay = false;
                $scope.isUpdating = true;
                var index = indexOfEvent(this.start);
                $scope.eventSources[0].splice(index + 1, 0, { title: 'Ap. midi', start: date, allDay: false, data: { type: this.data.type, jour: date, duree: 2} });
                $scope.activiteCalendar.fullCalendar('refetchEvents');
            }
            else if (this.data.duree == 2) {
                var date = new Date(this.start);
                date.setHours(8);
                this.start.setHours(16);
                this.allDay = false;
                $scope.isUpdating = true;
                var index = indexOfEvent(this.start);
                $scope.eventSources[0].splice(index, 0, { title: 'Matin', start: date, allDay: false, data: { type: this.data.type, jour: date, duree: 1} });
                $scope.activiteCalendar.fullCalendar('refetchEvents');
            }
            else if (this.data.duree == 0 && lastDuree == 1) {
                this.allDay = true;
                $scope.isUpdating = true;
                var index = indexOfEvent(this.start);
                this.start.setHours(0);
                $scope.eventSources[0].splice(index + 1, 1);
                $scope.activiteCalendar.fullCalendar('refetchEvents');
            }
            else if (this.data.duree == 0 && lastDuree == 2) {
                this.allDay = true;
                $scope.isUpdating = true;
                var index = indexOfEvent(this.start);
                this.start.setHours(0);
                $scope.eventSources[0].splice(index - 1, 1);
                $scope.activiteCalendar.fullCalendar('refetchEvents');
            }
        }
        eventScope.cancel = function(event) {
            eventScope.error = null;
            $.extend(eventScope.data, eventScope.savedEvent);
            $('[rel=popover]').popover('hide');
        }
        eventScope.infos = function(data) {
            if (data.duree == 2) {
                return "Ap. midi";
            }
            if (data.duree == 1) {
                return "Matin";
            }
        }
        eventScope.hasHeuresAstreinte = function (data) {
            return true;
        };
        eventScope.$watch('data.type', function (newValue, oldValue) {
            if (oldValue && newValue == 'JT1' && (oldValue == 'WK' || oldValue == 'JF')) {
                eventScope.data.heuresAstreinte = 7.5;
            }
        });
        return $compile($.trim($('#eventTmpl').html()))(eventScope)
        /*element.addClass("jour")*/.attr("rel", "popover").popover({
            html: true,
            content: function(e) {
                // Jour férié, pas d'édition.
                /*if (eventScope.data.type == 'JF') {
                return false;
                }*/
                eventScope.savedEvent = angular.copy(eventScope.data);
                return $compile($.trim($('#popoverEventTmpl').html()))(eventScope);
            }
        }).click(function(e) {
            var elm = $(this);
            $(".popover.in").prev().each(function(i) {
                var $this = $(this);
                if (!$this.is(elm)) {
                    $this.scope().cancel();
                    $this.popover('hide');
                }
            });
        });
    };

    $scope.uiConfig = {
        calendar: angular.extend({
            editable: false,
            header: {
                left: '',
                center: '',
                right: 'title'
            },
            firstDay: 1,
            dayClick: $scope.alertEventOnClick,
            eventClick: $scope.eventOnClick,
            eventRender: $scope.eventRender,
            eventAfterAllRender: function() {
                $timeout(function() {
                    // Permet la re-génération d'angularjs
                    $("#activiteCalendar").fullCalendar('gotoDate', moment($rootScope.currentActivite.mois).add('days', 15).toDate());
                    $("#activiteCalendar").find(".fc-content").css('overflow', 'visible');
                });
            }
        }, jQuery.fullCalendar)
    };

    $scope.save = function(events) {
        var activite = angular.copy($scope.$parent.currentActivite);
        if (activite.etat > 1) return;
        var creation = (!activite.etat || activite.etat == -1) ? true : false;
        activite.activite = $.map(events, function(item, index) {
            return {
                jour: item.start,
                type: item.data.type,
                information: item.data.information,
                heuresSup: item.data.heuresSup,
                heuresAstreinte: item.data.heuresAstreinte,
                heuresNuit: item.data.heuresNuit,
                heuresInt: item.data.heuresInt,
                duree: item.data.duree
            };
        });

        // On ré-init les compteurs;
        var typeActivitePerso = [];
        function eventActivite(type, nb) {
            if (typeof nb == "undefined") {
                nb = 1;
            }
            var toDo = true;
            for (var i = 0, l = typeActivitePerso.length; i < l; i++) {
                if (typeActivitePerso[i].type == type) {
                    toDo = false;
                    typeActivitePerso[i].nb += nb;
                }
            }
            if (toDo) {
                typeActivitePerso.push({ type: type, nb: nb });
            }
        }
        
        ActiviteAdminService.save(activite, creation).then(function(reponse) {
            if (reponse.success === true) {
                $scope.successOperation = "Activité enregistrée";
                $rootScope.error = "";
                activite.etat = 1;
                activite.user = $scope.$parent.currentActivite.user;

                var event, hSup = 0, hAst = 0, hNuit = 0, hInt = 0;
                
                for (var i = 0, l = activite.activite.length; i < l; i++) {
                    event = activite.activite[i];
                    // Pas de compteur pas les weekend
                    if (event.type != 'WK') {
                        eventActivite(event.type, event.duree == 0 ? 1 : 0.5);
                        hSup += event.heuresSup;
                        hAst += event.heuresAstreinte;
                        hNuit += event.heuresNuit;
                        hInt += event.heuresInt;
                    }
                }
                
                
                delete activite.activite;
                for (var i = 0, l = typeActivitePerso.length; i < l; i++) {
                    event = typeActivitePerso[i];
                    activite[event.type] = event.nb;
                }
                activite.heuresSup = hSup;
                activite.heuresAstreinte = hAst;
                activite.heuresNuit = hNuit;
                activite.heuresInt = hInt;
                dialog.close(activite);
            }
        });
    };
    
}