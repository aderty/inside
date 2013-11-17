﻿'use strict';
var isDirty = false;
window.onbeforeunload = function (e) {
    if (isDirty) {
        return "Si vous ne cliquez pas sur le bouton 'Sauvegarder', toutes les modifications effectuées seront perdues.";
    }
}
/* Controllers */
function ActiviteMain($scope, $rootScope, UsersService, ActiviteService, $timeout, $filter, $compile) {

    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    function businessDay(momentDate) {
        return momentDate.format("d") != 0 && momentDate.format("d") != 6;
    }

    $scope.user = UsersService.get({ id: 0 }, function (retour) {
    });
    $scope.isDirty = false;
    $scope.eventSelectionne = null;
    $scope.events = [];
    $scope.successOperation = "";

    $scope.typeActivitePerso = [];

    $scope.refresh = function () {
        $scope.isDirty = false;
        $scope.activiteCalendar.fullCalendar('refetchEvents');
    };
    var lastTimer;
    $scope.$watch('events', function(valeur) {
        if (lastTimer) clearTimeout(lastTimer);
        lastTimer = setTimeout(function() {
            $scope.$apply(function() {
                var event, hSup = 0, hAst = 0, hNuit = 0, hInt = 0, joursOuvres = 0, joursTotal = 0;
                // On ré-init les compteurs;
                $scope.typeActivitePerso = angular.copy($rootScope.typeActivite);
                for (var i = 0, l = $scope.typeActivitePerso.length; i < l; i++) {
                    $scope.typeActivitePerso[i].libelle = $filter('motifCongesShort')($scope.typeActivitePerso[i].id, $rootScope.typeActivite);
                    $scope.typeActivitePerso[i].nb = 0;
                }
                for (var i = 0, l = valeur.length; i < l; i++) {
                    event = valeur[i];
                    // Pas de compteur pas les weekend
                    if (event.data.type != 'WK' && event.data.type != 'JF') {
                        eventActivite(event.data.type, event.data.duree == 0 ? 1 : 0.5);
                        hSup += event.data.heuresSup || 0;
                        hAst += event.data.heuresAstreinte || 0;
                        hNuit += event.data.heuresNuit || 0;
                        hInt += event.data.heuresInt || 0;
                        joursTotal++;
                        if(businessDay(moment(event.start))){
                            joursOuvres++;
                        }
                    }
                }
                $scope.heuresSup = hSup;
                $scope.heuresAstreinte = hAst;
                $scope.heuresNuit = hNuit;
                $scope.heuresInt = hInt;
                $scope.joursOuvres = joursOuvres;
                $scope.joursTotal = joursTotal;
            });
        }, 100);
    }, true);
    function eventActivite(type, nb) {
        if (typeof nb == "undefined") {
            nb = 1;
        }
        var toDo = true;
        for (var i = 0, l = $scope.typeActivitePerso.length; i < l; i++) {
            if ($scope.typeActivitePerso[i].id == type) {
                if (!$scope.typeActivitePerso[i].libelle) {
                    //$scope.typeActivitePerso[i].libelle = $filter('motifCongesShort')(type, $rootScope.typeActivite);
                    //$scope.typeActivitePerso.push({ id: type, libelle: $filter('motifCongesShort')(type, $rootScope.typeActivite), nb: nb });
                }
                toDo = false;
                $scope.typeActivitePerso[i].nb += nb;
            }
        }
        
    }

    $scope.load = function(callback) {
        $scope.eventSelectionne = null;

        ActiviteService.list({
            start: $scope.start,
            end: $scope.end
        }).then(function(activite) {
            $scope.activite = activite;
            $scope.indexEvents = [];
            $scope.events = [];
            $scope.successOperation = "";

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
                        $scope.events.push({ title: $filter('motifCongesShort')(data.type), start: date, data: data, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0 , heuresInt: 0});
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
                        data.heuresInt =  0;
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
                        $scope.events.push({ title: "Journée travaillée", allDay: false, start: date, data: { type: 'JT1', duree: 2, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0, heuresInt: 0} });
                    }
                    toDo = false;
                }
                if (data.end && data.fin.type == 1) {
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
            if (callback) {
                callback($scope.events);
            }
        });
    };

    /* event source that contains custom events on the scope */
    $scope.eventsA = [];
      /*{ title: 'All Day Event', start: new Date(y, m, 1) },
      { title: 'Long Event', start: new Date(y, m, d - 5), end: new Date(y, m, d - 2) },
      { id: 999, title: 'Repeating Event', start: new Date(y, m, d - 3, 16, 0), allDay: false },
      { id: 999, title: 'Repeating Event', start: new Date(y, m, d + 4, 16, 0), allDay: false },
      { title: 'Birthday Party', start: new Date(y, m, d + 1, 19, 0), end: new Date(y, m, d + 1, 22, 30), allDay: false },
      { title: 'Click for Google', start: new Date(y, m, 28), end: new Date(y, m, 29) }
    ];*/
    /* event source that calls a function on every view switch */
    $scope.eventsF = function (start, end, callback) {
        var s = new Date(start).getTime() / 1000;
        var e = new Date(end).getTime() / 1000;
        var m = new Date(start).getMonth();

        $scope.start = start;
        $scope.end = end;
        if ($scope.isUpdating) {
            $scope.isUpdating = false;
            callback($scope.events);
        }
        else {
            $timeout(function () {
                $scope.load(callback);
                //var events = [{ title: 'Feed Me ' + m, start: s + (50000), end: s + (100000), allDay: false, className: ['customFeed'] }];
                //callback($scope.events);
            });
        }
    };

    $scope.eventRender = function(event, element) {
        // Si on affiche les mois suivant le mois actuel -> On n'affiche que les congés.
        if (viewStartDate > lastValidDate && event.data.type == "JT1") {
            return false;
        }

        function indexOfEvent(start) {
            var index = 0, l = $scope.events.length;
            for (; index < l; index++) {
                if ($scope.events[index].start == start) return index;
            }
            return -1;
        }
        var eventScope = $scope.$new(true);
        angular.extend(eventScope, event);
        eventScope.typeActivite = $rootScope.typeActivite;
        if (event.data.type == "JF") {
            // Journée de type fériée
            eventScope.typeActiviteJour = $rootScope.typeActiviteAstreinte;
        }
        else if (businessDay(moment(event.start))) {
            // Journée de type semaine
            eventScope.typeActiviteJour = $rootScope.typeActiviteTravaille;
        }
        else {
            // Journée de type weekend
            eventScope.typeActiviteJour = $rootScope.typeActiviteWeekend;
        }
        eventScope.cssConges = $rootScope.cssConges;
        eventScope.valid = function(event) {
            eventScope.error = null;
            isDirty = true;
            $scope.isDirty = true;
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
                $scope.events.splice(index + 1, 0, { title: 'Ap. midi', start: date, allDay: false, data: { type: this.data.type, jour: date, duree: 2} });
                $scope.activiteCalendar.fullCalendar('refetchEvents');
            }
            else if (this.data.duree == 2) {
                var date = new Date(this.start);
                date.setHours(8);
                this.start.setHours(16);
                this.allDay = false;
                $scope.isUpdating = true;
                var index = indexOfEvent(this.start);
                $scope.events.splice(index, 0, { title: 'Matin', start: date, allDay: false, data: { type: this.data.type, jour: date, duree: 1} });
                $scope.activiteCalendar.fullCalendar('refetchEvents');
            }
            else if (this.data.duree == 0 && lastDuree == 1) {
                this.allDay = true;
                $scope.isUpdating = true;
                var index = indexOfEvent(this.start);
                this.start.setHours(0);
                $scope.events.splice(index + 1, 1);
                $scope.activiteCalendar.fullCalendar('refetchEvents');
            }
            else if (this.data.duree == 0 && lastDuree == 2) {
                this.allDay = true;
                $scope.isUpdating = true;
                var index = indexOfEvent(this.start);
                this.start.setHours(0);
                $scope.events.splice(index - 1, 1);
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
        };
        eventScope.hasHeuresAstreinte = function (data) {
            return data.heuresAstreinte > 0 || (!businessDay(moment(start)) && data.type == 'JT1') || data.type == 'JF';
        };
        return $compile($.trim($('#eventTmpl').html()))(eventScope)
            .attr("rel", "popover").popover({
            html: true,

            content: function(e) {
                // Jour férié, pas d'édition.
                if (eventScope.data.type == 'CP' || eventScope.data.type == 'CP_ANT' || eventScope.data.type == 'RTT' || eventScope.data.type == 'AE') {
                    return false;
                }
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
    /* alert on eventClick */
    $scope.alertEventOnClick = function (date, allDay, jsEvent, view) {
        $scope.$apply(function () {
            $scope.eventSelectionne = new moment(date).format('dddd D MMMM YYYY');
        });
    };
    $scope.eventOnClick = function (calEvent, jsEvent, view) {
        $scope.$apply(function () {
            $scope.currentEvent = calEvent.data;
            $scope.eventSelectionne = new moment(calEvent.start).format('dddd D MMMM YYYY');
        });
    };

    $scope.closeSuccess = function () {
        $scope.successOperation = "";
    };

    $scope.save = function (events) {
        var activite = angular.copy($scope.activite);
        if (activite.etat > 1) return;
        var creation = activite.etat == -1 ? true : false;
        activite.activite = $.map(events, function (item, index) {
            return {
                jour: item.start,
                type: item.data.type,
                information: item.data.information,
                heuresSup: item.data.heuresSup,
                heuresAstreinte: item.data.heuresAstreinte,
                heuresNuit: item.data.heuresNuit,
                heuresInt: item.data.heuresInt
            };
        });

        ActiviteService.save(activite, creation).then(function (reponse) {
            if (reponse.success === true) {
                isDirty = false;
                $scope.isDirty = false;
                $scope.successOperation = "Activité enregistrée";
            }
        });
    };
    
    $scope.eventSources = [$scope.events, $scope.eventsF];
    /* alert on Drop */
    $scope.alertOnDrop = function (event, dayDelta, minuteDelta, allDay, revertFunc, jsEvent, ui, view) {
        return false;
        $scope.$apply(function () {
            $scope.alertMessage = ('Event Droped to make dayDelta ' + dayDelta);
        });
    };
    /* alert on Resize */
    $scope.alertOnResize = function (event, dayDelta, minuteDelta, revertFunc, jsEvent, ui, view) {
        $scope.$apply(function () {
            $scope.alertMessage = ('Event Resized to make dayDelta ' + minuteDelta);
        });
    };
    /* add and removes an event source of choice */
    $scope.addRemoveEventSource = function (sources, source) {
        var canAdd = 0;
        angular.forEach(sources, function (value, key) {
            if (sources[key] === source) {
                sources.splice(key, 1);
                canAdd = 1;
            }
        });
        if (canAdd === 0) {
            sources.push(source);
        }
    };
    /* add custom event*/
    $scope.addEvent = function () {
        $scope.events.push({
            title: 'Open Sesame',
            start: new Date(y, m, 28),
            end: new Date(y, m, 29),
            className: ['openSesame']
        });
    };
    /* remove event */
    $scope.remove = function (index) {
        $scope.events.splice(index, 1);
    };
    /* Change View */
    $scope.changeView = function (view) {
        $scope.activiteCalendar.fullCalendar('changeView', view);
    };
   

    var lastValidDate = new Date(new Date().getFullYear(), new Date().getMonth() + 3, 1),
    viewStartDate;
    /* config object */
    $scope.uiConfig = {
        calendar: angular.extend({
            editable: false,
            //readonly: true,
            header: {
                //left: 'month basicWeek basicDay agendaWeek agendaDay',
                //center: 'title',
                right: 'today prev,next'
            },
            viewDisplay: function (view) {
                $scope.start = view.start;
                $scope.end = view.end;

                viewStartDate = view.start;
                if (view.start > lastValidDate) {
                    // Calendrier dans le future -> Désactivation de la sauvegarde
                    $scope.future = true;
                } else {
                    // Calendrier dans le passé > 3 mois -> Désactivation de la sauvegarde
                    if (moment().diff(moment(view.start), 'months', true) > 3) {
                        $scope.future = true;
                    }
                    else {
                        $scope.future = false;
                    }
                }
            },
            firstDay: 1,
            dayClick: $scope.alertEventOnClick,
            eventDrop: $scope.alertOnDrop,
            eventResize: $scope.alertOnResize,
            eventClick: $scope.eventOnClick,
            eventRender: $scope.eventRender,
            eventAfterAllRender: function () {
                $timeout(function () {
                    // Permet la re-génération d'angularjs
                });
            }
        }, jQuery.fullCalendar)
    };
}
