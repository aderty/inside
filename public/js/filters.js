'use strict';

/* Filters */

angular.module('inside.filters', []).
filter('role', function () {
    return function (role) {
        if (role == 2) {
            return "RH";
        }
        if (role == 3) {
            return "Admin";
        }
        return "Consultant";
    };
}).
filter('motifConges', function ($rootScope) {
    return function (motif, list) {
        if (!list) list = $rootScope.motifsConges;
        for (var i = 0, l = list.length; i < l; i++) {
            if (list[i].id == motif) return list[i].libelle;
        }
        return "";
    };
}).
filter('motifCongesShort', function($rootScope) {
    return function (motif, list) {
        if (!list) list = $rootScope.motifsConges;
        for (var i = 0, l = list.length; i < l; i++) {
            if (list[i].id == motif) return list[i].shortlibelle || list[i].libelle;
        }
        return "";
    };
}).
    filter('etatConges', function ($rootScope) {
        return function (motif) {
            for (var i = 0, l = $rootScope.etatsConges.length; i < l; i++) {
                if ($rootScope.etatsConges[i].id == motif) return $rootScope.etatsConges[i].libelle;
            }
            return "";
        };
    }).
filter('moment', function () {
    return function (dateString, format) {
        return moment(dateString).format(format);
    };
}).
filter('momentCongesDebut', function () {
    return function (dateString, format) {
        var d = moment(dateString.date).format(format);
        if (dateString.type == 1) {
            d += " après-midi";
        }
        else {
            d += " matin";
        }
        return d;
    };
}).
filter('momentCongesFin', function () {
    return function (dateString, format) {
        var d = moment(dateString.date).format(format);
        if (dateString.type == 0) {
            d += " midi";
        }
        else {
            d += " soir";
        }
        return d;
    };
});