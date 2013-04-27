'use strict';

/* Controllers */

// Config par défaut
app.run(["$rootScope", function($rootScope) {
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
            name: "Gestion des congés",
            searcher: false
        }
    }
    $rootScope.roles = [
        { id: 1, libelle: 'Consultant' },
        { id: 2, libelle: 'RH' },
        { id: 3, libelle: 'Admin' }
    ];
    $rootScope.motifsConges = [
        { id: 'CP', libelle: 'CP' },
        { id: 'RTT', libelle: 'RTT' },
        { id: 'CP_ANT', libelle: 'CP Anticipé' },
        { id: 'AE', libelle: 'Absence exceptionnelle' }
    ];
    $rootScope.motifsCongesExcep = [
        { id: 'CS', libelle: 'Sans solde' },
        { id: 'FO', libelle: 'Formation' },
        { id: 'IC', libelle: 'Intercontrat' },
        { id: 'PAT', libelle: 'Congé paternité' },
        { id: 'MT', libelle: 'Maternité' },
        { id: 'MA', libelle: 'Maladie' },
        { id: 'DC', libelle: 'Décé' },
        { id: 'MA', libelle: 'Mariage' }
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
    $rootScope.connected = window.config.connected ? true : false;
    $rootScope.role = window.config.role;
    $rootScope.username = window.config.prenom;
    $rootScope.searcher = false;
}]);

// Contrôleur de la navigation de l'application
function appController($scope, $routeParams, $rootScope) {
    var id = location.pathname;
    $rootScope.page = $rootScope.pages[id.substring(1)].name;
    $rootScope.searcher = $rootScope.pages[id.substring(1)].searcher;
}

// Contrôleur de la barre de navigation
function NavBar($scope, $rootScope, LoginService) {
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
        LoginService.login(user.email, user.pwd, { keep: user.keep }, function (response) {
            if (!response) {
                $scope.user = {};
                $scope.login.$setPristine();
                $rootScope.connected = false;
                $scope.error = true;
                return;
            }
            $rootScope.connected = true;
            $rootScope.username = response.prenom;
            $rootScope.role = response.role;
        });
    }
}

// Contrôleur principal de la gestion des utilisateurs
function UsersMain($scope, $rootScope, $dialog, UsersService) {
    if (!$rootScope.nextId) {
        $rootScope.nextId = max;
    }
    $scope.edition = 0;
    $scope.mode = "";
    $scope.lblMode = "";
    $scope.currentUserSaved = null;
    $scope.create = function () {
        $scope.error = null;
        $scope.editUser.$setPristine();
        document.getElementById('password').value = "";
        document.getElementById('confirm_password').value = "";
        $scope.currentUser = {
            id: $rootScope.nextId,
            role: 1,
            cp: 0,
            cp_ant: 0,
            rtt: 0
        };
        $scope.edition = 1;
        $scope.mode = "Création";
        $scope.lblMode = "Création d'un nouvel utilisateur";
    }

    $scope.cancel = function () {
        $scope.error = null;
        $scope.edition = 0;
        $.extend($scope.currentUser, $scope.currentUserSaved);
    }

    $scope.edit = function (row) {
        $scope.error = null;
        $scope.currentUser = row.entity;
        $scope.editUser.$setPristine();
        $scope.currentUserSaved = angular.copy($scope.currentUser);
        $scope.edition = 2;
        $scope.mode = "Edition";
        $scope.lblMode = "Modification de "; // +$scope.currentUser.nom + " " + $scope.currentUser.prenom;
    }

    $scope.delete = function(row) {
        var msgbox = $dialog.messageBox('Suppression d\'un utilisateur', 'Etes-vous sûr de supprimer ' + row.entity.prenom + ' ' + row.entity.nom + '?', [{ label: 'Oui', result: 'yes' }, { label: 'Non', result: 'no' }]);
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
        if ($scope.edition == 1) {
            // Création -> Flag création
            user.create = true;
            $rootScope.nextId++;
        }
        else {
            // Modif de matricule
            if (user.id != $scope.currentUserSaved.id) {
                user.lastId = $scope.currentUserSaved.id;
            }
        }
        UsersService.save(user, function (reponse) {
            if (reponse.error) {
                $scope.error = reponse.error;
                return;
            }
            $scope.error = null;
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

    $scope.filterOptions = {
        filterText: "",
        useExternalFilter: false
    };

    $scope.$on('search', function (event, data) {
        if (data.searcher == "users") {
            $scope.filterOptions.filterText = data.search;
        }
    });

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

    

    var myHeaderCellTemplate = $.trim($('#headerTmpl').html());

    $scope.gridOptions = {
        data: 'users',
        columnDefs: [
            { field: 'id', displayName: 'Matricule', width: 80, headerCellTemplate: myHeaderCellTemplate },
            { field: 'nom', displayName: 'Nom', headerCellTemplate: myHeaderCellTemplate },
            { field: 'prenom', displayName: 'Prénom', headerCellTemplate: myHeaderCellTemplate },
            { field: 'role', displayName: 'Rôle', cellFilter: "role", width: 60, headerCellTemplate: myHeaderCellTemplate },
            { field: 'cp', displayName: 'CP aquis', width: 75, headerCellTemplate: myHeaderCellTemplate },
            { field: 'cp_ant', displayName: 'CP en cours', width: 75, headerCellTemplate: myHeaderCellTemplate },
            { field: 'rtt', displayName: 'RTT', width: 60, headerCellTemplate: myHeaderCellTemplate },
            { field: '', cellTemplate: $.trim($('#actionRowTmplEdit').html()), width: 35, headerCellTemplate: myHeaderCellTemplate },
            { field: '', cellTemplate: $.trim($('#actionRowTmplDel').html()), width: 35, headerCellTemplate: myHeaderCellTemplate }
        ],
        enablePaging: false,
        showFooter: false,
        enableRowSelection: false,
        enableColumnResize: true,
        showColumnMenu: false,
        showFilter: false,
        pagingOptions: $scope.pagingOptions,
        filterOptions: $scope.filterOptions
    };

    $scope.$on('ngGridEventColumns', function (e) {
        setTimeout(function () {
            $('.ngHeaderText').tooltip({ container: 'body' });
        }, 250);
    });
};

function CongesMain($scope, $rootScope, $dialog, UsersService, CongesService) {
    $scope.edition = 0;
    $scope.mode = "";
    $scope.lblMode = "";
    $scope.currentConges = {};
    $scope.currentCongesSaved = null;

    var user = UsersService.get({ id: 0 }, function (retour) {
        $scope.cp = user.cp;
        $scope.cp_ant = user.cp_ant;
        $scope.rtt = user.rtt;
    });

    $scope.create = function () {
        $scope.error = null;
        $scope.editConges.$setPristine();
        $scope.currentConges = {
            etat: 1,
            debutType: 0,
            finType: 1
        };
        $scope.edition = 1;
        $scope.mode = "Création";
        $scope.lblMode = "Nouvelle demande de congés";
    }

    $scope.cancel = function () {
        $scope.error = null;
        $scope.edition = 0;
        $.extend($scope.currentConges, $scope.currentCongesSaved);
    }

    $scope.edit = function (row) {
        $scope.error = null;
        $scope.currentConges = row.entity;
        $scope.editConges.$setPristine();
        $scope.currentCongesSaved = angular.copy($scope.currentConges);
        $scope.edition = 2;
        $scope.mode = "Edition";
        $scope.lblMode = "Modification d'une demande de congés";
    }

    $scope.delete = function(row) {
        var msgbox = $dialog.messageBox('Suppression d\'un congés', 'Etes-vous sûr de supprimer la demande de congés ?', [{ label: 'Oui', result: 'yes' }, { label: 'Non', result: 'no' }]);
        msgbox.open().then(function(result){
            if (result === 'yes') {
                CongesService.remove(row.entity, function (reponse) {
                    if (reponse.error) {
                        $scope.error = reponse.error;
                        return;
                    }
                    var index = $rootScope.conges.indexOf(row.entity);
                    $rootScope.conges.splice(index, 1);
                    user = UsersService.get({ id: 0 }, function (retour) {
                        $scope.cp = user.cp;
                        $scope.cp_ant = user.cp_ant;
                        $scope.rtt = user.rtt;
                    });
                });
            }
        });
    }
    
    $scope.isEditable = function(currentConges) {
        return moment(currentConges.creation).add('days', 1) > moment() && currentConges.etat == 1;
    };

    $scope.isUnchanged = function(currentConges) {
        $scope.haschanged = angular.equals(currentConges, $scope.currentCongesSaved);
        return 
    };


    $scope.save = function (currentConges) {
        var conges = angular.copy(currentConges);
        delete conges.etat;
        if ($scope.edition == 1) {
            // Création -> Flag création
            conges.create = true;
        }
        if (conges.motifExcep) {
            conges.motif = conges.motifExcep;
        }
        conges.debut.setHours(20);
        if (conges.debutType == 1) {
            conges.debut.setHours(12);
        }
        delete conges.debutType;
        conges.fin.setHours(20);
        if (conges.finType == 0) {
            conges.fin.setHours(12);
        }
        delete conges.finType;
        CongesService.save(conges, function (reponse) {
            if (reponse.error) {
                $scope.error = reponse.error;
                return;
            }
            $scope.error = null;
            $scope.edition = 0;
            if (reponse.id) {
                currentConges.id = reponse.id;
            }
            if (reponse.duree) {
                currentConges.duree = reponse.duree;
            }
            var index = $rootScope.conges.indexOf(currentConges);
            if (index == -1) {

                $rootScope.conges.push(currentConges);
            }
            user = UsersService.get({ id: 0 }, function (retour) {
                $scope.cp = user.cp;
                $scope.cp_ant = user.cp_ant;
                $scope.rtt = user.rtt;
            });
        });
    }
}

function CongesGauges($scope, $rootScope) {
    /*$scope.cp = 22;
    $scope.cpacc = 7.25;  
    $scope.rtt = 15;*/
}

    // Contrôleur de la grille des congés
function CongesGrid($scope, $rootScope, CongesService) {

    $scope.filterOptions = {
        filterText: "",
        useExternalFilter: false
    };

    $scope.$on('search', function (event, data) {
        if (data.searcher == "users") {
            $scope.filterOptions.filterText = data.search;
        }
    });

    $scope.pagingOptions = {
        pageSizes: [25, 50, 100],
        pageSize: 50,
        totalServerItems: 0,
        currentPage: 1
    };

    $rootScope.conges = CongesService.query(function () {
        // GET: /user/123/card
        // server returns: [ {id:456, number:'1234', name:'Smith'} ];
        for (var i = 0, l = $rootScope.conges.length; i < l; i++) {
            $rootScope.conges[i].creation = new Date($rootScope.conges[i].creation);
            $rootScope.conges[i].debut = new Date($rootScope.conges[i].debut);
            $rootScope.conges[i].fin = new Date($rootScope.conges[i].fin);
            $rootScope.conges[i].debutType = $rootScope.conges[i].debut.getHours() > 14 ? 1 : 0;
            $rootScope.conges[i].finType = $rootScope.conges[i].fin.getHours() > 14 ? 0 : 1;
            if ($rootScope.conges[i].motif != 'CP' && $rootScope.conges[i].motif != 'RTT' && $rootScope.conges[i].motif != 'CP_ANT') {
                $rootScope.conges[i].motifExcep = $rootScope.conges[i].motif;
                $rootScope.conges[i].motif = 'AE';
            }
        }
    });

    

    var myHeaderCellTemplate = $.trim($('#headerTmpl').html());

    $scope.gridOptionsConges = {
        data: 'conges',
        columnDefs: [
            { field: '', displayName: '', width: 36, cellTemplate: '<span class="etatConges {{cssConges[row.entity.etat]}}">&nbsp;</span>', resizable: false },
            { field: 'debut', displayName: 'Date de défut', width: 120, cellFilter: "moment:'DD/MM/YYYY h:m'", headerCellTemplate: myHeaderCellTemplate, resizable: false },
            { field: 'fin', displayName: 'Date de fin', width: 120, cellFilter: "moment:'DD/MM/YYYY h:m'", headerCellTemplate: myHeaderCellTemplate, resizable: false },
            { field: 'duree', displayName: 'Duree', width: 60, headerCellTemplate: myHeaderCellTemplate, resizable: false },
            { field: 'motif', displayName: 'Modif', width: 100, cellFilter: "motifConges", headerCellTemplate: myHeaderCellTemplate, resizable: false },
            { field: 'etat', displayName: 'Etat', width: 165, cellFilter: "etatConges", headerCellTemplate: myHeaderCellTemplate, resizable: false },
            { field: 'justification', displayName: 'Justification', width: "*", headerCellTemplate: myHeaderCellTemplate, resizable: false },
            { field: '', cellTemplate: $.trim($('#actionRowTmplEdit').html()), width: 35, headerCellTemplate: myHeaderCellTemplate },
            { field: '', cellTemplate: $.trim($('#actionRowTmplDel').html()), width: 35, headerCellTemplate: myHeaderCellTemplate }
        ],
        enablePaging: false,
        showFooter: false,
        enableRowSelection: false,
        enableColumnResize: true,
        showColumnMenu: false,
        showFilter: false,
        pagingOptions: $scope.pagingOptions,
        filterOptions: $scope.filterOptions
    };

    $scope.$on('ngGridEventColumns', function (e) {
        setTimeout(function () {
            $('.ngHeaderText').tooltip({ container: 'body' });
        }, 250);
    });
};