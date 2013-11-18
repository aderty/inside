'use strict';

/* Controllers */

// Config par défaut
app.run(["$rootScope", "MotifsService", function($rootScope, MotifsService) {
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
        { id: '1', libelle: 'En attente de validation', cssClass: 'val' },
        { id: '2', libelle: 'Validé', cssClass: 'val' },
        { id: '3', libelle: 'Refusé', cssClass: 'val' }
    ];
    $rootScope.cssConges = {
        1: 'valConges',
        2: 'accConges',
        3: 'refConges'
    };
    $rootScope.initConnected = function(user) {
        $rootScope.connected = true;
        if (user) {
            $rootScope.currentUser = user;
            $rootScope.username = user.prenom;
            $rootScope.role = user.role;
            $rootScope.infos = user.infos;
        }
        MotifsService.list().then(function(motifs) {
            $rootScope.motifsConges = motifs; /*jQuery.grep(motifs, function (n, i) {
                return (n.id == 'CP' || n.id == 'RCE' || n.id == 'RC' || n.id == 'CP_ANT');
            });*/
            /*$rootScope.motifsConges.push({ id: 'AE', libelle: 'Absence exceptionnelle', shortlibelle: 'Abs. exp.' });
            $rootScope.motifsCongesExcep = jQuery.grep(motifs, function (n, i) {
            return (n.id != 'CP' && n.id != 'RCE' && n.id != 'RC' && n.id != 'CP_ANT');
            });*/

            $rootScope.typeActiviteTravaille = [
                { id: 'JT1', libelle: 'En mission 1', ordre: 0 },
                { id: 'JT2', libelle: 'En mission 2', ordre: 1 },
                { id: 'JT3', libelle: 'En mission 3', ordre: 2 },
                { id: 'FOR', libelle: 'Formation', ordre: 3 },
                { id: 'INT', libelle: 'Intercontrat', ordre: 4 }
            ];

            $rootScope.typeActiviteWeekend = [
                { id: 'WK', libelle: 'Weekend', ordre: 0 },
                { id: 'JT1', libelle: 'En mission 1', ordre: 1 },
                { id: 'JT2', libelle: 'En mission 2', ordre: 2 },
                { id: 'JT3', libelle: 'En mission 3', ordre: 3 }
            ];

            $rootScope.typeActiviteAstreinte = [
                { id: 'JF', libelle: 'Journée fériée', ordre: 0 },
                { id: 'JT1', libelle: 'En mission 1', ordre: 1 },
                { id: 'JT2', libelle: 'En mission 2', ordre: 2 },
                { id: 'JT3', libelle: 'En mission 3', ordre: 3 }
            ];

            $rootScope.typeActivite = angular.copy($rootScope.typeActiviteTravaille);
            $rootScope.typeActivite.push.apply($rootScope.typeActivite, $rootScope.motifsConges);
            $rootScope.typeActivite.push.apply($rootScope.typeActivite, $rootScope.typeActiviteWeekend);
            // Suppression de mission 1 / 2 / 3
            $rootScope.typeActivite.pop();
            $rootScope.typeActivite.pop();
            $rootScope.typeActivite.pop();
            $rootScope.typeActivite.push.apply($rootScope.typeActivite, $rootScope.typeActiviteAstreinte);
            // Suppression de mission 1 / 2 / 3
            $rootScope.typeActivite.pop();
            $rootScope.typeActivite.pop();
            $rootScope.typeActivite.pop();
        });
    }

    $rootScope.searcher = false;
    if (window.config.connected ? true : false) {
        $rootScope.initConnected(window.config);
    }
} ]);
app.controller('appController', ['$scope', '$routeParams', '$rootScope', function($scope, $routeParams, $rootScope) {
    // Contrôleur de la navigation de l'application
    var id = location.pathname;
    if ($rootScope.pages[id.substring(1)]) {
        $rootScope.idpage = id.substring(1);
        $rootScope.page = $rootScope.pages[id.substring(1)].name;
        $rootScope.searcher = $rootScope.pages[id.substring(1)].searcher;
    }
}
]).
controller('NavBar', ['$scope', '$rootScope', 'LoginService', '$dialog', function($scope, $rootScope, LoginService, $dialog) {
    // Contrôleur de la barre de navigation
    $scope.logout = function(user) {
        LoginService.logout(function(err, ret) {
            $rootScope.connected = false;
        });
    }
    $scope.search = function() {
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

    $scope.changePassword = function() {
        $rootScope.error = "";
        var d = $dialog.dialog($scope.opts);
        d.open().then(function(result) {
            if (result) {

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
} ]).
controller('DialogPassword', ['$scope', '$rootScope', 'dialog', 'UsersService', function($scope, $rootScope, dialog, UsersService) {
    // Contrôleur de la popup de modification de password
    $rootScope.error = "";
    $scope.enable = true;
    $scope.close = function() {
        $rootScope.error = "";
        dialog.close();
    };
    $scope.save = function(currentUser) {
        if ($scope.pwdUser.$invalid) {
            return;
        }
        $rootScope.error = "";
        $scope.enable = false;
        UsersService.password(currentUser).then(function(retour) {
            $scope.enable = true;
            if (retour) {
                dialog.close();
            }
        }, function(response) {
            $scope.enable = true;
        });
    };
} ]).
controller('DialogContact', ['$scope', '$rootScope', 'dialog', 'ContactService', function($scope, $rootScope, dialog, ContactService) {
    // Contrôleur de la popup de demande d'information
    $rootScope.error = "";
    $scope.enable = true;
    $scope.sujets = [
        { libelle: "Congés" },
        { libelle: "Compte-rendu d'activité" },
        { libelle: "Mon compte" },
        { libelle: "Poser une question..." }
    ];
    $scope.close = function() {
        $rootScope.error = "";
        dialog.close();
    };
    $scope.send = function(demande) {
        $scope.enable = false;
        ContactService.send(demande).then(function(retour) {
            $scope.enable = true;
            if (retour) {
            }
        }, function(response) {
            $scope.enable = true;
        });
        dialog.close();
    };
} ]);
