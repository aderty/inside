'use strict';

/* Controllers */

// Config par défaut
app.run(["$rootScope", "MotifsService", function ($rootScope, MotifsService) {
    $rootScope.pages = {
        index: { 
            name: "Accueil",
            searcher: false
        },
        users: { 
            name: "Gestion des utilisateurs",
            searcher: "users"
        },
        conges: { 
            name: "Mes demandes de congés",
            searcher: false
        },
        "admin-conges": { 
            name: "Validation des congés",
            searcher: "admin-conges"
        },
        activite: { 
            name: "Déclarer mon activité",
            searcher: false
        },
        "admin-activite": {
            name: "Rapports d'activité",
            searcher: "admin-activite"
        }
    }
    $rootScope.roles = [
        { id: 1, libelle: 'Consultant' },
        { id: 2, libelle: 'Structure' },
        { id: 3, libelle: 'Admin' },
        { id: 4, libelle: 'Super Admin' }
    ];

    $rootScope.etatsConges = [
        { id: '1', libelle: 'En attente de validation' , cssClass: 'val'},
        { id: '2', libelle: 'Validés' , cssClass: 'val'},
        { id: '3', libelle: 'Refusés' , cssClass: 'val'}
    ];
    $rootScope.cssConges ={
         1: 'valConges',
         2: 'accConges',
         3: 'refConges'
    };
    $rootScope.initConnected = function (user) {
        $rootScope.connected = true;
        if (user) {
            $rootScope.username = user.prenom;
            $rootScope.role = user.role;
            $rootScope.infos = user.infos;
        }
        MotifsService.list().then(function (motifs) {
            $rootScope.motifsConges = jQuery.grep(motifs, function (n, i) {
                return (n.id == 'CP' || n.id == 'RCE' || n.id == 'RC' || n.id == 'CP_ANT');
            });
            $rootScope.motifsConges.push({ id: 'AE', libelle: 'Absence exceptionnelle', shortlibelle: 'Abs. exp.' });
            $rootScope.motifsCongesExcep = jQuery.grep(motifs, function (n, i) {
                return (n.id != 'CP' && n.id != 'RCE' && n.id != 'RC' && n.id != 'CP_ANT');
            });

            $rootScope.typeActiviteTravaille = [
                { id: 'JT', libelle: 'En mission', ordre: 0 },
                { id: 'FOR', libelle: 'Formation', ordre: 1 },
                { id: 'INT', libelle: 'Intercontrat', ordre: 2 }
            ];

            $rootScope.typeActiviteWeekend = [
                { id: 'WK', libelle: 'Weekend', ordre: 0 },
                { id: 'JT', libelle: 'En mission', ordre: 1 }
            ];

            $rootScope.typeActiviteAstreinte = [
                { id: 'JF', libelle: 'Journée fériée', ordre: 0 },
                { id: 'JT', libelle: 'En mission', ordre: 1 }
            ];

            $rootScope.typeActivite = angular.copy($rootScope.typeActiviteTravaille);
            $rootScope.typeActivite.push.apply($rootScope.typeActivite, $rootScope.motifsConges);
            $rootScope.typeActivite.push.apply($rootScope.typeActivite, $rootScope.typeActiviteWeekend);
            $rootScope.typeActivite.pop();
            $rootScope.typeActivite.push.apply($rootScope.typeActivite, $rootScope.typeActiviteAstreinte);
            $rootScope.typeActivite.pop();
        });
    }
    
    $rootScope.searcher = false;
    if (window.config.connected ? true : false) {
        $rootScope.initConnected(window.config);
    }
}]);

// Contrôleur de la navigation de l'application
function appController($scope, $routeParams, $rootScope) {
    var id = location.pathname;
    if ($rootScope.pages[id.substring(1)]) {
        $rootScope.page = $rootScope.pages[id.substring(1)].name;
        $rootScope.searcher = $rootScope.pages[id.substring(1)].searcher;
    }
}

// Contrôleur de la barre de navigation
function NavBar($scope, $rootScope, LoginService, $dialog) {
    $scope.logout = function (user) {
        LoginService.logout(function (err, ret) {
            $rootScope.connected = false;
        });
    }
    $scope.search = function () {
        $rootScope.$broadcast("search", {
            searcher: $rootScope.searcher,
            search: search.value
        });
    }
    // Inlined template for demo 
    $scope.opts = { 
        backdrop: true, 
        keyboard: true,
        backdropClick: true,
        templateUrl: '/templates/password.html',
        controller: 'DialogPassword'
    }; 
        
    $scope.changePassword = function(){ 
        $rootScope.error = "";
        var d = $dialog.dialog($scope.opts); 
        d.open().then(function(result){ 
            if(result) {
                
            } 
        });
    };

    // Inlined template for demo 
    $scope.optsContact = {
        backdrop: true,
        keyboard: true,
        backdropClick: true,
        templateUrl: '/templates/contact.html',
        controller: 'DialogContact'
    };

    $scope.contact = function() {
        $rootScope.error = "";
        var d = $dialog.dialog($scope.optsContact);
        d.open().then(function(result) {
            if (result) {

            }
        });
    };
}
// Contrôleur de la popup de modification de password
function DialogPassword($scope, $rootScope, dialog, UsersService) {
    $rootScope.error = "";
    $scope.close = function() {
        $rootScope.error = "";
        dialog.close(); 
    }; 
    $scope.save = function (currentUser) {
        if ($scope.pwdUser.$invalid) {
            return;
        }
        UsersService.password(currentUser).then(function(retour){
            if(retour){
                dialog.close(); 
            }
        }); 
    };
}

// Contrôleur de la popup de demande d'information
function DialogContact($scope, $rootScope, dialog, ContactService) {
    $rootScope.error = "";
    $scope.sujets = [
        {libelle: "Congés"},
        {libelle: "Compte-rendu d'activité"},
        {libelle: "Mon compte"},
        { libelle: "Autre" }
    ];
    $scope.close = function() {
        $rootScope.error = "";
        dialog.close();
    };
    $scope.send = function (demande) {
        ContactService.send(demande).then(function(retour) {
            if (retour) {
                dialog.close();
            }
        });
    };
}
