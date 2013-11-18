"use strict";(function(){function n(n,t,i,r,u){function f(n){return n.nom.toLowerCase()+" "+n.prenom}n.edition=0;n.mode="";n.lblMode="";n.currentConges={};n.currentCongesSaved=null;n.showMatricule=!0;n.dateOptionsDebut={dateFormat:"dd/mm/yy",changeYear:!0,changeMonth:!0,yearRange:"-2Y:+1Y"};n.dateOptionsFin={dateFormat:"dd/mm/yy",changeYear:!0,changeMonth:!0,yearRange:"-2Y:+1Y"};n.$watch("currentConges.debut.date",function(t){n.dateOptionsFin.minDate=t});n.accepter=function(u){var f;if(n.currentConges=u,n.currentConges.etat!=2&&n.currentConges.etat!=3){f=angular.copy(n.currentConges);f.etat=2;var e=i.messageBox("Validation d'un congé","Etes-vous sûr de vouloir valider la demande de congés ?",[{label:"Oui",result:"yes",cssClass:"btn-primary"},{label:"Non",result:"no"}]);e.open().then(function(i){i==="yes"&&r.updateEtat(f,!1).then(function(){t.error=null;t.infos.nbCongesVal--;n.currentConges.etat=2;var i=t.congesAvalider.indexOf(u);i>-1?t.congesAvalider.splice(i,1):(i=t.congesRefuser.indexOf(u),i>-1&&t.congesRefuser.splice(i,1));t.congesValider.push(u)})})}};n.opts={backdrop:!0,keyboard:!0,backdropClick:!0,template:$.trim($("#refusTmpl").html()),controller:"DialogConges"};n.refuser=function(u){var f,e;(n.currentConges=u,n.currentConges.etat!=3)&&(f=angular.copy(n.currentConges),f.etat=3,t.dialogModel=f,e=i.dialog(n.opts),e.open().then(function(i){i==="yes"&&r.updateEtat(f,!1).then(function(){t.error=null;t.infos.nbCongesVal--;n.currentConges.etat=3;var i=t.congesAvalider.indexOf(u);i>-1?t.congesAvalider.splice(i,1):(i=t.congesValider.indexOf(u),i>-1&&t.congesValider.splice(i,1));t.congesRefuser.push(u)})}))};n.create=function(){t.error=null;n.editConges.$setPristine();n.currentConges={typeuser:1,etat:2,debut:{type:0},fin:{type:1}};n.edition=1;n.mode="Création";n.lblMode="Nouveau congé de régulation"};n.cancel=function(){t.error=null;n.edition=0;$.extend(n.currentConges,n.currentCongesSaved)};n.edit=function(i){t.error=null;n.currentConges=i;n.editConges.$setPristine();n.currentCongesSaved=angular.copy(n.currentConges);n.edition=2;n.mode="Edition";n.lblMode="Modification d'un congé";n.dateOptionsFin.minDate=n.currentConges.debut.date};n["delete"]=function(n){var u=i.messageBox("Suppression d'un congé","Etes-vous sûr de supprimer la demande de congés ?",[{label:"Oui",result:"yes",cssClass:"btn-primary"},{label:"Non",result:"no"}]);u.open().then(function(i){i==="yes"&&r.remove(n).then(function(){var i=t.congesAvalider.indexOf(n);i>-1?t.congesAvalider.splice(i,1):(i=t.congesValider.indexOf(n),i>-1?t.congesValider.splice(i,1):(i=t.congesRefuser.indexOf(n),i>-1&&t.congesRefuser.splice(i,1)))})})};n.isEditable=function(n){return n.etat!=3};n.isUnchanged=function(t){n.haschanged=angular.equals(t,n.currentCongesSaved);return};n.save=function(i){var u=angular.copy(i);r.save(u,n.edition==1).then(function(r){t.error=null;i.typeuser==2&&(i.user=u.user);r.id&&(i.id=r.id);r.duree&&(i.duree=r.duree);n.edition==1&&t.congesValider.push(i);n.edition=0;n.currentConges=null})};n.selectUserOptions={placeholder:"Rechercher un utilisateur",minimumInputLength:1,query:function(n){var i=isNaN(n.term)?"text":"id";t.$apply(function(){u.search({type:i,search:n.term}).then(function(t){n.callback({more:!1,results:t})})})},data:[{id:2,nom:"tous",prenom:""}],initSelection:function(){},formatResult:f,formatSelection:f,dropdownCssClass:"bigdrop",escapeMarkup:function(n){return n}};n.showAide=function(){var n=i.dialog({backdrop:!0,keyboard:!0,backdropClick:!0,templateUrl:"/templates/aide-conges.html",controller:"DialogAideConges"});n.open()}}function t(n,t,i){n.close=function(n){i.close(n)}}function i(n,t){n.close=function(){t.close()}}function r(n,t,i,r,u,f,e){n.filterOptions={filterText:"",useExternalFilter:!1};n.$on("search",function(t,i){i.searcher=="admin-conges"&&(n.tableParamsCongesAValider.$params.filter=i.search,n.tableParamsValider.$params.filter=i.search,n.tableParamsRefuser.$params.filter=i.search)});n.pagingOptions={pageSizes:[25,50,100],pageSize:50,totalServerItems:0,currentPage:1};n.etatOptions={type:1};var o=n;t.tableParamsCongesAValider=new u({page:1,count:10,sorting:{"debut.date":"asc"}},{getData:function(n,i){e.list({etat:1}).then(function(r){t.congesAvalider=f(r,i);n.resolve(t.congesAvalider)})}});t.tableParamsValider=new u({page:1,count:10,sorting:{"debut.date":"asc"}},{getData:function(n,i){e.list({etat:2}).then(function(r){t.congesValider=f(r,i);n.resolve(t.congesValider)})}});t.tableParamsRefuser=new u({page:1,count:10,sorting:{"debut.date":"asc"}},{getData:function(n,i){e.list({etat:3}).then(function(r){t.congesRefuser=f(r,i);n.resolve(t.congesRefuser)})}});n.$on("ngGridEventColumns",function(){setTimeout(function(){$(".matriculeCell>span").tooltip({container:"body"})},250)})}this.register("CongesAdmin",["$scope","$rootScope","$dialog","CongesAdminService","UsersService",n]);this.register("DialogConges",["$scope","$rootScope","dialog",t]);this.register("DialogAideConges",["$scope","dialog",i]);this.register("CongesAdminGrid",["$scope","$rootScope","$timeout","$filter","ngTableParams","ngTableFilter","CongesAdminService",r])}).call(app.controllerProvider);