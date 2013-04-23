﻿'use strict';

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
        return function (motif) {
            for (var i=0, l = $rootScope.motifsConges.length; i<l;i++) {
                if ($rootScope.motifsConges[i].id == motif) return $rootScope.motifsConges[i].libelle;
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
});