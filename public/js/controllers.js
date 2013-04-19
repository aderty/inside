'use strict';

/* Controllers */

// Config par défaut
app.run(["$rootScope", function($rootScope) {
    $rootScope.pages = {
        index: "Accueil",
        users: "Gestion des utilisateurs"
    }
    $rootScope.connected = window.connected ? true : false;
    $rootScope.username = window.prenom;
}]);

// Contrôleur de la navigation de l'application
function appController($scope, $routeParams, $rootScope) {
    var id = location.pathname;
    $rootScope.page = $rootScope.pages[id.substring(1)];
}

// Contrôleur de la barre de navigation
function NavBar($scope, $rootScope, LoginService) {
    $scope.logout = function (user) {
        LoginService.logout(function (err, ret) {
            $rootScope.connected = false;
        });
    }
}

// Contrôleur de login
function LoginController($scope, $rootScope, LoginService) {
    $scope.user = {};
    $scope.error = false;
    $scope.connect = function (user) {
        var err = false;
        if (!user.email || user.email == "") {
            $scope.login.email.$setViewValue("");
        }
        if (!user.pwd || user.pwd == "") {
            $scope.login.password.$setViewValue("");
        }
        if ($scope.login.$invalid) {
            return;
        }
        LoginService.login(user.email, user.pwd, function (response) {
            if (!response) {
                $scope.user = {};
                $scope.login.$setPristine();
                $rootScope.connected = false;
                $scope.error = true;
                return;
            }
            $rootScope.connected = true;
            $rootScope.username = response.prenom;
        });
    }
}

// Contrôleur principal de la gestion des utilisateurs
function UsersMain($scope, $rootScope, $dialog, UsersService) {
    $scope.edition = 0;
    $scope.mode = "";
    $scope.lblMode = "";
    $scope.currentUserSaved = null;
    $scope.create = function() {
        $scope.editUser.$setPristine();
        document.getElementById('password').value = "";
        document.getElementById('confirm_password').value = "";
        $scope.currentUser = {
            role: 1,
            cp: 0,
            cp_acc: 0,
            rtt: 0
        };
        $scope.edition = 1;
        $scope.mode = "Création";
        $scope.lblMode = "Création d'un nouvel utilisateur";
    }

    $scope.cancel = function() {
        $scope.edition = 0;
        $.extend($scope.currentUser, $scope.currentUserSaved);
    }

    $scope.edit = function(row) {
        $scope.currentUser = row.entity;
        $scope.editUser.$setPristine();
        $scope.currentUserSaved = angular.copy($scope.currentUser);
        $scope.edition = 2;
        $scope.mode = "Edition";
        $scope.lblMode = "Modification de "; // +$scope.currentUser.nom + " " + $scope.currentUser.prenom;
    }

    $scope.delete = function(row) {
        var msgbox = $dialog.messageBox('Suppression d\'un utilisateur', 'Etes-vous sûre de le supprimer ?', [{label:'Oui', result: 'yes'},{label:'Non', result: 'no'}]);
        msgbox.open().then(function(result){
            if (result === 'yes') {
                UsersService.remove(row.entity, function (err) {
                    var index = $rootScope.users.indexOf(row.entity);
                    $rootScope.users.splice(index, 1);
                });
            }
        });
    }

    $scope.isUnchanged = function(currentUser) {
        $scope.haschanged = angular.equals(currentUser, $scope.currentUserSaved);
        return 
    };


    $scope.save = function (currentUser) {
        var user = angular.copy(currentUser);
        delete user.pwdtest;
        UsersService.save(user, function (err) {
            $scope.edition = 0;
            var index = $rootScope.users.indexOf(currentUser);
            if (index == -1) {
                $rootScope.users.push(currentUser);
            }
        });
    }
    
    $scope.currentUser = {};
}

// Contrôleur de la grille des utilisateurs
function UsersGrid($scope, $rootScope, UsersService) {

    $scope.pagingOptions = {
        pageSizes: [25, 50, 100],
        pageSize: 50,
        totalServerItems: 0,
        currentPage: 1
    };

    $rootScope.users = UsersService.query(function () {
        // GET: /user/123/card
        // server returns: [ {id:456, number:'1234', name:'Smith'} ];
        for (var i = 0, l = $rootScope.users.length; i < l; i++) {
            $rootScope.users[i].dateNaissance = new Date($rootScope.users[i].dateNaissance);
        }
    });



    $scope.gridOptions = {
        data: 'users',
        columnDefs: [
            { field: '', cellTemplate: $.trim($('#actionRowTmpl').html()) },
            { field: 'id', displayName: 'Matricule' },
            { field: 'nom', displayName: 'Nom' },
            { field: 'prenom', displayName: 'Prénom' },
            { field: 'age', displayName: 'Age' },
            { field: 'cp', displayName: 'CP' },
            { field: 'cp_acc', displayName: 'CP Aquis' },
            { field: 'rtt', displayName: 'RTT' }
        ],
        enablePaging: true,
        showFooter: true,
        enableRowSelection: false,
        enableColumnResize: true,
        showColumnMenu: true,
        showFilter: true,
        pagingOptions: $scope.pagingOptions/*,
        filterOptions: $scope.filterOptions*/
    };
};
