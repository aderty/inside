"use strict";(function(){var a=false;window.onbeforeunload=function(c){if(a){return"Si vous ne cliquez pas sur le bouton 'Sauvegarder', toutes les modifications effectuées seront perdues."}};this.register("ActiviteMain",["$scope","$rootScope","UsersService","ActiviteService","$timeout","$filter","$compile",b]);function b(s,r,j,i,e,n,h){var g=new Date();var k=g.getDate();var f=g.getMonth();var p=g.getFullYear();function o(d){return d.format("d")!=0&&d.format("d")!=6}s.user=j.get({id:0},function(d){});s.isDirty=false;s.eventSelectionne=null;s.events=[];s.successOperation="";s.typeActivitePerso=[];s.refresh=function(){s.isDirty=false;s.activiteCalendar.fullCalendar("refetchEvents")};var c;s.$watch("events",function(d){if(c){clearTimeout(c)}c=setTimeout(function(){s.$apply(function(){var m,x=0,B=0,A=0,y=0,u=0,v=0;s.typeActivitePerso=angular.copy(r.typeActivite);for(var z=0,w=s.typeActivitePerso.length;z<w;z++){s.typeActivitePerso[z].libelle=n("motifCongesShort")(s.typeActivitePerso[z].id,r.typeActivite);s.typeActivitePerso[z].nb=0}for(var z=0,w=d.length;z<w;z++){m=d[z];if(m.data.type!="WK"&&m.data.type!="JF"){t(m.data.type,m.data.duree==0?1:0.5);v++;if(o(moment(m.start))){u++}}x+=m.data.heuresSup||0;B+=m.data.heuresAstreinte||0;A+=m.data.heuresNuit||0;y+=m.data.heuresInt||0}s.heuresSup=x;s.heuresAstreinte=B;s.heuresNuit=A;s.heuresInt=y;s.joursOuvres=u;s.joursTotal=v})},100)},true);function t(w,d){if(typeof d=="undefined"){d=1}var u=true;for(var v=0,m=s.typeActivitePerso.length;v<m;v++){if(s.typeActivitePerso[v].id==w){if(!s.typeActivitePerso[v].libelle){}u=false;s.typeActivitePerso[v].nb+=d}}}s.load=function(d){s.eventSelectionne=null;i.list({start:s.start,end:s.end}).then(function(u){s.activite=u;s.indexEvents=[];s.events=[];s.successOperation="";function v(K,H){w=true;var F=true;if(o(K)&&!H){var J=angular.copy(C);J.start=J.debut.date.getDate()==K.date();if(J.fin.date.getMonth()<=K.month()&&J.fin.date.getDate()<=K.date()){J.end=true}if(!J.end&&J.debut.type==0){J.duree=0}else{if(J.start&&!J.end&&J.debut.type==1){J.duree=2;var G=new Date(K.toDate());G.setHours(8);if((!y||y.fin.date.getMonth()!=K.month()||y.fin.date.getDate()<K.date())&&J.fin.date.getDate()>K.date()){s.events.push({title:"Journée travaillée",allDay:false,start:G,data:{type:"JT1",duree:1,heuresSup:0,heuresAstreinte:0,heuresNuit:0,heuresInt:0}})}G=new Date(K.toDate());G.setHours(12);s.events.push({title:n("motifCongesShort")(J.type),allDay:false,start:G,data:J,heuresSup:0,heuresAstreinte:0,heuresNuit:0,heuresInt:0});s.indexEvents[K.date()]=s.events.length-1;F=false}else{if(J.debut.type==0&&J.end&&J.fin.type==0){J.duree=1;var G=new Date(K.toDate());G.setHours(8);s.events.push({title:n("motifCongesShort")(J.type),allDay:false,start:G,data:J,heuresSup:0,heuresAstreinte:0,heuresNuit:0,heuresInt:0});G=new Date(K.toDate());G.setHours(12);if(s.conges.length>0&&s.conges[0].debut.date.getMonth()==K.month()&&s.conges[0].debut.date.getDate()<=K.date()){var I=angular.copy(s.conges[0]);I.duree=2;s.events.push({title:n("motifCongesShort")(I.type),allDay:false,start:G,data:I,heuresSup:0,heuresAstreinte:0,heuresNuit:0,heuresInt:0});if(!s.conges[0].fin.date.getDate()<=K.date()){y=angular.copy(C);C=s.conges.shift()}}else{s.events.push({title:"Journée travaillée",allDay:false,start:G,data:{type:"JT1",duree:2,heuresSup:0,heuresAstreinte:0,heuresNuit:0,heuresInt:0}})}s.indexEvents[K.date()]=s.events.length-1;F=false}else{if(J.debut.type==1&&J.start&&J.end&&J.fin.type==1){J.duree=2;var G=new Date(K.toDate());G.setHours(8);if(!y||(y.fin.date.getMonth()==K.month()&&y.fin.date.getDate()<K.date())){s.events.push({title:"Journée travaillée",allDay:false,start:G,data:{type:"JT1",duree:1,heuresSup:0,heuresAstreinte:0,heuresNuit:0,heuresInt:0}})}G=new Date(K.toDate());G.setHours(12);s.events.push({title:n("motifCongesShort")(J.type),allDay:false,start:G,data:J,heuresSup:0,heuresAstreinte:0,heuresNuit:0,heuresInt:0});s.indexEvents[K.date()]=s.events.length-1;F=false}else{if(J.debut.type==0&&J.end&&J.fin.type==1){J.duree=0}}}}}if(F){if(J.type=="JF"&&s.indexEvents[K.date()]&&s.events[s.indexEvents[K.date()]]){s.events.splice(s.indexEvents[K.date()],1)}J.heuresSup=0;J.heuresAstreinte=0;J.heuresNuit=0;J.heuresInt=0;s.events.push({title:n("motifCongesShort")(J.type),start:new Date(K.toDate()),data:J});s.indexEvents[K.date()]=s.events.length-1}}if(!y||y.fin.date.getDate()<=K.date()){y=angular.copy(C)}C=s.conges.shift()}function B(I){var H=angular.copy(y);var F=true;if(H.fin.date.getMonth()<=I.month()&&H.fin.date.getDate()<=I.date()){H.end=true}if(!H.end){H.duree=0}if(H.end&&H.fin.type==0){H.duree=1;var G=new Date(I.toDate());G.setHours(8);H.heuresSup=0;H.heuresAstreinte=0;H.heuresNuit=0;H.heuresInt=0;s.events.push({title:n("motifCongesShort")(H.type),allDay:false,start:G,data:H});s.indexEvents[I.date()]=s.events.length-1;G=new Date(I.toDate());G.setHours(12);if(!C||C.fin.date.getMonth()!=I.month()||C.fin.date.getDate()<I.date()){s.events.push({title:"Journée travaillée",allDay:false,start:G,data:{type:"JT1",duree:2,heuresSup:0,heuresAstreinte:0,heuresNuit:0,heuresInt:0}})}else{if((y&&y.fin.date.getMonth()==I.month()||y.fin.date.getDate()==I.date())&&(!C||C.debut.date.getMonth()!=I.month()||C.debut.date.getDate()>I.date())){s.events.push({title:"Journée travaillée",allDay:false,start:G,data:{type:"JT1",duree:2,heuresSup:0,heuresAstreinte:0,heuresNuit:0,heuresInt:0}})}}F=false}if(H.end&&H.fin.type==1){H.duree=0}if(F){H.heuresSup=0;H.heuresAstreinte=0;H.heuresNuit=0;H.heuresInt=0;s.events.push({title:n("motifCongesShort")(H.type),start:new Date(I.toDate()),data:H});s.indexEvents[I.date()]=s.events.length-1}}function E(F){w=false}function m(F){if(o(F)){s.events.push({title:"Journée travaillée",start:new Date(F.toDate()),data:{type:"JT1",duree:0,heuresSup:0,heuresAstreinte:0,heuresNuit:0,heuresInt:0}})}else{s.events.push({title:"Weekend",start:new Date(F.toDate()),data:{type:"WK",duree:0,heuresSup:0,heuresAstreinte:0,heuresNuit:0,heuresInt:0}})}s.indexEvents[F.date()]=s.events.length-1}if(s.activite.etat>0&&s.activite.activite.length>0){for(var z=0,x=s.activite.activite.length;z<x;z++){s.events.push({title:s.activite.activite[z].type,start:s.activite.activite[z].jour.date,data:s.activite.activite[z]});s.indexEvents[s.activite.activite[z].jour.date]=s.events.length-1}}else{s.conges=s.activite.activite;var C=s.conges.shift();var y;var A=true;var w=false;var D=new moment(s.start);if(D.date()!=1){while(D.date()!=1){if(C&&C.debut.date.getMonth()==D.month()&&C.debut.date.getDate()==D.date()){v(D,true)}if(w&&y&&y.fin.date<=D.toDate()){E(D)}D=D.add("days",1)}}while(D.date()!=1||A){A=false;if(w&&o(D)){B(D)}if(C&&C.debut.date.getMonth()==D.month()&&C.debut.date.getDate()<=D.date()){v(D)}if(w&&y&&y.fin.date.getMonth()<=D.month()&&y.fin.date.getDate()<=D.date()){E(D)}if(typeof s.indexEvents[D.date()]=="undefined"){m(D)}D=D.add("days",1)}}if(d){d(s.events)}})};s.eventsA=[];s.eventsF=function(y,u,x){var v=new Date(y).getTime()/1000;var w=new Date(u).getTime()/1000;var d=new Date(y).getMonth();s.start=y;s.end=u;if(s.isUpdating){s.isUpdating=false;x(s.events)}else{e(function(){s.load(x)})}};s.eventRender=function(m,d){if(q>l&&m.data.type=="JT1"){return false}function v(y){var x=0,w=s.events.length;for(;x<w;x++){if(s.events[x].start==y){return x}}return -1}var u=s.$new(true);angular.extend(u,m);u.typeActivite=r.typeActivite;if(m.data.type=="JF"){u.typeActiviteJour=r.typeActiviteAstreinte}else{if(o(moment(m.start))){u.typeActiviteJour=r.typeActiviteTravaille}else{u.typeActiviteJour=r.typeActiviteWeekend}}u.cssConges=r.cssConges;u.valid=function(y){u.error=null;a=true;s.isDirty=true;$("[rel=popover]").popover("hide");var z=u.savedEvent.duree;if(this.data.duree==z){return}if(this.data.duree==1){var x=new Date(this.start);x.setHours(16);this.start.setHours(8);this.allDay=false;s.isUpdating=true;var w=v(this.start);s.events.splice(w+1,0,{title:"Ap. midi",start:x,allDay:false,data:{type:this.data.type,jour:x,duree:2}});s.activiteCalendar.fullCalendar("refetchEvents")}else{if(this.data.duree==2){var x=new Date(this.start);x.setHours(8);this.start.setHours(16);this.allDay=false;s.isUpdating=true;var w=v(this.start);s.events.splice(w,0,{title:"Matin",start:x,allDay:false,data:{type:this.data.type,jour:x,duree:1}});s.activiteCalendar.fullCalendar("refetchEvents")}else{if(this.data.duree==0&&z==1){this.allDay=true;s.isUpdating=true;var w=v(this.start);this.start.setHours(0);s.events.splice(w+1,1);s.activiteCalendar.fullCalendar("refetchEvents")}else{if(this.data.duree==0&&z==2){this.allDay=true;s.isUpdating=true;var w=v(this.start);this.start.setHours(0);s.events.splice(w-1,1);s.activiteCalendar.fullCalendar("refetchEvents")}}}}};u.cancel=function(w){u.error=null;$.extend(u.data,u.savedEvent);$("[rel=popover]").popover("hide")};u.infos=function(w){if(w.duree==2){return"Ap. midi"}if(w.duree==1){return"Matin"}};u.hasHeuresAstreinte=function(w){return w.heuresAstreinte>0||(!o(moment(start))&&(w.type=="JT1"||w.type=="JT2"||w.type=="JT3"))||w.type=="JF"};return h($.trim($("#eventTmpl").html()))(u).attr("rel","popover").popover({html:true,content:function(w){if(u.data.type!="FOR"&&u.data.type!="INT"&&u.data.type!="JT1"&&u.data.type!="JT2"&&u.data.type!="JT3"&&u.data.type!="JF"&&u.data.type!="WK"){return false}u.savedEvent=angular.copy(u.data);return h($.trim($("#popoverEventTmpl").html()))(u)}}).click(function(w){var x=$(this);$(".popover.in").prev().each(function(y){var z=$(this);if(!z.is(x)){z.scope().cancel();z.popover("hide")}})})};s.alertEventOnClick=function(u,v,m,d){s.$apply(function(){s.eventSelectionne=new moment(u).format("dddd D MMMM YYYY")})};s.eventOnClick=function(u,m,d){s.$apply(function(){s.currentEvent=u.data;s.eventSelectionne=new moment(u.start).format("dddd D MMMM YYYY")})};s.closeSuccess=function(){s.successOperation=""};s.save=function(m){var u=angular.copy(s.activite);if(u.etat>1){return}var d=u.etat==-1?true:false;u.activite=$.map(m,function(w,v){return{jour:w.start,type:w.data.type,information:w.data.information,heuresSup:w.data.heuresSup,heuresAstreinte:w.data.heuresAstreinte,heuresNuit:w.data.heuresNuit,heuresInt:w.data.heuresInt}});i.save(u,d).then(function(v){if(v.success===true){a=false;s.isDirty=false;s.successOperation="Activité enregistrée"}})};s.eventSources=[s.events,s.eventsF];s.alertOnDrop=function(x,v,u,z,w,m,y,d){return false;s.$apply(function(){s.alertMessage=("Event Droped to make dayDelta "+v)})};s.alertOnResize=function(x,v,u,w,m,y,d){s.$apply(function(){s.alertMessage=("Event Resized to make dayDelta "+u)})};s.addRemoveEventSource=function(d,u){var m=0;angular.forEach(d,function(w,v){if(d[v]===u){d.splice(v,1);m=1}});if(m===0){d.push(u)}};s.addEvent=function(){s.events.push({title:"Open Sesame",start:new Date(p,f,28),end:new Date(p,f,29),className:["openSesame"]})};s.remove=function(d){s.events.splice(d,1)};s.changeView=function(d){s.activiteCalendar.fullCalendar("changeView",d)};var l=new Date(new Date().getFullYear(),new Date().getMonth()+3,1),q;s.uiConfig={calendar:angular.extend({editable:false,header:{right:"today prev,next"},viewDisplay:function(d){s.start=d.start;s.end=d.end;q=d.start;if(d.start>l){s.future=true}else{if(moment().diff(moment(d.start),"months",true)>3){s.future=true}else{s.future=false}}},firstDay:1,dayClick:s.alertEventOnClick,eventDrop:s.alertOnDrop,eventResize:s.alertOnResize,eventClick:s.eventOnClick,eventRender:s.eventRender,eventAfterAllRender:function(){e(function(){})}},jQuery.fullCalendar)}}}).call(app.controllerProvider);