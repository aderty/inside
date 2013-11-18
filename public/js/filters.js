'use strict';

/* Filters */

angular.module('inside.filters', []).
filter('role', ['$rootScope', function($rootScope) {
    return function(role) {
        for (var i = 0, l = $rootScope.roles.length; i < l; i++) {
            if ($rootScope.roles[i].id == role) {
                return $rootScope.roles[i].libelle;
            }
        }
        return "Consultant";
    };
}]).
filter('matricule', function() {
    return function(matricule) {
        if (!matricule) return "";
        var mat = matricule.toString();
        while (mat.length < 3) {
            mat = "0" + mat;
        }
        return mat;
    };
}).
filter('motifConges', ['$rootScope', function($rootScope) {
    return function(motif, list) {
        if (!list) list = $rootScope.motifsConges;
        for (var i = 0, l = list.length; i < l; i++) {
            if (list[i].id == motif) return list[i].libelle;
        }
        return "";
    };
} ]).
filter('motifCongesShort', ['$rootScope', function($rootScope) {
    return function(motif, list) {
        if (!list) list = $rootScope.motifsConges;
        for (var i = 0, l = list.length; i < l; i++) {
            if (list[i].id == motif) return list[i].shortlibelle || list[i].libelle;
        }
        return "";
    };
} ]).
filter('etatConges', ['$rootScope', function($rootScope) {
    return function(motif) {
        for (var i = 0, l = $rootScope.etatsConges.length; i < l; i++) {
            if ($rootScope.etatsConges[i].id == motif) return $rootScope.etatsConges[i].libelle;
        }
        return "";
    };
} ]).
filter('moment', function() {
    return function(dateString, format) {
        return moment(dateString).format(format);
    };
}).
filter('momentCongesDebut', function() {
    return function(dateString, format) {
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
filter('momentCongesFin', function() {
    return function(dateString, format) {
        var d = moment(dateString.date).format(format);
        if (dateString.type == 0) {
            d += " midi";
        }
        else {
            d += " soir";
        }
        return d;
    };
}).
filter('detailsAutreActivite', ['$filter', function($filter) {
    return function(activites) {
        if (!activites) return;
        var details = "", act;
        for (act in activites) {
            if ('AU,CS,DC,DEM,ENF,MA,MAR,MAT,NAI,PAT'.split(',').indexOf(act) > -1) {
                details += $filter('motifConges')(act) + " : " + activites[act] + " jour(s) <br />";
            }
        }
        return details;
    };
} ]).
filter('detailsHeures', function() {
    return function(array) {
        if (!array || array.length == 0) return;
        var i = 0, l = array.length, details = "";
        for (; i < l; i++) {
            details += "Le " + moment(array[i].jour).format("DD/MM/YYYY") + " : " + array[i].nb + " heure(s) <br />";
        }
        return details;
    };
});

