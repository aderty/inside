'use strict';

/* Directives */

angular.module('inside.directives', []).
directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
        elm.text(version);
    };
} ])
// Validateur du password
.directive('passwordValidate', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(viewValue) {

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
.directive('authenticate', function() {
    return {
        link: function(scope, elm, attrs, ctrl) {
            var role = 1;
            if (attrs.authenticate != "") {
                var role = parseInt(attrs.authenticate);
            }
            if (!scope.$root.role < role) {
                elm.addClass("masquer");
            }

            scope.$root.$watch('role', function(newValue, oldValue) {
                elm[newValue >= role ? 'removeClass' : 'addClass']("masquer");
            }, true);
        }
    };
})
.directive('gauge', function() {
    return {
        restrict: 'E',
        scope: {
            model: '=ngModel'
        },
        template: '<div class="gauge"></div>',
        replace: true,
        require: 'ngModel',
        link: function($scope, elem, attr, ctrl) {
            var w = elem.width();
            var pw = elem.parent().width();
            elem.width(pw);
            elem.height(pw / w * elem.height());
            var gauge = new JustGage({
                id: elem[0].id,
                value: $scope.model || 0,
                min: attr.min || 0,
                max: attr.max || 25,
                title: attr.title,
                label: attr.label,
                levelColorsGradient: false,
                levelColors: ["#ff0000", "#f9c802", "#a9d70b"]
            });
            $scope.$watch("model", function(newValue, oldValue) {
                gauge.refresh(newValue);
            }, true);
        }
    };
})
.directive('autocompleteUser', [ '$compile', function(compile) {
    return {
        restrict: 'A',
        scope: {
            model: '=ngModel'
        },
        require: 'ngModel',
        replace: false,
        link: function($scope, elem, attr, ctrl) {
            attr.$set("uiSelect2", attr.autocompleteUser);
            //attr.$set("uiSelect2", "selectOptions");
            attr.$set("autocompleteUser", null);
                elem.on("select", function(e, data) {
            });
            compile(elem[0].outerHTML)($scope.$parent);
            $scope.$watch("model", function(newValue, oldValue) {
                //gauge.refresh(newValue);
            }, true);
        }
    };
}])