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
.directive('autocompleteUser', ['$compile', function(compile) {
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
} ]).
directive('grid', function($compile, $timeout) {
    var template = '<thead>' +
                            '<tr>' +
                                '<th ng-repeat="(i,th) in options.columnDefs" ng-class="selectedCls(th)" style="width: {{width(th)}};" ng-click="changeSorting(th)">{{th.displayName}}</th>' +
                            '</tr>' +
                        '</thead>' +
                        '<tbody>' +
                            '<tr ng-show="filter(row)" ng-repeat="row in data | orderBy:sorter:sort.descending">' +
                                '<td ng-repeat="def in options.columnDefs" class="cell" rowgrid>' +
                                '</td>' +
                            '</tr>' +
                        '</tbody>';

    return {
        restrict: 'E',
        template: '<table class="table table-bordered table-hover"></table>',
        replace: true,
        compile: function compile(tElement, tAttrs, transclude) {
            return {
                pre: function preLink($scope, iElement, iAttrs, controller) {
                    var timer;
                    $scope.sort = {
                        column: 'b',
                        descending: false
                    };
                    $scope.selectedCls = function(column) {
                        return (column.field == $scope.sort.column || column.sort == $scope.sort.column) && 'sort-' + $scope.sort.descending;
                    };
                    $scope.sortCls = function (column) {
                        return (column.field == $scope.sort.column || column.sort == $scope.sort.column) && $scope.sort.descending ? 'icon-chevron-up' : 'icon-chevron-down';
                    }; 
                    $scope.width = function (column) {
                        return column.width ? column.width + "px" : "auto";
                    };

                    $scope.options = $scope.$eval(tAttrs.ngOptions);

                    $scope.sorter = function (row) {
                        if ($scope.sort.column.indexOf(".") > -1) {
                            var list = $scope.sort.column.split("."), temp = row;
                            for (var i = 0, l = list.length; i < l; i++) {
                                temp = temp[list[i]];
                            }
                            return temp;
                        }
                        return row[$scope.sort.column];
                    }

                    $scope.changeSorting = function(column) {
                        var sort = $scope.sort;
                        if (sort.column == column.field || sort.column == column.sort) {
                            sort.descending = !sort.descending;
                        } else {
                            sort.column = column.sort || column.field;
                            sort.descending = false;
                        }
                    };

                    $scope.filter = function (row) {
                        if(!$scope.filterOptions || $scope.filterOptions.filterText == "") return true;
                        for (var prop in row) {
                            if (row[prop] && typeof row[prop] != "function" && row[prop].toString().toLowerCase().indexOf($scope.filterOptions.filterText.toLowerCase()) > -1) return true;
                        }
                        return false;
                    };
                    $scope.$root.$watch($scope.options.data, function(data) {
                        $scope.data = data;
                    });
                    $scope.$root.$watch($scope.options.filterOptions, function (filterOptions) {
                        $scope.filterOptions = angular.copy(filterOptions);
                    }, true);

                    iElement.append($compile(template)($scope));
                },
                post: function preLink($scope, iElement, iAttrs, controller) {
                    setTimeout(function () {
                        $('[data-toggle="tooltip"]').tooltip({ container: 'body' });
                    }, 250);
                }
            }
        }
    };
}).
directive('rowgrid', function($compile) {
    var template = '<div>{{row[def.field]',
    templateFin = '}}</div>';
    return {
        restrict: 'A',
        compile: function compile(tElement, tAttrs, transclude) {
            return {
                pre: function preLink($scope, iElement, iAttrs, controller) {
                    $scope.entity = $scope.row;
                    if ($scope.def.cellTemplate) {
                        return iElement.append($compile($scope.def.cellTemplate)($scope));
                    }
                    var tmpl = template;
                    if ($scope.def.cellFilter) {
                        tmpl = tmpl + '|' + $scope.def.cellFilter;
                    }
                    
                    $scope.$watch("row", function(data) {
                        $scope.row = data;
                    });
                    tmpl = tmpl + templateFin;
                    iElement.append($compile(tmpl)($scope));
                }/*,
                post: function preLink($scope, iElement, iAttrs, controller) {
                    setTimeout(function () {
                        $('.matriculeCell>span').tooltip({ container: 'body' });
                        
                    }, 250);
                }*/
            }
        }
    };
});