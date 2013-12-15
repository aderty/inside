'use strict';

(function() {
    /* Controllers */
    // Contrôleur principal de la gestion des utilisateurs
    this.register('ActiviteAdmin', ['$scope', '$rootScope', '$dialog', '$timeout', '$compile', '$filter', 'ngTableParams', 'ngTableFilter', 'ActiviteAdminService', ActiviteAdmin]);
    this.register('DialogShowActivite', ['$scope', '$rootScope', '$timeout', '$compile', 'dialog', 'ActiviteAdminService', DialogShowActivite]);

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

        $scope.$on('search', function(event, data) {
            if (data.searcher == "admin-activite") {
                $scope.tableParamsActivite.$params.filter = data.search;
                $scope.tableParamsSansActivite.$params.filter = data.search;
            }
        });

        $rootScope.tableParamsActivite = new ngTableParams({
            page: 1,            // show first page
            count: 10,
            sorting: {
                mois: 'asc'     // initial sorting
            }
        },
    {
        getData: function($defer, params) {
            var options = angular.copy($scope.selection);
            options.mois = $scope.lstMois.indexOf(options.mois);
            ActiviteAdminService.list(options).then(function(result) {
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
        getData: function($defer, params) {
            var options = angular.copy($scope.selection);
            options.mois = $scope.lstMois.indexOf(options.mois);
            ActiviteAdminService.listSans(options).then(function(result) {
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
        }, true);

        $scope.isEditable = function(row) {
            return true;
        };

        $scope.valider = function(row) {
            var activite = angular.copy(row);
            var btns = [{ label: 'Oui', result: 'yes', cssClass: 'btn-primary' }, { label: 'Non', result: 'no'}];
            var msgbox = $dialog.messageBox('Validation d\'un mois d\'activité', 'Etes-vous sûr de valider l\'activité de ' + activite.user.prenom + ' du mois de ' + moment(activite.mois).format('MMMM YYYY') + ' ?', btns);
            msgbox.open().then(function(result) {
                if (result === 'yes') {
                    activite.etat = 2;
                    ActiviteAdminService.updateEtat(activite).then(function(reponse) {
                        if (reponse.success) {
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
        $scope['delete'] = function(row) {
            var activite = angular.copy(row);
            var btns = [{ label: 'Oui', result: 'yes', cssClass: 'btn-primary' }, { label: 'Non', result: 'no'}];
            var msgbox = $dialog.messageBox('Suppression d\'un mois d\'activité', 'Etes-vous sûr de supprimer l\'activité de ' + activite.user.prenom + ' du mois de ' + moment(activite.mois).format('MMMM YYYY') + ' ?', btns);
            msgbox.open().then(function(result) {
                if (result === 'yes') {
                    ActiviteAdminService.remove(activite).then(function(reponse) {
                        if (reponse.success) {
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
                                $scope.events.push({ title: "Journée travaillée", allDay: false, start: date, data: { type: 'JT1', duree: 1, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0, heuresInt: 0} });
                            }
                            date = new Date(current.toDate());
                            date.setHours(12);
                            $scope.events.push({ title: $filter('motifCongesShort')(data.type), start: date, data: data, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0, heuresInt: 0 });
                            $scope.indexEvents[current.date()] = $scope.events.length - 1;
                            toDo = false;
                        }
                        else if (data.debut.type == 0 && data.end && data.fin.type == 0) {
                            data.duree = 1;
                            var date = new Date(current.toDate());
                            date.setHours(8);
                            $scope.events.push({ title: $filter('motifCongesShort')(data.type), start: date, data: data, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0, heuresInt: 0 });
                            date = new Date(current.toDate());
                            date.setHours(12);
                            if ($scope.conges.length > 0 && $scope.conges[0].fin.date.getMonth() == current.month() && $scope.conges[0].fin.date.getDate() < current.date()) {
                                $scope.events.push({ title: "Journée travaillée", allDay: false, start: date, data: { type: 'JT1', duree: 2, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0, heuresInt: 0} });
                            }
                            toDo = false;
                        }
                        else if (data.debut.type == 1 && data.end && data.fin.type == 1) {
                            data.duree = 2;
                            var date = new Date(current.toDate());
                            date.setHours(8);
                            if (lastCong.fin.date.getMonth() == current.month() && data.fin.date.getDate() < current.date()) {
                                $scope.events.push({ title: "Journée travaillée", allDay: false, start: date, data: { type: 'JT1', duree: 1, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0, heuresInt: 0} });
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
                            if (data.type == 'JF' && $scope.indexEvents[current.date()] && $scope.events[$scope.indexEvents[current.date()]]) {
                                // Si c'est un jour férié et que une période de congès contient ce jour férié
                                // -> Il faut supprimer l'event de type congès posé le jour férié
                                $scope.events.splice($scope.indexEvents[current.date()], 1);
                            }
                            data.heuresSup = 0;
                            data.heuresAstreinte = 0;
                            data.heuresNuit = 0;
                            data.heuresInt = 0;
                            $scope.events.push({ title: $filter('motifCongesShort')(data.type), start: new Date(current.toDate()), data: data });
                            $scope.indexEvents[current.date()] = $scope.events.length - 1;
                        }
                    }
                    // Si la date de fin du congès précédant n'est pas encore fini (cas d'un jour férie dans une période d'autre congés)
                    // -> On ne modifie pas le congé précédant.
                    if (!lastCong || lastCong.fin.date.getDate() <= current.date()) {
                        lastCong = angular.copy(cong);
                    }
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
                            $scope.events.push({ title: "Journée travaillée", allDay: false, start: date, data: { type: 'JT1', duree: 2, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0, heuresInt: 0} });
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
                        $scope.events.push({ title: "Journée travaillée", start: new Date(current.toDate()), data: { type: 'JT1', duree: 0, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0, heuresInt: 0} });
                    }
                    else {
                        $scope.events.push({ title: "Weekend", start: new Date(current.toDate()), data: { type: 'WK', duree: 0, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0, heuresInt: 0} });
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
            eventScope.valid = function(event) {
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
            eventScope.hasHeuresAstreinte = function(data) {
                return true;
            };
            eventScope.$watch('data.type', function(newValue, oldValue) {
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
}).call(app.controllerProvider);