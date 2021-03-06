﻿'use strict';

/* Directives */

angular.module('inside.directives', []).
directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
        elm.text(version);
    };
} ])
// directive for loading container 
.directive('loadingContainer', function() {
    return {
        restrict: 'A',
        scope: false,
        link: function(scope, element, attrs) {
            var loadingLayer = $('<div class="loading"></div>').appendTo(element);
            $(element).addClass('loading-container');
            scope.$watch(attrs.loadingContainer, function(value) {
                loadingLayer.toggle(value);
            });
        }
    };
})
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
.directive('decimal', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            var value;
            ctrl.$parsers.unshift(function(viewValue) {
                try {
                    value = parseFloat(viewValue);
                    scope.decimalValid = ((!attrs.min || value >= attrs.min) && (!attrs.max || value <= attrs.max));
                }
                catch (e) {
                    scope.decimalValid = false
                }
                if (scope.decimalValid) {
                    ctrl.$setValidity('decimal', true);
                    return viewValue;
                } else {
                    ctrl.$setValidity('decimal', false);
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
                elm.hide(); //addClass("masquer");
            }

            scope.$root.$watch('role', function(newValue, oldValue) {
                //elm[newValue >= role ? 'removeClass' : 'addClass']("masquer");
                elm[newValue >= role ? 'show' : 'hide']();
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
                gauge.refresh(parseFloat(newValue) || 0);
            }, true);
        }
    };
})
.directive('detailspopup', ["$compile", "$timeout", "$filter",function($compile, $timeout, $filter) {
    return {
        restrict: 'EA',
        scope: { titre:'@', content: '@', heures: '=', placement: '@', animation: '&', isOpen: '&' , scope: '='},
        template: '<span rel="popover"><span ng-transclude></span></span>',
        transclude: true,
        replace: true,
        link: function($scope, elem, attr, ctrl) {
            if(!$scope.heures || !$scope.heures.total) return;
            var w = elem.width();
            var pw = elem.parent().width();
            $scope.cancel = function(){
                elem.popover('hide');
            }
            $scope.weeks = $filter("weeksHeures")($scope.heures.details);

            elem.attr("rel", "popover").popover({
                html: true,
                title: $scope.titre,
                placement: attr.placement,
                content: function(){
                    return $compile($.trim($('#'+ attr.content).html()))($scope);
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
                $scope.$apply(function(){
                        //elem.popover('show');
                });
            });/*.on({
                show: function (e) {
                     
                });*/
         }
    };
}])
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
directive('grid', ['$compile', '$timeout', function($compile, $timeout) {
    var template = '<thead>' +
                            '<tr>' +
                                '<th ng-repeat="(i,th) in options.columnDefs" ng-class="selectedCls(th)" style="width: {{width(th)}};" ng-click="changeSorting(th)">{{th.displayName}}</th>' +
                            '</tr>' +
                        '</thead>' +
                        '<tbody>' +
                            '<tr ng-show="filter(row)" ng-repeat="row in data |filter:filterRow | orderBy:sorter:sort.descending">' +
                                '<td ng-repeat="def in options.columnDefs" class="cell {{def.cssClass}}" rowgrid>' +
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
                    $scope.sortCls = function(column) {
                        return (column.field == $scope.sort.column || column.sort == $scope.sort.column) && $scope.sort.descending ? 'icon-chevron-up' : 'icon-chevron-down';
                    };
                    $scope.width = function(column) {
                        return column.width ? column.width + "px" : "auto";
                    };

                    $scope.options = $scope.$eval(tAttrs.ngOptions);

                    $scope.sorter = function(row) {
                        if ($scope.sort.column.indexOf(".") > -1) {
                            var list = $scope.sort.column.split("."), temp = row;
                            for (var i = 0, l = list.length; i < l; i++) {
                                temp = temp[list[i]];
                            }
                            return temp;
                        }
                        return row[$scope.sort.column];
                    }

                    $scope.filterRow = function(row) {
                        if (!$scope.options.filterOptions || !$scope.options.filterOptions.filterRow) return true;
                        for (var prop in $scope.options.filterOptions.filterRow) {
                            if (!angular.equals(row[prop], $scope.options.filterOptions.filterRow[prop])) return false;
                        }
                        return true;
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

                    $scope.filter = function(row) {
                        if (!$scope.options.filterOptions || $scope.options.filterOptions.filterText == "") return true;
                        for (var prop in row) {
                            if (row[prop] && typeof row[prop] != "function") {
                                if (row[prop].toString().toLowerCase().indexOf($scope.options.filterOptions.filterText.toLowerCase()) > -1) return true;
                                if (typeof row[prop] == "object" && JSON.stringify(row[prop]).toLowerCase().indexOf($scope.options.filterOptions.filterText.toLowerCase()) > -1) return true;
                            }
                        }
                        return false;
                    };
                    $scope.$root.$watch($scope.options.data, function(data) {
                        $scope.data = data;
                    });
                    $scope.$watch('filterOptions', function(filterOptions) {
                        $scope.options.filterOptions = angular.copy(filterOptions);
                    }, true);

                    iElement.append($compile(template)($scope));
                },
                post: function preLink($scope, iElement, iAttrs, controller) {
                    setTimeout(function() {
                        $('[data-toggle="tooltip"]').tooltip({ container: 'body' });
                    }, 250);
                }
            }
        }
    };
}]).
directive('rowgrid', ['$compile', function($compile) {
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
                } /*,
                post: function preLink($scope, iElement, iAttrs, controller) {
                    setTimeout(function () {
                        $('.matriculeCell>span').tooltip({ container: 'body' });
                        
                    }, 250);
                }*/
            }
        }
    };
}])
.directive('exportCsv', ['$parse', '$compile', '$timeout', function ($parse, $compile, $timeout) {
    return {
        restrict: 'A',
        scope: false,
        link: function(scope, element, attrs) {
            var data = '';
            var template = $(document.getElementById(attrs.template));
            var compiler = $compile($.trim(template.html()));
            var exportZone = $("<div>").appendTo($(document.body)).hide();
            var csv = {
                stringify: function(str) {
                    return str.replace(/^\s\s*/, '').replace(/\s*\s$/, ''); // trim spaces
                            //.replace(/"/g,'""'); // replace quotes with double quotes
                },
                generate: function() {
                    data = '';
                    exportZone.empty();
                    compiler(scope).appendTo(exportZone);
                    $timeout(function(){
                        var tds = exportZone.children();
                        if(!tds.length) tds = exportZone;
                        angular.forEach(tds, function(td, i) {
                            data += csv.stringify(angular.element(td).text());
                            data += "\n";
                        });
                        //rowData = rowData.slice(0, rowData.length - 1); //remove last semicolon
                        //data += rowData + "\n";
                        //data += exportZone.text();
                    },0);
                },
                link: function() {
                    // \uFEFF to force Excel open file with UTF-8 encoding
                    return 'data:text/csv;charset=UTF-8,\uFEFF' + encodeURIComponent(data);
                }
            };
            $parse(attrs.exportCsv).assign(scope.$parent, csv);
        }
    };
}]);