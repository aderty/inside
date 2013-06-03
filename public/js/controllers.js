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
        },
        "admin-activite": {
            name: "Gestion des activités",
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

            $rootScope.typeActivite = angular.copy($rootScope.motifsConges);
            $rootScope.typeActivite.push.apply($rootScope.typeActivite, $rootScope.typeActiviteWeekend);
            $rootScope.typeActivite.push.apply($rootScope.typeActivite, $rootScope.typeActiviteAstreinte);
            $rootScope.typeActivite.pop();
            $rootScope.typeActivite.push.apply($rootScope.typeActivite, $rootScope.typeActiviteTravaille);
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
        template: $.trim($("#passwordTmpl").html()),
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

// Contrôleur de login
function LoginController($scope, $rootScope, LoginService, $dialog) {
    $scope.user = {};
    $rootScope.error = null;
    $scope.connect = function(user) {
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
        LoginService.login(user.email, user.pwd, { keep: user.keep }, function(response) {
            if (!response) {
                $scope.user = {};
                $scope.login.$setPristine();
                $rootScope.connected = false;
                $rootScope.error = true;
                return;
            }
            $rootScope.initConnected(response);
        });
    };
    // Inlined template for demo 
    $scope.opts = {
        backdrop: true,
        keyboard: true,
        backdropClick: true,
        template: $.trim($("#passwordLostTmpl").html()),
        controller: 'DialogPasswordLost'
    };
    $scope.passwordLost = function() {
        $rootScope.error = "";
        var d = $dialog.dialog($scope.opts);
        d.open().then(function(result) {
            if (result) {
            }
        });
    };
}

// Contrôleur de la popup de modification de password
function DialogPasswordLost($scope, $rootScope, dialog, LoginService) {
    $rootScope.error = "";
    $scope.password = {
        etat: 0
    };
    $scope.close = function() {
        $rootScope.error = "";
        dialog.close();
    };
    $scope.save = function(password) {
        if ($scope.pwdLost.$invalid) {
            return;
        }
        LoginService.passwordLost(password).then(function (response) {
            if (response && password.etat == 2) {
                dialog.close();
                $rootScope.initConnected(response);
            }
        });
    };
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
    };

    $scope.cancel = function () {
        $scope.error = null;
        $scope.edition = 0;
        $.extend($scope.currentUser, $scope.currentUserSaved);
    };

    $scope.edit = function (row) {
        $scope.error = null;
        $scope.currentUser = row;
        $scope.editUser.$setPristine();
        $scope.currentUserSaved = angular.copy($scope.currentUser);
        $scope.edition = 2;
        $scope.mode = "Edition";
        $scope.lblMode = "Modification de ";
    };

    $scope['delete'] = function (row) {
        var btns = [{ label: 'Oui', result: 'yes', cssClass: 'btn-primary' }, { label: 'Non', result: 'no' }];
        var msgbox = $dialog.messageBox('Suppression d\'un utilisateur', 'Etes-vous sûr de supprimer ' + row.prenom + ' ' + row.nom + '?', btns);
        msgbox.open().then(function (result) {
            if (result === 'yes') {
                UsersService.remove(row, function (err) {
                    var index = $rootScope.users.indexOf(row);
                    $rootScope.users.splice(index, 1);
                });
            }
        });
    };

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
    };
    
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
            { field: 'cp', displayName: 'CP disponibles', width: 69, headerCellTemplate: myHeaderCellTemplate },
            { field: 'cp_ant', displayName: 'CP en cours', width: 69, headerCellTemplate: myHeaderCellTemplate },
            { field: 'rtt', displayName: 'RC', width: 60, headerCellTemplate: myHeaderCellTemplate },
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
        if ($scope.motifsConges[i].id == 'RCE') {
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

    $scope.user = UsersService.get({ id: 0 }, function(retour) {
        $scope.cp = $scope.user.cp;
        $scope.cp_ant = $scope.user.cp_ant;
        $scope.rtt = $scope.user.rtt;
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

    $scope['delete'] = function (row) {
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

    // Inlined template for demo 
    $scope.opts = {
        backdrop: true,
        keyboard: true,
        backdropClick: true,
        template: $.trim($("#refusTmpl").html()),
        controller: 'DialogConges'
    };

    $scope.refuser = function (row) {
        $scope.currentConges = row;
        if ($scope.currentConges.etat == 3) return;
        var conges = angular.copy($scope.currentConges);
        conges.etat = 3;
        $rootScope.dialogModel = conges;
        //var btns = [{ label: 'Oui', result: 'yes', cssClass: 'btn-primary' }, { label: 'Non', result: 'no' }];
        //var msgbox = $dialog.messageBox('Refus d\'un congé', 'Etes-vous sûr de vouloir refuser la demande de congés ?', btns);
        var msgbox = $dialog.dialog($scope.opts);
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

    $scope['delete'] = function (row) {
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

// Contrôleur de la popup de modification de password
function DialogConges($scope, $rootScope, dialog) {
    $scope.close = function (param) {
        dialog.close(param);
    };
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
        data: "congesAvalider"
    }, defauts);
    $scope.gridOptionsCongesVal = angular.extend({
        data: "congesValider"
    }, defauts);
    $scope.gridOptionsCongesRef = angular.extend({
        data: "congesRefuser"
    }, defauts);
    
    
    $scope.$on('ngGridEventColumns', function (e) {
        setTimeout(function () {
            $('.matriculeCell>span').tooltip({ container: 'body' });
        }, 250);
    });
};

function ActiviteMain($scope, $rootScope, UsersService, ActiviteService, $timeout, $filter, $compile) {

    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    function businessDay(momentDate) {
        return momentDate.format("d") != 0 && momentDate.format("d") != 6;
    }

    $scope.user = UsersService.get({ id: 0 }, function (retour) {
    });

    $scope.eventSelectionne = null;
    $scope.events = [];
    $scope.successOperation = "";

    $scope.typeActivitePerso = [];

    $scope.refresh = function () {
        $scope.activiteCalendar.fullCalendar('refetchEvents');
    };
    var lastTimer;
    $scope.$watch('events', function(valeur) {
        if (lastTimer) clearTimeout(lastTimer);
        lastTimer = setTimeout(function() {
            $scope.$apply(function() {
                var event, hSup = 0, hAst = 0, hNuit = 0;
                // On ré-init les compteurs;
                $scope.typeActivitePerso = [];
                for (var i = 0, l = valeur.length; i < l; i++) {
                    event = valeur[i];
                    // Pas de compteur pas les weekend
                    if (event.data.type != 'WK') {
                        eventActivite(event.data.type, event.data.duree == 0 ? 1 : 0.5);
                        hSup += event.data.heuresSup;
                        hAst += event.data.heuresAstreinte;
                        hNuit += event.data.heuresNuit;
                    }
                }
                $scope.heuresSup = hSup;
                $scope.heuresAstreinte = hAst;
                $scope.heuresNuit = hNuit;
            });
        }, 100);
    }, true);
    function eventActivite(type, nb) {
        if (typeof nb == "undefined") {
            nb = 1;
        }
        var toDo = true;
        for (var i = 0, l = $scope.typeActivitePerso.length; i < l; i++) {
            if ($scope.typeActivitePerso[i].type == type) {
                toDo = false;
                $scope.typeActivitePerso[i].nb += nb;
            }
        }
        if (toDo) {
            $scope.typeActivitePerso.push({ type: type, libelle: $filter('motifConges')(type, $rootScope.typeActivite), nb: nb });
        }
    }

    $scope.load = function(callback) {
        $scope.eventSelectionne = null;

        ActiviteService.list({
            start: $scope.start,
            end: $scope.end
        }).then(function(activite) {
            $scope.activite = activite;
            $scope.indexEvents = [];
            $scope.events = [];
            $scope.successOperation = "";

            function startEventConges(current, skip) {
                inConges = true;
                var toDo = true;
                if (businessDay(current) && !skip) {
                    var data = angular.copy(cong);
                    data.start = true;
                    if (data.fin.date.getMonth() <= current.month() && data.fin.date.getDate() <= current.date()) {
                        data.end = true;
                    }
                    if (!data.end && data.debut.type == 0) {
                        data.duree = 0;
                    }
                    else if (!data.end && data.debut.type == 1) {
                        data.duree = 2;
                        var date = new Date(current.toDate());
                        date.setHours(8);
                        if (lastCong.fin.date.getMonth() == current.month() && data.fin.date.getDate() < current.date()) {
                            $scope.events.push({ title: "Journée travaillée", allDay: false, start: date, data: { type: 'JT', duree: 1, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0} });
                        }
                        date = new Date(current.toDate());
                        date.setHours(12);
                        $scope.events.push({ title: $filter('motifCongesShort')(data.type), start: date, data: data, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0 });
                        $scope.indexEvents[current.date()] = $scope.events.length - 1;
                        toDo = false;
                    }
                    /*if (data.debut.type == 0 && !data.end) {
                    data.duree = 0;
                    }*/
                    /*if (data.debut.type == 1 && !data.end) {
                    data.duree = 2;
                    }*/
                    else if (data.debut.type == 0 && data.end && data.fin.type == 0) {
                        data.duree = 1;
                        var date = new Date(current.toDate());
                        date.setHours(8);
                        $scope.events.push({ title: $filter('motifCongesShort')(data.type), start: date, data: data, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0 });
                        date = new Date(current.toDate());
                        date.setHours(12);
                        if ($scope.conges.length > 0 && $scope.conges[0].fin.date.getMonth() == current.month() && $scope.conges[0].fin.date.getDate() < current.date()) {
                            $scope.events.push({ title: "Journée travaillée", allDay: false, start: date, data: { type: 'JT', duree: 2, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0} });
                        }
                        toDo = false;
                    }
                    else if (data.debut.type == 1 && data.end && data.fin.type == 1) {
                        data.duree = 2;
                        var date = new Date(current.toDate());
                        date.setHours(8);
                        if (lastCong.fin.date.getMonth() == current.month() && data.fin.date.getDate() < current.date()) {
                            $scope.events.push({ title: "Journée travaillée", allDay: false, start: date, data: { type: 'JT', duree: 1, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0} });
                        }
                        date = new Date(current.toDate());
                        date.setHours(12);
                        $scope.events.push({ title: $filter('motifCongesShort')(data.type), start: date, data: data, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0 });
                        $scope.indexEvents[current.date()] = $scope.events.length - 1;
                        toDo = false;
                    }
                    else if (data.debut.type == 0 && data.end && data.fin.type == 1) {
                        data.duree = 0;
                    }
                    if (toDo) {
                        data.heuresSup = 0;
                        data.heuresAstreinte = 0;
                        data.heuresNuit = 0;
                        $scope.events.push({ title: $filter('motifCongesShort')(data.type), start: new Date(current.toDate()), data: data });
                        $scope.indexEvents[current.date()] = $scope.events.length - 1;
                    }
                }
                lastCong = angular.copy(cong);
                cong = $scope.conges.shift();
            }
            function inEventConges(current) {
                var data = angular.copy(lastCong);
                var toDo = true;
                if (data.fin.date.getMonth() <= current.month() && data.fin.date.getDate() <= current.date()) {
                    data.end = true;
                }
                if (!data.end) {
                    data.duree = 0;
                }
                if (data.end && data.fin.type == 0) {
                    data.duree = 1;
                    var date = new Date(current.toDate());
                    date.setHours(8);
                    data.heuresSup = 0;
                    data.heuresAstreinte = 0;
                    data.heuresNuit = 0;
                    $scope.events.push({ title: $filter('motifCongesShort')(data.type), start: date, data: data });
                    $scope.indexEvents[current.date()] = $scope.events.length - 1;
                    date = new Date(current.toDate());
                    date.setHours(12);
                    if (cong && cong.fin.date.getMonth() == current.month() && cong.fin.date.getDate() < current.date()) {
                        $scope.events.push({ title: "Journée travaillée", allDay: false, start: date, data: { type: 'JT', duree: 2, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0} });
                    }
                    toDo = false;
                }
                if (data.end && data.fin.type == 1) {
                    data.duree = 0;
                }
                if (toDo) {
                    data.heuresSup = 0;
                    data.heuresAstreinte = 0;
                    data.heuresNuit = 0;
                    $scope.events.push({ title: $filter('motifCongesShort')(data.type), start: new Date(current.toDate()), data: data });
                    $scope.indexEvents[current.date()] = $scope.events.length - 1;
                }
            }
            function endEventConges(current) {
                inConges = false;
            }
            function workEvent(current) {
                if (businessDay(current)) {
                    $scope.events.push({ title: "Journée travaillée", start: new Date(current.toDate()), data: { type: 'JT', duree: 0, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0} });
                }
                else {
                    $scope.events.push({ title: "Weekend", start: new Date(current.toDate()), data: { type: 'WK', duree: 0, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0} });
                }
                $scope.indexEvents[current.date()] = $scope.events.length - 1;
            }
            if ($scope.activite.etat > 0 && $scope.activite.activite.length > 0) {
                for (var i = 0, l = $scope.activite.activite.length; i < l; i++) {
                    $scope.events.push({ title: $scope.activite.activite[i].type, start: $scope.activite.activite[i].jour.date, data: $scope.activite.activite[i] });
                    $scope.indexEvents[$scope.activite.activite[i].jour.date] = $scope.events.length - 1;
                }
            }
            else {
                $scope.conges = $scope.activite.activite;
                var cong = $scope.conges.shift();
                var lastCong;
                var first = true;
                var inConges = false;
                var current = new moment($scope.start);

                // Si le calendrier commence avant le 1er -> on avance jusqu'au 1er en ajoutant les congés si présents
                if (current.date() != 1) {
                    while (current.date() != 1) {
                        /*if (inConges && businessDay(current)) {
                        inEventConges(current, true);
                        }*/
                        if (cong && cong.debut.date.getMonth() == current.month() && cong.debut.date.getDate() == current.date()) {
                            startEventConges(current, true);
                        }
                        if (inConges && lastCong && lastCong.fin.date <= current.toDate()) {
                            endEventConges(current);
                        }
                        current = current.add('days', 1);
                    }
                }
                // Traitement du 1er du mois à la fin du mois.
                while (current.date() != 1 || first) {
                    first = false; // On signale qu'on a démarré
                    if (inConges && businessDay(current)) {
                        // Dans une période de congés.
                        inEventConges(current);
                    }
                    if (cong && cong.debut.date.getMonth() == current.month() && cong.debut.date.getDate() == current.date()) {
                        // Au début d'une période de congés.
                        startEventConges(current);
                    }
                    if (inConges && lastCong && lastCong.fin.date.getMonth() <= current.month() && lastCong.fin.date.getDate() <= current.date()) {
                        // A la fin d'une période de congés.
                        endEventConges(current);
                    }
                    //if (!inConges && businessDay(current) && typeof $scope.indexEvents[current.date()] == "undefined") {
                    if (typeof $scope.indexEvents[current.date()] == "undefined") {
                        // Journée travaillée.
                        workEvent(current);
                    }
                    current = current.add('days', 1); // On incrément la date courante dans le mois.
                }
            }
            if (callback) {
                callback($scope.events);
            }
        });
    };

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

        $scope.start = start;
        $scope.end = end;
        if ($scope.isUpdating) {
            $scope.isUpdating = false;
            callback($scope.events);
        }
        else {
            $timeout(function () {
                $scope.load(callback);
                //var events = [{ title: 'Feed Me ' + m, start: s + (50000), end: s + (100000), allDay: false, className: ['customFeed'] }];
                //callback($scope.events);
            });
        }
    };

    $scope.eventRender = function(event, element) {
        // Si on affiche les mois suivant le mois actuel -> On n'affiche que les congés.
        if (viewStartDate > lastValidDate && event.data.type == "JT") {
            return false;
        }

        function indexOfEvent(start) {
            var index = 0, l = $scope.events.length;
            for (; index < l; index++) {
                if ($scope.events[index].start == start) return index;
            }
            return -1;
        }
        var eventScope = $scope.$new(true);
        angular.extend(eventScope, event);
        eventScope.typeActivite = $rootScope.typeActivite;
        if (event.data.type == "JF") {
            // Journée de type fériée
            eventScope.typeActiviteJour = $rootScope.typeActiviteAstreinte;
        }
        else if (businessDay(moment(event.start))) {
            // Journée de type semaine
            eventScope.typeActiviteJour = $rootScope.typeActiviteTravaille;
        }
        else {
            // Journée de type weekend
            eventScope.typeActiviteJour = $rootScope.typeActiviteWeekend;
        }
        eventScope.cssConges = $rootScope.cssConges;
        eventScope.valid = function(event) {
            eventScope.error = null;
            $('[rel=popover]').popover('hide');
            var lastDuree = eventScope.savedEvent.duree;
            if (this.data.duree == lastDuree) return;
            if (this.data.duree == 1) {
                var date = new Date(this.start);
                date.setHours(16);
                this.start.setHours(8);
                this.allDay = false;
                $scope.isUpdating = true;
                var index = indexOfEvent(this.start);
                $scope.events.splice(index + 1, 0, { title: 'Ap. midi', start: date, allDay: false, data: { type: this.data.type, jour: date, duree: 2} });
                $scope.activiteCalendar.fullCalendar('refetchEvents');
            }
            else if (this.data.duree == 2) {
                var date = new Date(this.start);
                date.setHours(8);
                this.start.setHours(16);
                this.allDay = false;
                $scope.isUpdating = true;
                var index = indexOfEvent(this.start);
                $scope.events.splice(index, 0, { title: 'Matin', start: date, allDay: false, data: { type: this.data.type, jour: date, duree: 1} });
                $scope.activiteCalendar.fullCalendar('refetchEvents');
            }
            else if (this.data.duree == 0 && lastDuree == 1) {
                this.allDay = true;
                $scope.isUpdating = true;
                var index = indexOfEvent(this.start);
                this.start.setHours(0);
                $scope.events.splice(index + 1, 1);
                $scope.activiteCalendar.fullCalendar('refetchEvents');
            }
            else if (this.data.duree == 0 && lastDuree == 2) {
                this.allDay = true;
                $scope.isUpdating = true;
                var index = indexOfEvent(this.start);
                this.start.setHours(0);
                $scope.events.splice(index - 1, 1);
                $scope.activiteCalendar.fullCalendar('refetchEvents');
            }
        }
        eventScope.cancel = function(event) {
            eventScope.error = null;
            $.extend(eventScope.data, eventScope.savedEvent);
            $('[rel=popover]').popover('hide');
        }
        eventScope.infos = function(data) {
            if (data.duree == 2) {
                return "Ap. midi";
            }
            if (data.duree == 1) {
                return "Matin";
            }
        };
        eventScope.hasHeuresAstreinte = function (data) {
            return data.heuresAstreinte > 0 || (!businessDay(moment(start)) && data.type == 'JT') || data.type == 'JF';
        };
        eventScope.$watch('data.type', function (newValue, oldValue) {
            if (oldValue && newValue == 'JT' && (oldValue == 'WK' || oldValue == 'JF')) {
                eventScope.data.heuresAstreinte = 7.5;
            }
        });
        return $compile($.trim($('#eventTmpl').html()))(eventScope)
            .attr("rel", "popover").popover({
            html: true,

            content: function(e) {
                // Jour férié, pas d'édition.
                if (eventScope.data.type == 'CP' || eventScope.data.type == 'CP_ANT' || eventScope.data.type == 'RC' || eventScope.data.type == 'RCE' || eventScope.data.type == 'AE') {
                    return false;
                }
                eventScope.savedEvent = angular.copy(eventScope.data);
                return $compile($.trim($('#popoverEventTmpl').html()))(eventScope);
            }
        }).click(function(e) {
            var elm = $(this);
            $(".popover.in").prev().each(function(i) {
                var $this = $(this);
                if (!$this.is(elm)) {
                    $this.scope().cancel();
                    $this.popover('hide');
                }
            });
        });
    };
    /* alert on eventClick */
    $scope.alertEventOnClick = function (date, allDay, jsEvent, view) {
        $scope.$apply(function () {
            $scope.eventSelectionne = new moment(date).format('dddd D MMMM YYYY');
        });
    };
    $scope.eventOnClick = function (calEvent, jsEvent, view) {
        $scope.$apply(function () {
            $scope.currentEvent = calEvent.data;
            $scope.eventSelectionne = new moment(calEvent.start).format('dddd D MMMM YYYY');
        });
    };

    $scope.closeSuccess = function () {
        $scope.successOperation = "";
    };

    $scope.save = function (events) {
        var activite = angular.copy($scope.activite);
        if (activite.etat > 1) return;
        var creation = activite.etat == -1 ? true : false;
        activite.activite = $.map(events, function (item, index) {
            return {
                jour: item.start,
                type: item.data.type,
                information: item.data.information,
                heuresSup: item.data.heuresSup,
                heuresAstreinte: item.data.heuresAstreinte,
                heuresNuit: item.data.heuresNuit
            };
        });

        ActiviteService.save(activite, creation).then(function (reponse) {
            if (reponse.success === true) {
                $scope.successOperation = "Activité enregistrée";
            }
        });
    };
    
    $scope.eventSources = [$scope.events, $scope.eventsF];
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
        $scope.activiteCalendar.fullCalendar('changeView', view);
    };
   

    var lastValidDate = new Date(new Date().getFullYear(), new Date().getMonth() + 3, 1),
    viewStartDate;
    /* config object */
    $scope.uiConfig = {
        calendar: angular.extend({
            editable: false,
            //readonly: true,
            header: {
                //left: 'month basicWeek basicDay agendaWeek agendaDay',
                //center: 'title',
                right: 'today prev,next'
            },
            viewDisplay: function (view) {
                $scope.start = view.start;
                $scope.end = view.end;

                viewStartDate = view.start;
                if (view.start > lastValidDate) {
                    // Calendrier dans le future -> Désactivation de la sauvegarde
                    $scope.future = true;
                } else {
                    // Calendrier dans le passé > 3 mois -> Désactivation de la sauvegarde
                    if (moment().diff(moment(view.start), 'months', true) > 3) {
                        $scope.future = true;
                    }
                    else {
                        $scope.future = false;
                    }
                }
            },
            dayClick: $scope.alertEventOnClick,
            eventDrop: $scope.alertOnDrop,
            eventResize: $scope.alertOnResize,
            eventClick: $scope.eventOnClick,
            eventRender: $scope.eventRender,
            eventAfterAllRender: function () {
                $timeout(function () {
                    // Permet la re-génération d'angularjs
                });
            }
        }, jQuery.fullCalendar)
    };
}

function ActiviteAdmin($scope, $rootScope, $dialog, $timeout, $compile, $filter, ActiviteAdminService) {
    var currentYear = new Date().getFullYear();
    $scope.lstAnnees = [currentYear, currentYear - 1, currentYear - 2];
    $scope.lstMois = [];
    $scope.lstMois.push.apply($scope.lstMois, jQuery.fullCalendar.monthNames);
    $scope.lstMois.splice(0, 0, "Tous");
    
    $scope.selection = {
        annee: currentYear, // Année courante
        mois: $scope.lstMois[new Date().getMonth() + 1] // Mois courant
    };

    $scope.$watch('selection', function (selection) {
        var options = angular.copy(selection);
        options.mois = $scope.lstMois.indexOf(selection.mois);
        ActiviteAdminService.list(options).then(function(result) {
            $scope.eventSources = null;
            $rootScope.activites = result;
        });
        ActiviteAdminService.listSans(options).then(function(result) {
            $rootScope.sansActivites = result;
        });
    }, true);

    $scope.isEditable = function(row){
        return true;
    };

    $scope.valider = function (row) {
        var activite = angular.copy(row);
        var btns = [{ label: 'Oui', result: 'yes', cssClass: 'btn-primary' }, { label: 'Non', result: 'no' }];
        var msgbox = $dialog.messageBox('Validation d\'un mois d\'activité', 'Etes-vous sûr de valider l\'activité de '+ activite.user.prenom +' du mois de '+ moment(activite.mois).format('MMMM YYYY') +' ?', btns);
        msgbox.open().then(function(result){
            if (result === 'yes') {
                activite.etat = 2;
                ActiviteAdminService.updateEtat(activite).then(function (reponse) {
                    if(reponse.success){
                        row.etat = activite.etat;
                        $rootScope.infos.nbActivitesVal--;
                    }
                });
            }
        });
    };

    // Inlined template for demo 
    $scope.opts = {
        backdrop: true,
        keyboard: true,
        backdropClick: true,
        template: $.trim($("#showActiviteTmpl").html()),
        controller: 'DialogShowActivite'
    };

    $scope.visualiser = function(row) {

        $scope.currentActivite = angular.copy(row);

        //$("#activiteCalendar").fullCalendar('gotoDate', $scope.currentActivite.mois);
        ActiviteAdminService.get($scope.currentActivite).then(function(activites) {

            $rootScope.error = "";

            $scope.eventSources = null;
            $scope.activiteUser = [];
            if (activites.activite.length > 0) {
                for (var i = 0, l = activites.activite.length; i < l; i++) {
                    $scope.activiteUser.push({ title: activites.activite[i].type, start: activites.activite[i].jour.date, data: activites.activite[i] });
                }
            }
            if (!$scope.eventSources) {
                $scope.eventSources = [$scope.activiteUser];
            }
            $rootScope.currentActivite = $scope.currentActivite;
            $rootScope.eventSources = $scope.eventSources;
            var d = $dialog.dialog($scope.opts);
            d.open().then(function(result) {
                if (result) {
                }
            });


        });
    };
    $scope['delete'] = function (row) {
        var activite = angular.copy(row);
        var btns = [{ label: 'Oui', result: 'yes', cssClass: 'btn-primary' }, { label: 'Non', result: 'no' }];
        var msgbox = $dialog.messageBox('Suppression d\'un mois d\'activité', 'Etes-vous sûr de supprimer l\'activité de '+ activite.user.prenom +' du mois de '+ moment(activite.mois).format('MMMM YYYY') +' ?', btns);
        msgbox.open().then(function(result){
            if (result === 'yes') {
                ActiviteAdminService.remove(activite).then(function (reponse) {
                    if(reponse.success){
                        var index = $rootScope.activites.indexOf(row);
                        $rootScope.activites.splice(index, 1);
                        $rootScope.infos.nbActivitesVal--;
                    }
                });
            }
        });
    };

    function businessDay(momentDate) {
        return momentDate.format("d") != 0 && momentDate.format("d") != 6;
    }

    $scope.create = function(row) {

        $rootScope.currentActivite = angular.copy(row);
        $scope.start = $rootScope.currentActivite.mois;
        //$("#activiteCalendar").fullCalendar('gotoDate', $scope.currentActivite.mois);
        ActiviteAdminService.get($scope.currentActivite).then(function(activites) {
            $scope.indexEvents = [];
            $rootScope.error = "";
            $scope.activite = activites;
            $scope.eventSources = null;
            $scope.activiteUser = [];
            $scope.events = [];

            function startEventConges(current, skip) {
                inConges = true;
                var toDo = true;
                if (businessDay(current) && !skip) {
                    var data = angular.copy(cong);
                    data.start = true;
                    if (data.fin.date.getMonth() <= current.month() && data.fin.date.getDate() <= current.date()) {
                        data.end = true;
                    }
                    if (!data.end && data.debut.type == 0) {
                        data.duree = 0;
                    }
                    else if (!data.end && data.debut.type == 1) {
                        data.duree = 2;
                        var date = new Date(current.toDate());
                        date.setHours(8);
                        if (lastCong.fin.date.getMonth() == current.month() && data.fin.date.getDate() < current.date()) {
                            $scope.events.push({ title: "Journée travaillée", allDay: false, start: date, data: { type: 'JT', duree: 1, heuresSup: 0, heuresAstreinte:0, heuresNuit: 0} });
                        }
                        date = new Date(current.toDate());
                        date.setHours(12);
                        $scope.events.push({ title: $filter('motifCongesShort')(data.type), start: date, data: data, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0 });
                        $scope.indexEvents[current.date()] = $scope.events.length - 1;
                        toDo = false;
                    }
                    /*if (data.debut.type == 0 && !data.end) {
                    data.duree = 0;
                    }*/
                    /*if (data.debut.type == 1 && !data.end) {
                    data.duree = 2;
                    }*/
                    else if (data.debut.type == 0 && data.end && data.fin.type == 0) {
                        data.duree = 1;
                        var date = new Date(current.toDate());
                        date.setHours(8);
                        $scope.events.push({ title: $filter('motifCongesShort')(data.type), start: date, data: data, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0 });
                        date = new Date(current.toDate());
                        date.setHours(12);
                        if ($scope.conges.length > 0 && $scope.conges[0].fin.date.getMonth() == current.month() && $scope.conges[0].fin.date.getDate() < current.date()) {
                            $scope.events.push({ title: "Journée travaillée", allDay: false, start: date, data: { type: 'JT', duree: 2, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0 } });
                        }
                        toDo = false;
                    }
                    else if (data.debut.type == 1 && data.end && data.fin.type == 1) {
                        data.duree = 2;
                        var date = new Date(current.toDate());
                        date.setHours(8);
                        if (lastCong.fin.date.getMonth() == current.month() && data.fin.date.getDate() < current.date()) {
                            $scope.events.push({ title: "Journée travaillée", allDay: false, start: date, data: { type: 'JT', duree: 1, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0 } });
                        }
                        date = new Date(current.toDate());
                        date.setHours(12);
                        $scope.events.push({ title: $filter('motifCongesShort')(data.type), start: date, data: data, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0 });
                        $scope.indexEvents[current.date()] = $scope.events.length - 1;
                        toDo = false;
                    }
                    else if (data.debut.type == 0 && data.end && data.fin.type == 1) {
                        data.duree = 0;
                    }
                    if (toDo) {
                        data.heuresSup = 0;
                        data.heuresAstreinte = 0;
                        data.heuresNuit = 0;
                        $scope.events.push({ title: $filter('motifCongesShort')(data.type), start: new Date(current.toDate()), data: data });
                        $scope.indexEvents[current.date()] = $scope.events.length - 1;
                    }
                }
                lastCong = angular.copy(cong);
                cong = $scope.conges.shift();
            }
            function inEventConges(current) {
                var data = angular.copy(lastCong);
                var toDo = true;
                if (data.fin.date.getMonth() <= current.month() && data.fin.date.getDate() <= current.date()) {
                    data.end = true;
                }
                if (!data.end) {
                    data.duree = 0;
                }
                if (data.end && data.fin.type == 0) {
                    data.duree = 1;
                    var date = new Date(current.toDate());
                    date.setHours(8);
                    data.heuresSup = 0;
                    data.heuresAstreinte = 0;
                    data.heuresNuit = 0;
                    $scope.events.push({ title: $filter('motifCongesShort')(data.type), start: date, data: data });
                    $scope.indexEvents[current.date()] = $scope.events.length - 1;
                    date = new Date(current.toDate());
                    date.setHours(12);
                    if (cong && cong.fin.date.getMonth() == current.month() && cong.fin.date.getDate() < current.date()) {
                        $scope.events.push({ title: "Journée travaillée", allDay: false, start: date, data: { type: 'JT', duree: 2, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0 } });
                    }
                    toDo = false;
                }
                if (data.end && data.fin.type == 1) {
                    data.duree = 0;
                }
                if (toDo) {
                    data.heuresSup = 0;
                    data.heuresAstreinte = 0;
                    data.heuresNuit = 0;
                    $scope.events.push({ title: $filter('motifCongesShort')(data.type), start: new Date(current.toDate()), data: data });
                    $scope.indexEvents[current.date()] = $scope.events.length - 1;
                }
            }
            function endEventConges(current) {
                inConges = false;
            }
            function workEvent(current) {
                if (businessDay(current)) {
                    $scope.events.push({ title: "Journée travaillée", start: new Date(current.toDate()), data: { type: 'JT', duree: 0, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0} });
                }
                else {
                    $scope.events.push({ title: "Weekend", start: new Date(current.toDate()), data: { type: 'WK', duree: 0, heuresSup: 0, heuresAstreinte: 0, heuresNuit: 0} });
                }
                $scope.indexEvents[current.date()] = $scope.events.length - 1;
            }
            if ($scope.activite.etat > 0 && $scope.activite.activite.length > 0) {
                for (var i = 0, l = $scope.activite.activite.length; i < l; i++) {
                    $scope.events.push({ title: $scope.activite.activite[i].type, start: $scope.activite.activite[i].jour.date, data: $scope.activite.activite[i] });
                    $scope.indexEvents[$scope.activite.activite[i].jour.date] = $scope.events.length - 1;
                }
            }
            else {
                $scope.conges = $scope.activite.activite;
                var cong = $scope.conges.shift();
                var lastCong;
                var first = true;
                var inConges = false;
                var current = new moment($scope.start);

                // Si le calendrier commence avant le 1er -> on avance jusqu'au 1er en ajoutant les congés si présents
                if (current.date() != 1) {
                    while (current.date() != 1) {
                        /*if (inConges && businessDay(current)) {
                        inEventConges(current, true);
                        }*/
                        if (cong && cong.debut.date.getMonth() == current.month() && cong.debut.date.getDate() == current.date()) {
                            startEventConges(current, true);
                        }
                        if (inConges && lastCong && lastCong.fin.date <= current.toDate()) {
                            endEventConges(current);
                        }
                        current = current.add('days', 1);
                    }
                }
                // Traitement du 1er du mois à la fin du mois.
                while (current.date() != 1 || first) {
                    first = false; // On signale qu'on a démarré
                    if (inConges && businessDay(current)) {
                        // Dans une période de congés.
                        inEventConges(current);
                    }
                    if (cong && cong.debut.date.getMonth() == current.month() && cong.debut.date.getDate() == current.date()) {
                        // Au début d'une période de congés.
                        startEventConges(current);
                    }
                    if (inConges && lastCong && lastCong.fin.date.getMonth() <= current.month() && lastCong.fin.date.getDate() <= current.date()) {
                        // A la fin d'une période de congés.
                        endEventConges(current);
                    }
                    //if (!inConges && businessDay(current) && typeof $scope.indexEvents[current.date()] == "undefined") {
                    if (typeof $scope.indexEvents[current.date()] == "undefined") {
                        // Journée travaillée.
                        workEvent(current);
                    }
                    current = current.add('days', 1); // On incrément la date courante dans le mois.
                }
            }

            if (!$scope.eventSources) {
                $scope.eventSources = [$scope.events];
            }
            $rootScope.currentActivite = $scope.currentActivite;
            $rootScope.eventSources = $scope.eventSources;
            var d = $dialog.dialog($scope.opts);
            d.open().then(function(result) {
                if (result) {
                }
            });


        });
    };
}

function ActiviteAdminGrid($scope, $rootScope, ActiviteAdminService) {
    $scope.filterOptions = {
        filterText: "",
        useExternalFilter: false
    };

    $scope.$on('search', function (event, data) {
        if (data.searcher == "admin-activite") {
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

    var myHeaderCellTemplate = $.trim($('#headerTmpl').html());
    var matriculeCellTemplate = $.trim($('#matriculeTmpl').html());
    var validationCellTemplate = $.trim($('#validationTmpl').html());
    var moisCellTemplate = $.trim($('#moisTmpl').html());
    var actionEdit = $.trim($('#actionRowTmplEdit').html());
    var actionCreate = $.trim($('#actionRowTmplCreate').html());
    var actionDelete = $.trim($('#actionRowTmplDel').html());

    $scope.gridOptions = {
        data: 'activites',
        columnDefs: [
            { field: '', displayName: '', width: 22, cellTemplate: '<span class="etatConges {{cssConges[row.etat]}}">&nbsp;</span>', resizable: false },
            { field: 'mois', displayName: 'Mois', width: 70, cellTemplate: moisCellTemplate, resizable: false },
            { field: 'user', displayName: 'Utilisateur', cellTemplate: matriculeCellTemplate, resizable: false },
            //{ field: 'etat', displayName: 'Etat', width: 60, headerCellTemplate: myHeaderCellTemplate },
            { field: 'JT', displayName: 'En mission', width: 100, headerCellTemplate: myHeaderCellTemplate, cssClass: "travail" },
            { field: 'FOR', displayName: 'Formation', width: 100, headerCellTemplate: myHeaderCellTemplate, cssClass: "travail" },
            { field: 'INT', displayName: 'Inter contrat', width: 100, headerCellTemplate: myHeaderCellTemplate, cssClass: "travail" },
            { field: 'CP', displayName: 'CP', width: 100, headerCellTemplate: myHeaderCellTemplate, cssClass: "conges" },
            { field: 'CP_ANT', displayName: 'CP anticipés', width: 100, headerCellTemplate: myHeaderCellTemplate, cssClass: "conges" },
            { field: 'RC', displayName: 'RC', width: 100, headerCellTemplate: myHeaderCellTemplate, cssClass: "conges" },
            { field: 'RCE', displayName: 'RC employeur', width: 100, headerCellTemplate: myHeaderCellTemplate, cssClass: "conges" },
            { field: 'AE', displayName: 'Absence exp.', width: 100, headerCellTemplate: myHeaderCellTemplate, cssClass: "conges" },
            { field: 'heuresSup', displayName: 'Heures suplémentaires', width: 100, headerCellTemplate: myHeaderCellTemplate, cssClass: "heures" },
            { field: 'heuresAstreinte', displayName: 'Astreinte', width: 100, headerCellTemplate: myHeaderCellTemplate, cssClass: "heures" },
            { field: 'heuresNuit', displayName: 'Heures de nuit', width: 100, headerCellTemplate: myHeaderCellTemplate, cssClass: "heures" },
            { field: '', cellTemplate: validationCellTemplate, width: 15, headerCellTemplate: myHeaderCellTemplate },
            { field: '', cellTemplate: actionEdit, width: 15, headerCellTemplate: myHeaderCellTemplate },
            { field: '', cellTemplate: actionDelete, width: 15, headerCellTemplate: myHeaderCellTemplate }
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

    $scope.gridOptionsSans = {
        data: 'sansActivites',
        columnDefs: [
            { field: '', displayName: '', width: 22, cellTemplate: '<span class="etatConges refConges">&nbsp;</span>', resizable: false },
            { field: 'mois', displayName: 'Mois', width: 70, cellTemplate: moisCellTemplate, resizable: false },
            { field: 'id', displayName: 'Matricule', width: 100, resizable: false },
            { field: 'nom', displayName: 'Nom', headerCellTemplate: myHeaderCellTemplate },
            { field: 'prenom', displayName: 'Prénom', headerCellTemplate: myHeaderCellTemplate },
            { field: '', cellTemplate: actionCreate, width: 15, headerCellTemplate: myHeaderCellTemplate }
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
}

// Contrôleur de la popup de modification de password
function DialogShowActivite($scope, $rootScope, $timeout, $compile, dialog) {
    $rootScope.error = "";
    $scope.user = $scope.$parent.currentActivite.user;
    $scope.eventSources = $scope.$parent.eventSources;
    $scope.uiConfig = $scope.$parent.uiConfig;
    
    $scope.close = function() {
        $rootScope.error = "";
        dialog.close();
    };

    var currentYear = new Date().getFullYear();
    $scope.activiteUser = [];

    /*$rootScope.typeActivite = angular.copy($rootScope.motifsConges);
    $rootScope.typeActivite.splice(0, 0, { id: 'JT', libelle: 'En mission' });
    $rootScope.typeActivite.splice(0, 0, { id: 'FOR', libelle: 'Formation' });
    $rootScope.typeActivite.splice(0, 0, { id: 'INT', libelle: 'Intercontrat' });
    $rootScope.typeActivite.push({ id: 'WK', libelle: 'Weekend' });
    $rootScope.typeActivite.push({ id: 'JF', libelle: 'Journée fériée' });*/

    /* alert on eventClick */
    $scope.alertEventOnClick = function(date, allDay, jsEvent, view) {
        $scope.$apply(function() {
            $scope.eventSelectionne = new moment(date).format('dddd D MMMM YYYY');
        });
    };
    $scope.eventOnClick = function(calEvent, jsEvent, view) {
        $scope.$apply(function() {
            $scope.currentEvent = calEvent.data;
            $scope.eventSelectionne = new moment(calEvent.start).format('dddd D MMMM YYYY');
        });
    };

    $scope.eventRender = function(event, element) {

        function indexOfEvent(start) {
            var index = 0, l = $scope.events.length;
            for (; index < l; index++) {
                if ($scope.events[index].start == start) return index;
            }
            return -1;
        }
        var eventScope = $scope.$new(true);
        angular.extend(eventScope, event);
        eventScope.typeActivite = $rootScope.typeActivite;
        eventScope.typeActiviteJour = $rootScope.typeActivite;

        eventScope.cancel = function(event) {
            eventScope.error = null;
            $.extend(eventScope.data, eventScope.savedEvent);
            $('[rel=popover]').popover('hide');
        }
        eventScope.infos = function(data) {
            if (data.duree == 2) {
                return "Ap. midi";
            }
            if (data.duree == 1) {
                return "Matin";
            }
        }
        eventScope.hasHeuresAstreinte = function (data) {
            return true;
        };
        eventScope.$watch('data.type', function (newValue, oldValue) {
            if (oldValue && newValue == 'JT' && (oldValue == 'WK' || oldValue == 'JF')) {
                eventScope.data.heuresAstreinte = 7.5;
            }
        });
        return $compile($.trim($('#eventTmpl').html()))(eventScope)
        /*element.addClass("jour")*/.attr("rel", "popover").popover({
            html: true,

            content: function(e) {
                // Jour férié, pas d'édition.
                /*if (eventScope.data.type == 'JF') {
                return false;
                }*/
                eventScope.savedEvent = angular.copy(eventScope.data);
                return $compile($.trim($('#popoverEventTmpl').html()))(eventScope);
            }
        }).click(function(e) {
            var elm = $(this);
            $(".popover.in").prev().each(function(i) {
                var $this = $(this);
                if (!$this.is(elm)) {
                    $this.scope().cancel();
                    $this.popover('hide');
                }
            });
        });
    };

    $scope.uiConfig = {
        calendar: angular.extend({
            editable: false,
            header: {
                left: '',
                center: '',
                right: 'title'
            },
            dayClick: $scope.alertEventOnClick,
            eventClick: $scope.eventOnClick,
            eventRender: $scope.eventRender,
            eventAfterAllRender: function() {
                $timeout(function() {
                    // Permet la re-génération d'angularjs
                    $("#activiteCalendar").fullCalendar('gotoDate', $rootScope.currentActivite.mois);
                    $("#activiteCalendar").find(".fc-content").css('overflow', 'visible');
                });
            }
        }, jQuery.fullCalendar)
    };
}