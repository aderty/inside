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
});;