'use strict';

/* Directives */

angular.module('inside.directives', []).
directive('appVersion', ['version', function (version) {
      return function (scope, elm, attrs) {
          elm.text(version);
      };
  }])
// Validateur du password
.directive('passwordValidate', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {

                scope.pwdValidLength = (viewValue && viewValue.length >= 8 ? 'valid' : undefined);
                scope.pwdHasLetter = (viewValue && /[A-z]/.test(viewValue)) ? 'valid' : undefined;
                scope.pwdHasNumber = (viewValue && /\d/.test(viewValue)) ? 'valid' : undefined;

                if ((scope.edition == 2 && viewValue == "") || scope.pwdValidLength && scope.pwdHasLetter && scope.pwdHasNumber) {
                    ctrl.$setValidity('pwd', true);
                    return viewValue;
                } else {
                    ctrl.$setValidity('pwd', false);
                    return undefined;
                }

            });
        }
    };
})
// authenticate
.directive('authenticate', function () {
    return {
        link: function (scope, elm, attrs, ctrl) {
            var role = 1;
            if (attrs.authenticate != "") {
                var role = parseInt(attrs.authenticate);
            }
            if (!scope.$root.role < role) {
                elm.addClass("masquer");
            }

            scope.$root.$watch('role', function (newValue, oldValue) {
                elm[newValue >= role ? 'removeClass' : 'addClass']("masquer");
            }, true);
        }
    };
});