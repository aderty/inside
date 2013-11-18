"use strict";angular.module("inside.directives",[]).directive("appVersion",["version",function(n){return function(t,i){i.text(n)}}]).directive("loadingContainer",function(){return{restrict:"A",scope:!1,link:function(n,t,i){var r=$('<div class="loading"><\/div>').appendTo(t);$(t).addClass("loading-container");n.$watch(i.loadingContainer,function(n){r.toggle(n)})}}}).directive("passwordValidate",function(){return{require:"ngModel",link:function(n,t,i,r){r.$parsers.unshift(function(t){return n.pwdValidLength=t&&t.length>=8?"valid":undefined,n.pwdHasLetter=t&&/[A-z]/.test(t)?"valid":undefined,n.pwdHasNumber=t&&/\d/.test(t)?"valid":undefined,n.edition==2&&t==""||n.pwdValidLength&&n.pwdHasLetter&&n.pwdHasNumber?(r.$setValidity("pwd",!0),t):(r.$setValidity("pwd",!1),undefined)})}}}).directive("decimal",function(){return{require:"ngModel",link:function(n,t,i,r){var u;r.$parsers.unshift(function(t){try{u=parseFloat(t);n.decimalValid=(!i.min||u>=i.min)&&(!i.max||u<=i.max)}catch(f){n.decimalValid=!1}return n.decimalValid?(r.$setValidity("decimal",!0),t):(r.$setValidity("decimal",!1),undefined)})}}}).directive("authenticate",function(){return{link:function(n,t,i){var r=1;i.authenticate!=""&&(r=parseInt(i.authenticate));!n.$root.role<r&&t.hide();n.$root.$watch("role",function(n){t[n>=r?"show":"hide"]()},!0)}}}).directive("gauge",function(){return{restrict:"E",scope:{model:"=ngModel"},template:'<div class="gauge"><\/div>',replace:!0,require:"ngModel",link:function(n,t,i){var f=t.width(),r=t.parent().width(),u;t.width(r);t.height(r/f*t.height());u=new JustGage({id:t[0].id,value:n.model||0,min:i.min||0,max:i.max||25,title:i.title,label:i.label,levelColorsGradient:!1,levelColors:["#ff0000","#f9c802","#a9d70b"]});n.$watch("model",function(n){u.refresh(parseFloat(n)||0)},!0)}}}).directive("autocompleteUser",["$compile",function(n){return{restrict:"A",scope:{model:"=ngModel"},require:"ngModel",replace:!1,link:function(t,i,r){r.$set("uiSelect2",r.autocompleteUser);r.$set("autocompleteUser",null);i.on("select",function(){});n(i[0].outerHTML)(t.$parent);t.$watch("model",function(){},!0)}}}]).directive("grid",["$compile","$timeout",function(n){var t='<thead><tr><th ng-repeat="(i,th) in options.columnDefs" ng-class="selectedCls(th)" style="width: {{width(th)}};" ng-click="changeSorting(th)">{{th.displayName}}<\/th><\/tr><\/thead><tbody><tr ng-show="filter(row)" ng-repeat="row in data |filter:filterRow | orderBy:sorter:sort.descending"><td ng-repeat="def in options.columnDefs" class="cell {{def.cssClass}}" rowgrid><\/td><\/tr><\/tbody>';return{restrict:"E",template:'<table class="table table-bordered table-hover"><\/table>',replace:!0,compile:function(i,r){return{pre:function(i,u){i.sort={column:"b",descending:!1};i.selectedCls=function(n){return(n.field==i.sort.column||n.sort==i.sort.column)&&"sort-"+i.sort.descending};i.sortCls=function(n){return(n.field==i.sort.column||n.sort==i.sort.column)&&i.sort.descending?"icon-chevron-up":"icon-chevron-down"};i.width=function(n){return n.width?n.width+"px":"auto"};i.options=i.$eval(r.ngOptions);i.sorter=function(n){var u,t,r,f;if(i.sort.column.indexOf(".")>-1){for(u=i.sort.column.split("."),t=n,r=0,f=u.length;r<f;r++)t=t[u[r]];return t}return n[i.sort.column]};i.filterRow=function(n){if(!i.options.filterOptions||!i.options.filterOptions.filterRow)return!0;for(var t in i.options.filterOptions.filterRow)if(!angular.equals(n[t],i.options.filterOptions.filterRow[t]))return!1;return!0};i.changeSorting=function(n){var t=i.sort;t.column==n.field||t.column==n.sort?t.descending=!t.descending:(t.column=n.sort||n.field,t.descending=!1)};i.filter=function(n){if(!i.options.filterOptions||i.options.filterOptions.filterText=="")return!0;for(var t in n)if(n[t]&&typeof n[t]!="function"&&(n[t].toString().toLowerCase().indexOf(i.options.filterOptions.filterText.toLowerCase())>-1||typeof n[t]=="object"&&JSON.stringify(n[t]).toLowerCase().indexOf(i.options.filterOptions.filterText.toLowerCase())>-1))return!0;return!1};i.$root.$watch(i.options.data,function(n){i.data=n});i.$watch("filterOptions",function(n){i.options.filterOptions=angular.copy(n)},!0);u.append(n(t)(i))},post:function(){setTimeout(function(){$('[data-toggle="tooltip"]').tooltip({container:"body"})},250)}}}}}]).directive("rowgrid",["$compile",function(n){var t="<div>{{row[def.field]",i="}}<\/div>";return{restrict:"A",compile:function(){return{pre:function(r,u){if(r.entity=r.row,r.def.cellTemplate)return u.append(n(r.def.cellTemplate)(r));var f=t;r.def.cellFilter&&(f=f+"|"+r.def.cellFilter);r.$watch("row",function(n){r.row=n});f=f+i;u.append(n(f)(r))}}}}}]);