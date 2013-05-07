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
            name: "Mes congés",
            searcher: false
        },
        "admin-conges": { 
            name: "Gestion des congés",
            searcher: "admin-conges"
        },
        activite: { 
            name: "Mon activité",
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
        { id: 'RTTE', libelle: 'RTT employeur', shortlibelle: 'RTT Empl.' },
        { id: 'RTT', libelle: 'RTT' },
        { id: 'CP_ANT', libelle: 'CP Anticipé' , shortlibelle: 'CP ant.'},
        { id: 'AE', libelle: 'Absence exceptionnelle', shortlibelle: 'Abs. exp.' }
    ];
    $rootScope.motifsCongesExcep = [
        { id: 'CS', libelle: 'Sans solde' },
        { id: 'FOR', libelle: 'Formation' },
        { id: 'INT', libelle: 'Intercontrat' },
        { id: 'DEL', libelle: 'Délégation DP, CE' },
        { id: 'MAR', libelle: 'Mariage' },
        { id: 'NAI', libelle: 'Naissance (3 jours)' },
        { id: 'PAT', libelle: 'Paternité (9 jours ouvrés)' },
        { id: 'MAT', libelle: 'Maternité' },
        { id: 'DEM', libelle: 'Déménagement (1 jour par an)' },
        { id: 'ENF', libelle: 'Enfant malade (3 jours par an)' },
        { id: 'PAO', libelle: 'Congés pathologique' },
        { id: 'MA', libelle: 'Maladie' },
        { id: 'DC', libelle: 'Décès ascendants, descendants, collatéraux' }
        
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
    $rootScope.infos = window.config.infos;
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
    $rootScope.error = null;
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
                $rootScope.error = true;
                return;
            }
            $rootScope.connected = true;
            $rootScope.username = response.prenom;
            $rootScope.role = response.role;
            $rootScope.infos = response.infos;
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
        $scope.currentUser = row;
        $scope.editUser.$setPristine();
        $scope.currentUserSaved = angular.copy($scope.currentUser);
        $scope.edition = 2;
        $scope.mode = "Edition";
        $scope.lblMode = "Modification de "; // +$scope.currentUser.nom + " " + $scope.currentUser.prenom;
    }

    $scope.delete = function (row) {
        var btns = [{ label: 'Oui', result: 'yes', cssClass: 'btn-primary' }, { label: 'Non', result: 'no' }];
        var msgbox = $dialog.messageBox('Suppression d\'un utilisateur', 'Etes-vous sûr de supprimer ' + row.prenom + ' ' + row.nom + '?', btns);
        msgbox.open().then(function(result){
            if (result === 'yes') {
                UsersService.remove(row, function (err) {
                    var index = $rootScope.users.indexOf(row);
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

    /*$scope.$on('search', function (event, data) {
        if (data.searcher == "users") {
            $scope.filterOptions.filterText = data.search;
        }
    });*/
    $scope.$on('search', function (event, data) {
        if (data.searcher == "users") {
            $scope.filterOptions = {
                filterText: data.search,
                useExternalFilter: false
            };
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
            { field: 'id', displayName: 'Matricule', width: 55, headerCellTemplate: myHeaderCellTemplate },
            { field: 'nom', displayName: 'Nom', headerCellTemplate: myHeaderCellTemplate },
            { field: 'prenom', displayName: 'Prénom', headerCellTemplate: myHeaderCellTemplate },
            { field: 'role', displayName: 'Rôle', cellFilter: "role", width: 60, headerCellTemplate: myHeaderCellTemplate },
            { field: 'cp', displayName: 'CP aquis', width: 69, headerCellTemplate: myHeaderCellTemplate },
            { field: 'cp_ant', displayName: 'CP en cours', width: 69, headerCellTemplate: myHeaderCellTemplate },
            { field: 'rtt', displayName: 'RTT', width: 60, headerCellTemplate: myHeaderCellTemplate },
            { field: '', cellTemplate: $.trim($('#actionRowTmplEdit').html()), width: 15, headerCellTemplate: myHeaderCellTemplate },
            { field: '', cellTemplate: $.trim($('#actionRowTmplDel').html()), width: 15, headerCellTemplate: myHeaderCellTemplate }
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

    $scope.motifsConges = angular.copy($rootScope.motifsConges);
    for (var i = 0, l = $scope.motifsConges.length; i < l; i++) {
        if ($scope.motifsConges[i].id == 'RTTE') {
            $scope.motifsConges.splice(i, 1);
            break;
        }
    }

    $scope.showMatricule = false;

    $scope.dateOptionsDebut = {
        dateFormat: 'dd/mm/yy',
        changeYear: true,
        changeMonth: true,
        yearRange: '0:+1Y',
        minDate: '0'
    };
    $scope.dateOptionsFin = {
        dateFormat: 'dd/mm/yy',
        changeYear: true,
        changeMonth: true,
        yearRange: '0:+1Y',
        minDate: '0'
    };
    $scope.$watch('currentConges.debut.date', function(newValue){
        $scope.dateOptionsFin.minDate = newValue;
    });

    var user = UsersService.get({ id: 0 }, function (retour) {
        $scope.cp = user.cp;
        $scope.cp_ant = user.cp_ant;
        $scope.rtt = user.rtt;
    });

    $scope.create = function () {
        $rootScope.error = null;
        $scope.editConges.$setPristine();
        $scope.currentConges = {
            etat: 1,
            debut: {
                type: 0
            },
            fin: {
                type: 1
            }
        };
        $scope.edition = 1;
        $scope.mode = "Création";
        $scope.lblMode = "Nouvelle demande de congés";
    }

    $scope.cancel = function () {
        $rootScope.error = null;
        $scope.edition = 0;
        $.extend($scope.currentConges, $scope.currentCongesSaved);
    }

    $scope.edit = function (row) {
        $rootScope.error = null;
        $scope.currentConges = row;
        $scope.editConges.$setPristine();
        $scope.currentCongesSaved = angular.copy($scope.currentConges);
        $scope.edition = 2;
        $scope.mode = "Edition";
        $scope.lblMode = "Modification d'une demande de congés";
    }

    $scope.delete = function (row) {
        var btns = [{ label: 'Oui', result: 'yes', cssClass: 'btn-primary' }, { label: 'Non', result: 'no' }];
        var msgbox = $dialog.messageBox('Suppression d\'un congé', 'Etes-vous sûr de supprimer la demande de congés ?', btns);
        msgbox.open().then(function(result){
            if (result === 'yes') {
                CongesService.remove(row).then(function (reponse) {
                    $rootScope.error = null;
                    var index = $rootScope.conges.indexOf(row);
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
        CongesService.save(conges, $scope.edition == 1).then(function (reponse) {
            $rootScope.error = null;
            if ($scope.edition == 1) {
                $rootScope.infos.nbCongesVal++;
            }
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

    $scope.selectUserOptions = {
        query: function (options) {
            options.callback({
                more: false,
                results: [
                ]
            });
        },
        initSelection: function (e, d, f) {
        }
    };
}

function CongesGauges($scope, $rootScope) {
    /*$scope.cp = 22;
    $scope.cpacc = 7.25;  
    $scope.rtt = 15;*/
}

// Contrôleur de la grille des congés
function CongesGrid($scope, $rootScope, CongesService, $timeout) {

    $scope.filterOptions = {
        filterText: "",
        useExternalFilter: false,
        filterRow: null
    };

    $scope.pagingOptions = {
        pageSizes: [25, 50, 100],
        pageSize: 50,
        totalServerItems: 0,
        currentPage: 1
    };

    $rootScope.conges = [];

    CongesService.list().then(function (conges) {
        $rootScope.conges = conges;
    });
    
    setTimeout(function () {
        $(".tabbable").each(function () {
            $(this).scope().select = (function (select) {
                return function (e) {
                    select.apply(this, arguments);
                    if(e.heading == "Tous mes congés à venir"){
                        updateFilter(null);
                    }
                    else if (e.heading == "Congés en attente de validation") {
                        updateFilter(1);
                    }
                    else if (e.heading == "Congés validés") {
                        updateFilter(2);
                    }
                    else {
                        updateFilter(3);
                    }
                };
            })($(this).scope().select)
        });
    }, 250);
    
    function updateFilter(etat){
        $timeout(function(){
            if(etat){
                $scope.gridOptionsConges.filterOptions.filterRow = {etat: etat};
            }
            else{
                $scope.gridOptionsConges.filterOptions.filterRow = null;
            }
        },0);
    }

    var myHeaderCellTemplate = $.trim($('#headerTmpl').html());
    var justificationCellTemplate = $.trim($('#justificationTmpl').html());

    $scope.gridOptionsConges = {
        data: 'conges',
        columnDefs: [
            { field: '', displayName: '', width: 22, cellTemplate: '<span class="etatConges {{cssConges[row.etat]}}">&nbsp;</span>', resizable: false },
            { field: 'debut', displayName: 'Date de défut', width: 160, cellFilter: "momentCongesDebut:'DD/MM/YYYY'", headerCellTemplate: myHeaderCellTemplate, resizable: false, sort: 'debut.date' },
            { field: 'fin', displayName: 'Date de fin', width: 160, cellFilter: "momentCongesFin:'DD/MM/YYYY'", headerCellTemplate: myHeaderCellTemplate, resizable: false, sort: 'fin.date' },
            { field: 'duree', displayName: 'Duree', width: 35, headerCellTemplate: myHeaderCellTemplate, resizable: false },
            { field: 'motif', displayName: 'Modif', width: 65, cellFilter: "motifCongesShort", headerCellTemplate: myHeaderCellTemplate, resizable: false },
            { field: 'etat', displayName: 'Etat', width: 165, cellFilter: "etatConges", headerCellTemplate: myHeaderCellTemplate, resizable: false },
            { field: 'justification', displayName: 'Justification', headerCellTemplate: myHeaderCellTemplate, cellTemplate: justificationCellTemplate, resizable: false },
            { field: '', cellTemplate: $.trim($('#actionRowTmplEdit').html()), width: 15, headerCellTemplate: myHeaderCellTemplate },
            { field: '', cellTemplate: $.trim($('#actionRowTmplDel').html()), width: 15, headerCellTemplate: myHeaderCellTemplate }
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

function CongesAdmin($scope, $rootScope, $dialog, CongesAdminService, UsersService) {
    $scope.edition = 0;
    $scope.mode = "";
    $scope.lblMode = "";
    $scope.currentConges = {};
    $scope.currentCongesSaved = null;

    $scope.showMatricule = true;

    $scope.dateOptionsDebut = {
        dateFormat: 'dd/mm/yy',
        changeYear: true,
        changeMonth: true,
        yearRange: '-2Y:+1Y'
    };
    $scope.dateOptionsFin = {
        dateFormat: 'dd/mm/yy',
        changeYear: true,
        changeMonth: true,
        yearRange: '-2Y:+1Y'
    };
    
    $scope.$watch('currentConges.debut.date', function(newValue){
        $scope.dateOptionsFin.minDate = newValue;
    });
    
    /*setTimeout(function () {
        $(".tabbable").each(function () {
            $(this).scope().select = (function (select) {
                return function (e) {
                    select.apply(this, arguments);
                    if (e.heading == "Congés en attente de validation") {
                        $timeout(layoutPlugin1.updateGridLayout, 0);
                    }
                    else if (e.heading == "Congés validés") {
                        $timeout(layoutPlugin2.updateGridLayout, 0);
                    }
                    else {
                        $timeout(layoutPlugin3.updateGridLayout, 0);
                    }
                };
            })($(this).scope().select)
        });
        updateLayout();
    }, 250);*/

    $scope.accepter = function (row) {
        $scope.currentConges = row;
        if ($scope.currentConges.etat == 2 || $scope.currentConges.etat == 3) return;
        var conges = angular.copy($scope.currentConges);
        conges.etat = 2;
        var msg = 'Etes-vous sûr de vouloir valider la demande de congés ?';
        var btns = [{ label: 'Oui', result: 'yes' , cssClass: 'btn-primary'}, { label: 'Non', result: 'no' }];
        var msgbox = $dialog.messageBox('Validation d\'un congé', msg, btns);
        msgbox.open().then(function (result) {
            if (result === 'yes') {
                CongesAdminService.updateEtat(conges, false).then(function (reponse) {
                    $rootScope.error = null;
                    $rootScope.infos.nbCongesVal--;
                    $scope.currentConges.etat = 2;
                    var index = $rootScope.congesAvalider.indexOf(row);
                    if (index > -1) {
                        $rootScope.congesAvalider.splice(index, 1);
                    }
                    else {
                        index = $rootScope.congesRefuser.indexOf(row);
                        if (index > -1) {
                            $rootScope.congesRefuser.splice(index, 1);
                        }
                    }
                    $rootScope.congesValider.push(row);
                });
            }
        });
    };
    $scope.refuser = function (row) {
        $scope.currentConges = row;
        if ($scope.currentConges.etat == 3) return;
        var conges = angular.copy($scope.currentConges);
        conges.etat = 3;
        var btns = [{ label: 'Oui', result: 'yes', cssClass: 'btn-primary' }, { label: 'Non', result: 'no' }];
        var msgbox = $dialog.messageBox('Refus d\'un congé', 'Etes-vous sûr de vouloir refuser la demande de congés ?', btns);
        msgbox.open().then(function (result) {
            if (result === 'yes') {
                CongesAdminService.updateEtat(conges, false).then(function (reponse) {
                    $rootScope.error = null;
                    $rootScope.infos.nbCongesVal--;
                    $scope.currentConges.etat = 3;
                    var index = $rootScope.congesAvalider.indexOf(row);
                    if (index > -1) {
                        $rootScope.congesAvalider.splice(index, 1);
                    }
                    else {
                        index = $rootScope.congesValider.indexOf(row);
                        if (index > -1) {
                            $rootScope.congesValider.splice(index, 1);
                        }
                    }
                    $rootScope.congesRefuser.push(row);
                });
            }
        });
    };

    $scope.create = function () {
        $rootScope.error = null;
        $scope.editConges.$setPristine();
        $scope.currentConges = {
            typeuser: 1,
            etat: 2,
            debut: {
                type: 0
            },
            fin: {
                type: 1
            }
        };
        $scope.edition = 1;
        $scope.mode = "Création";
        $scope.lblMode = "Nouveau congé de régulation";
    }

    $scope.cancel = function () {
        $rootScope.error = null;
        $scope.edition = 0;
        $.extend($scope.currentConges, $scope.currentCongesSaved);
    }

    $scope.edit = function (row) {
        $rootScope.error = null;
        $scope.currentConges = row;
        $scope.editConges.$setPristine();
        $scope.currentCongesSaved = angular.copy($scope.currentConges);
        $scope.edition = 2;
        $scope.mode = "Edition";
        $scope.lblMode = "Modification d'un congé";
        $scope.dateOptionsFin.minDate = $scope.currentConges.debut.date;
    }

    $scope.delete = function (row) {
        var btns = [{ label: 'Oui', result: 'yes', cssClass: 'btn-primary' }, { label: 'Non', result: 'no' }];
        var msgbox = $dialog.messageBox('Suppression d\'un congé', 'Etes-vous sûr de supprimer la demande de congés ?', btns);
        msgbox.open().then(function (result) {
            if (result === 'yes') {
                CongesAdminService.remove(row).then(function (reponse) {
                    var index = $rootScope.congesAvalider.indexOf(row);
                    if (index > -1) {
                        $rootScope.congesAvalider.splice(index, 1);
                    }
                    else {
                        index = $rootScope.congesValider.indexOf(row);
                        if (index > -1) {
                            $rootScope.congesValider.splice(index, 1);
                        }
                        else {
                            index = $rootScope.congesRefuser.indexOf(row);
                            if (index > -1) {
                                $rootScope.congesRefuser.splice(index, 1);
                            }
                        }
                    }
                });
            }
        });
    }

    $scope.isEditable = function (currentConges) {
        return currentConges.etat != 3;
    };

    $scope.isUnchanged = function (currentConges) {
        $scope.haschanged = angular.equals(currentConges, $scope.currentCongesSaved);
        return
    };


    $scope.save = function (currentConges) {
        var conges = angular.copy(currentConges);
        CongesAdminService.save(conges, $scope.edition == 1).then(function (reponse) {
            $rootScope.error = null;   
            if (currentConges.typeuser == 2) {     
                currentConges.user = conges.user;
            }
            if (reponse.id) {
                currentConges.id = reponse.id;
            }
            if (reponse.duree) {
                currentConges.duree = reponse.duree;
            }
            if ($scope.edition == 1) {
                $rootScope.congesValider.push(currentConges);
            }
            $scope.edition = 0;
            $scope.currentConges = null;
        });
    }
    $scope.selectUserOptions = {
        placeholder: "Rechercher un utilisateur",
        minimumInputLength: 1,
        query: function(options){
            var type = isNaN(options.term) ? "text" : "id";
            $rootScope.$apply(function () {
                UsersService.search({ type: type, search: options.term }).then(function (result) {
                    options.callback({
                        more: false,
                        results: result
                    });
                });
            });
        },
        data: [{id:2, nom: "tous", prenom: ""}],
        initSelection: function(e,d,f){
        },
        formatResult: format, // omitted for brevity, see the source of this page
        formatSelection: format, // omitted for brevity, see the source of this page
        dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
        escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
    };

    function format(user) {
        return user.nom.toLowerCase()+ " " + user.prenom;
    }
}

// Contrôleur de la grille des congés
function CongesAdminGrid($scope, $rootScope, $timeout, CongesAdminService) {

    $scope.filterOptions = {
        filterText: "",
        useExternalFilter: false
    };

    $scope.$on('search', function (event, data) {
        if (data.searcher == "admin-conges") {
            $scope.gridOptionsConges.filterOptions.filterText = data.search;
            $scope.gridOptionsCongesVal.filterOptions.filterText = data.search;
            $scope.gridOptionsCongesRef.filterOptions.filterText = data.search;
        }
    });
    /*setTimeout(function () {
        $(".tabbable").each(function () {
            $(this).scope().select = (function (select) {
                return function (e) {
                    select.apply(this, arguments);
                    if (e.heading == "Congés en attente de validation") {
                        $timeout(layoutPlugin1.updateGridLayout, 0);
                    }
                    else if (e.heading == "Congés validés") {
                        $timeout(layoutPlugin2.updateGridLayout, 0);
                    }
                    else {
                        $timeout(layoutPlugin3.updateGridLayout, 0);
                    }
                };
            })($(this).scope().select)
        });
        updateLayout();
    }, 250);*/

    function updateLayout() {
        /*layoutPlugin1.updateGridLayout();
        layoutPlugin2.updateGridLayout();
        layoutPlugin3.updateGridLayout();*/
    };

    $scope.pagingOptions = {
        pageSizes: [25, 50, 100],
        pageSize: 50,
        totalServerItems: 0,
        currentPage: 1
    };

    CongesAdminService.list({etat: 1}).then(function (conges) {
        $rootScope.congesAvalider = conges;
    });

    CongesAdminService.list({ etat: 2 }).then(function (conges) {
        $rootScope.congesValider = conges;
    });

    CongesAdminService.list({etat: 3}).then(function (conges) {
        $rootScope.congesRefuser = conges;
    });  

    $scope.etatOptions = {
        type: 1
    };


    var myHeaderCellTemplate = $.trim($('#headerTmpl').html());
    var matriculeCellTemplate = $.trim($('#matriculeTmpl').html());
    var justificationCellTemplate = $.trim($('#justificationTmpl').html());
    var validationCellTemplate = $.trim($('#validationTmpl').html());
    /*var layoutPlugin1 = new ngGridLayoutPlugin();
    var layoutPlugin2 = new ngGridLayoutPlugin();
    var layoutPlugin3 = new ngGridLayoutPlugin();*/

    var defauts = {
        columnDefs: [
            { field: 'user', displayName: 'Utilisateur', width: 85, cellTemplate: matriculeCellTemplate, resizable: false },
            { field: 'debut', displayName: 'Date de défut', width: 130, cellFilter: "momentCongesDebut:'DD/MM/YYYY'", headerCellTemplate: myHeaderCellTemplate, resizable: false, sort: 'debut.date' },
            { field: 'fin', displayName: 'Date de fin', width: 130, cellFilter: "momentCongesFin:'DD/MM/YYYY'", headerCellTemplate: myHeaderCellTemplate, resizable: false, sort: 'fin.date' },
            { field: 'duree', displayName: 'Duree', width: 60, headerCellTemplate: myHeaderCellTemplate, resizable: false },
            { field: 'motif', displayName: 'Modif', width: 60, cellFilter: "motifCongesShort", headerCellTemplate: myHeaderCellTemplate, resizable: false },
            { field: 'justification', displayName: 'Justification', headerCellTemplate: myHeaderCellTemplate, cellTemplate: justificationCellTemplate, resizable: false },
            { field: '', displayName: 'Validation', width: 85, headerCellTemplate: myHeaderCellTemplate, cellTemplate: validationCellTemplate, resizable: false },
            { field: '', cellTemplate: $.trim($('#actionRowTmplEdit').html()), width: 15, headerCellTemplate: myHeaderCellTemplate },
            { field: '', cellTemplate: $.trim($('#actionRowTmplDel').html()), width: 15, headerCellTemplate: myHeaderCellTemplate }
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
    $scope.gridOptionsConges = angular.extend({
        data: "congesAvalider"/*,
        plugins: [layoutPlugin1]*/
    }, defauts);
    $scope.gridOptionsCongesVal = angular.extend({
        data: "congesValider"/*,
        plugins: [layoutPlugin2]*/
    }, defauts);
    $scope.gridOptionsCongesRef = angular.extend({
        data: "congesRefuser"/*,
        plugins: [layoutPlugin3]*/
    }, defauts);
    
    
    $scope.$on('ngGridEventColumns', function (e) {
        setTimeout(function () {
            $('.matriculeCell>span').tooltip({ container: 'body' });
        }, 250);
    });
};

function ActiviteMain($scope, $rootScope, UsersService, CongesService, $timeout, $filter, $compile) {

    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $rootScope.typeActivite = angular.copy($rootScope.motifsConges);
    $rootScope.typeActivite.splice(0, 0, { id: 'JT', libelle: 'Journée travaillée' });

    /* event source that contains custom events on the scope */
    $scope.eventsA = [];
      /*{ title: 'All Day Event', start: new Date(y, m, 1) },
      { title: 'Long Event', start: new Date(y, m, d - 5), end: new Date(y, m, d - 2) },
      { id: 999, title: 'Repeating Event', start: new Date(y, m, d - 3, 16, 0), allDay: false },
      { id: 999, title: 'Repeating Event', start: new Date(y, m, d + 4, 16, 0), allDay: false },
      { title: 'Birthday Party', start: new Date(y, m, d + 1, 19, 0), end: new Date(y, m, d + 1, 22, 30), allDay: false },
      { title: 'Click for Google', start: new Date(y, m, 28), end: new Date(y, m, 29) }
    ];*/
    /* event source that calls a function on every view switch */
    $scope.eventsF = function (start, end, callback) {
        var s = new Date(start).getTime() / 1000;
        var e = new Date(end).getTime() / 1000;
        var m = new Date(start).getMonth();
        $timeout(function(){
        CongesService.list({
            start: start,
            end: end
        }).then(function (conges) {
            $scope.conges = conges;
            $scope.indexEvents = [];
            $scope.events = [];
            
            var cong = $scope.conges.shift();
            var lastCong;
            var inConges = false;
            var current = new moment(start);
            if(current.date() != 1){
                while (current.date() != 1){
                    if(inConges && lastCong && lastCong.fin.date.getDate() <= current.date()){
                        inConges = false;
                    }
                    if(cong && cong.debut.date.getDate() == current.date()){
                        inConges = true;
                        cong.type = cong.motif;
                        $scope.events.push({ title: $filter('motifCongesShort')(cong.motif), start: cong.debut.date, end: cong.fin.date, className: ['sleeping'], data: cong });
                        $scope.indexEvents[cong.debut.date.getDate()] = $scope.events.length - 1;
                        $scope.indexEvents[cong.fin.date.getDate()] = $scope.events.length - 1;
                        lastCong = angular.copy(cong);
                        cong = $scope.conges.shift();
                    }
                    current = current.add('days', 1);
                }
            }
            if(inConges && lastCong && lastCong.fin.date.getDate() <= current.date()){
                        inConges = false;
            }
            if(cong && cong.debut.date.getDate() == current.date()){
                inConges = true;
                cong.type = cong.motif;
                  $scope.events.push({ title: $filter('motifCongesShort')(cong.motif), start: cong.debut.date, end: cong.fin.date, className: ['sleeping'], data: cong });
                  $scope.indexEvents[cong.debut.date.getDate()] = $scope.events.length - 1;
                  $scope.indexEvents[cong.fin.date.getDate()] = $scope.events.length - 1;
                  lastCong = angular.copy(cong);
                  cong = $scope.conges.shift();
            }
            if(current.format("d") != 0 && current.format("d") != 6 && !inConges && !$scope.indexEvents[current.date()]){
                $scope.events.push({ title: "Journée travaillée", start: new Date(current.toDate()), className: ['worked'], data: { type: 'JT' } });
                $scope.indexEvents[current.date()] = $scope.events.length - 1;
            }
            current = current.add('days', 1);
            while (current.date() != 1){
                //if(current.format("d") != 0 && current.format("d") != 6){
                    if(inConges && lastCong && lastCong.fin.date.getDate() <= current.date()){
                        inConges = false;
                    }
                    if(cong && cong.debut.date.getDate() == current.date()){
                        inConges = true;
                          cong.type = cong.motif;
                          $scope.events.push({ title: $filter('motifCongesShort')(cong.motif), start: cong.debut.date, end: cong.fin.date, className: ['sleeping'], data: cong });
                          $scope.indexEvents[cong.debut.date.getDate()] = $scope.events.length - 1;
                          $scope.indexEvents[cong.fin.date.getDate()] = $scope.events.length - 1;
                          lastCong = angular.copy(cong);
                          cong = $scope.conges.shift();
                    }
                    if(current.format("d") != 0 && current.format("d") != 6 && !inConges && !$scope.indexEvents[current.date()]){
                        $scope.events.push({ title: "Journée travaillée", start: new Date(current.toDate()), className: ['worked'], data: {type: 'JT'} });
                        $scope.indexEvents[current.date()] = $scope.events.length - 1;
                    }
                //}
                current = current.add('days', 1);
            }
            //var events = [{ title: 'Feed Me ' + m, start: s + (50000), end: s + (100000), allDay: false, className: ['customFeed'] }];
            callback($scope.events);
        });
        });
    };
    
    $scope.eventRender = function(event, contener){
    }
    /* alert on eventClick */
    $scope.alertEventOnClick = function (date, allDay, jsEvent, view) {
        $scope.$apply(function () {
            $scope.eventSelectionne = new moment(date).format('LLLL');
        });
    };
    $scope.eventOnClick = function (calEvent, jsEvent, view) {
        $scope.$apply(function () {
            $scope.currentDate = calEvent.data;
            $scope.eventSelectionne = new moment(calEvent.start).format('LLLL');
        });
    };
    
    
    $scope.eventSources = [$scope.eventsA, $scope.eventsF];
    /* alert on Drop */
    $scope.alertOnDrop = function (event, dayDelta, minuteDelta, allDay, revertFunc, jsEvent, ui, view) {
        return false;
        $scope.$apply(function () {
            $scope.alertMessage = ('Event Droped to make dayDelta ' + dayDelta);
        });
    };
    /* alert on Resize */
    $scope.alertOnResize = function (event, dayDelta, minuteDelta, revertFunc, jsEvent, ui, view) {
        $scope.$apply(function () {
            $scope.alertMessage = ('Event Resized to make dayDelta ' + minuteDelta);
        });
    };
    /* add and removes an event source of choice */
    $scope.addRemoveEventSource = function (sources, source) {
        var canAdd = 0;
        angular.forEach(sources, function (value, key) {
            if (sources[key] === source) {
                sources.splice(key, 1);
                canAdd = 1;
            }
        });
        if (canAdd === 0) {
            sources.push(source);
        }
    };
    /* add custom event*/
    $scope.addEvent = function () {
        $scope.events.push({
            title: 'Open Sesame',
            start: new Date(y, m, 28),
            end: new Date(y, m, 29),
            className: ['openSesame']
        });
    };
    /* remove event */
    $scope.remove = function (index) {
        $scope.events.splice(index, 1);
    };
    /* Change View */
    $scope.changeView = function (view) {
        $scope.myCalendar.fullCalendar('changeView', view);
    };
   

    var lastValidDate = new Date(new Date().getFullYear(), new Date().getMonth(),1)
    /* config object */
    $scope.uiConfig = {
        calendar: angular.extend({
            editable: true,
            header: {
                //left: 'month basicWeek basicDay agendaWeek agendaDay',
                //center: 'title',
                right: 'today prev,next'
            },
            viewDisplay: function(view) {
                if (view.start >= lastValidDate) {
                    //header.disableButton('prev');
                    $(".fc-button-next").attr("disabled", "disabled");
                } else {
                    //header.enableButton('prev');
                    $(".fc-button-next").removeAttr("disabled");
                }
            },
            dayClick: $scope.alertEventOnClick,
            eventDrop: $scope.alertOnDrop,
            eventResize: $scope.alertOnResize,
            eventClick: $scope.eventOnClick,
            eventRender: function(event, element) { 
                element.addClass("toto").attr("rel","popover").popover({ 
                    html : true,
                     
                    content: function(e) {
                          return $compile($.trim($('#popover_content_wrapper').html()))($scope);
                        }
                    }).click(function(e){
                        var elm = $(this);
                        $(".popover.in").prev().each(function(i){
                            var $this = $(this);
                            if(!$this.is(elm)){
                                $this.popover('hide');
                            }
                        });
                    }); 
                //return $(template);
            }
        }, jQuery.fullCalendar)
    };
    $scope.popClose = function(e){
        $('[rel=popover]').popover('hide');
    }
    
    /*setTimeout(function(){
        $('[rel=popover]').popover({ 
            html : true,
             
            content: function() {
                  return $compile($.trim($('#popover_content_wrapper').html()))($scope);
                }
            }).click(function(e){
                var elm = $(this);
                $(".popover.in").prev().each(function(i){
                    var $this = $(this);
                    if(!$this.is(elm)){
                        $this.popover('hide');
                    }
                });
            });
    },500);*/
}