"use strict";app.run(["$rootScope","MotifsService",function(a,b){a.pages={index:{name:"Accueil",searcher:false},users:{name:"Gestion des utilisateurs",searcher:"users"},conges:{name:"Mes demandes d'absence",searcher:false},"admin-conges":{name:"Validation des absences",searcher:"admin-conges"},activite:{name:"Déclarer mon activité",searcher:false},"admin-activite":{name:"Rapports d'activité",searcher:"admin-activite"}};a.roles=[{id:1,libelle:"Consultant"},{id:2,libelle:"Structure"},{id:3,libelle:"Admin"},{id:4,libelle:"Super Admin"}];a.etatsConges=[{id:"1",libelle:"En attente de validation",cssClass:"val"},{id:"2",libelle:"Validé",cssClass:"val"},{id:"3",libelle:"Refusé",cssClass:"val"}];a.cssConges={1:"valConges",2:"accConges",3:"refConges"};a.initConnected=function(c){a.connected=true;if(c){a.currentUser=c;a.username=c.prenom;a.role=c.role;a.infos=c.infos}b.list().then(function(d){a.motifsConges=d;a.typeActiviteTravaille=[{id:"JT1",libelle:"En mission 1",ordre:0},{id:"JT2",libelle:"En mission 2",ordre:1},{id:"JT3",libelle:"En mission 3",ordre:2},{id:"FOR",libelle:"Formation",ordre:3},{id:"INT",libelle:"Intercontrat",ordre:4}];a.typeActiviteWeekend=[{id:"WK",libelle:"Weekend",ordre:0},{id:"JT1",libelle:"En mission 1",ordre:1},{id:"JT2",libelle:"En mission 2",ordre:2},{id:"JT3",libelle:"En mission 3",ordre:3}];a.typeActiviteAstreinte=[{id:"JF",libelle:"Journée fériée",ordre:0},{id:"JT1",libelle:"En mission 1",ordre:1},{id:"JT2",libelle:"En mission 2",ordre:2},{id:"JT3",libelle:"En mission 3",ordre:3}];a.typeActivite=angular.copy(a.typeActiviteTravaille);a.typeActivite.push.apply(a.typeActivite,a.motifsConges);a.typeActivite.push.apply(a.typeActivite,a.typeActiviteWeekend);a.typeActivite.pop();a.typeActivite.pop();a.typeActivite.pop();a.typeActivite.push.apply(a.typeActivite,a.typeActiviteAstreinte);a.typeActivite.pop();a.typeActivite.pop();a.typeActivite.pop()})};a.searcher=false;if(window.config.connected?true:false){a.initConnected(window.config)}}]);app.controller("appController",["$scope","$routeParams","$rootScope",function(b,c,a){var d=location.pathname;if(a.pages[d.substring(1)]){a.idpage=d.substring(1);a.page=a.pages[d.substring(1)].name;a.searcher=a.pages[d.substring(1)].searcher}}]).controller("NavBar",["$scope","$rootScope","LoginService","$dialog",function(c,a,b,d){c.logout=function(e){b.logout(function(g,f){a.connected=false})};c.search=function(){a.$broadcast("search",{searcher:a.searcher,search:search.value})};c.opts={backdrop:true,keyboard:true,backdropClick:true,templateUrl:"/templates/password.html?v="+config.version,controller:"DialogPassword"};c.changePassword=function(){a.error="";var e=d.dialog(c.opts);e.open().then(function(f){if(f){}})};c.optsContact={backdrop:true,keyboard:true,backdropClick:true,templateUrl:"/templates/contact.html?v="+config.version,controller:"DialogContact"};c.contact=function(){a.error="";var e=d.dialog(c.optsContact);e.open().then(function(f){if(f){}})}}]).controller("DialogPassword",["$scope","$rootScope","dialog","UsersService",function(b,a,c,d){a.error="";b.enable=true;b.close=function(){a.error="";c.close()};b.save=function(e){if(b.pwdUser.$invalid){return}a.error="";b.enable=false;d.password(e).then(function(f){b.enable=true;if(f){c.close()}},function(f){b.enable=true})}}]).controller("DialogContact",["$scope","$rootScope","dialog","ContactService",function(b,a,d,c){a.error="";b.enable=true;b.sujets=[{libelle:"Absences / congés"},{libelle:"Compte-rendu d'activité"},{libelle:"Mon compte"},{libelle:"Poser une question..."}];b.close=function(){a.error="";d.close()};b.send=function(e){b.enable=false;c.send(e).then(function(f){b.enable=true;if(f){}},function(f){b.enable=true});d.close()}}]);