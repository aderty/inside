"use strict";(function(){this.register("CongesMain",["$scope","$rootScope","$dialog","UsersService","CongesService",a]);this.register("DialogAideConges",["$scope","dialog",d]);this.register("CongesGauges",["$scope","$rootScope",b]);this.register("CongesGrid",["$scope","$rootScope","$filter","ngTableParams","ngTableFilter","CongesService","$timeout",c]);function a(h,e,k,m,g){h.edition=0;h.mode="";h.lblMode="";h.currentConges={};h.currentCongesSaved=null;h.motifsConges=angular.copy(e.motifsConges);for(var j=0,f=h.motifsConges.length;j<f;j++){if(h.motifsConges[j].id=="RCE"){h.motifsConges.splice(j,1);break}}h.showMatricule=false;h.dateOptionsDebut={dateFormat:"dd/mm/yy",changeYear:true,changeMonth:true,yearRange:"0:+1Y",minDate:"0"};h.dateOptionsFin={dateFormat:"dd/mm/yy",changeYear:true,changeMonth:true,yearRange:"0:+1Y",minDate:"0"};h.$watch("currentConges.debut.date",function(i){h.dateOptionsFin.minDate=i});m.get({id:0},function(i){h.user=i;h.cp=i.cp;h.cp_ant=i.cp_ant;h.rtt=i.rtt});h.showAide=function(){var i=k.dialog({backdrop:true,keyboard:true,backdropClick:true,templateUrl:"/templates/aide-conges.html",controller:"DialogAideConges"});i.open()};h.create=function(){e.error=null;h.editConges.$setPristine();h.currentConges={etat:1,debut:{type:0},fin:{type:1}};h.edition=1;h.mode="Création";h.lblMode="Nouvelle demande de congés"};h.cancel=function(){e.error=null;h.edition=0;$.extend(h.currentConges,h.currentCongesSaved)};h.edit=function(i){e.error=null;h.currentConges=i;h.editConges.$setPristine();h.currentCongesSaved=angular.copy(h.currentConges);h.edition=2;h.mode="Edition";h.lblMode="Modification d'une demande de congés"};h["delete"]=function(n){var l=[{label:"Oui",result:"yes",cssClass:"btn-primary"},{label:"Non",result:"no"}];var i=k.messageBox("Suppression d'un congé","Etes-vous sûr de supprimer la demande de congés ?",l);i.open().then(function(o){if(o==="yes"){g.remove(n).then(function(q){e.error=null;var p=e.conges.indexOf(n);e.conges.splice(p,1);m.get({id:0},function(r){h.cp=r.cp;h.cp_ant=r.cp_ant;h.rtt=r.rtt})})}})};h.isEditable=function(i){return moment(i.creation).add("days",1)>moment()&&i.etat==1};h.isUnchanged=function(i){h.haschanged=angular.equals(i,h.currentCongesSaved);return};h.save=function(l){var i=angular.copy(l);delete i.etat;if(h.edition==1){i.create=true}g.save(i,h.edition==1).then(function(o){e.error=null;if(h.edition==1){e.infos.nbCongesVal++}h.edition=0;if(o.id){l.id=o.id}if(o.duree){l.duree=o.duree}var n=e.conges.indexOf(l);if(n==-1){e.conges.push(l)}m.get({id:0},function(p){h.cp=p.cp;h.cp_ant=p.cp_ant;h.rtt=p.rtt})})};h.selectUserOptions={query:function(i){i.callback({more:false,results:[]})},initSelection:function(l,n,i){}}}function d(e,f){e.close=function(){f.close()}}function b(f,e){}function c(l,j,i,e,h,m,f){l.filterOptions={filterText:"",useExternalFilter:false,filterRow:{etat:2}};l.pagingOptions={pageSizes:[25,50,100],pageSize:50,totalServerItems:0,currentPage:1};var g;var k=true;j.conges=[];l.updateFilter=function(n){k=!k;j.tableParamsConges.reload();j.tableParamsConges.page(1)};j.tableParamsConges=new e({page:1,count:10,sorting:{"debut.date":"asc"}},{getData:function(n,o){m.list({past:k}).then(function(p){j.conges=h(p,o);n.resolve(j.conges)})}})}}).call(app.controllerProvider);