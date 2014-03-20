'use strict';
(function() {
    /* Controllers */
    // Contrôleur principal de la gestion des utilisateurs
    this.register('LoginController', ['$scope', '$rootScope', '$dialog', '$location', '$routeParams', 'LoginService', LoginController]);
    this.register('DialogPasswordLost', ['$scope', '$rootScope', 'dialog', 'LoginService', DialogPasswordLost]);

    /* Controllers */
    // Contrôleur de login
    function LoginController($scope, $rootScope, $dialog, $location, $routeParams, LoginService) {
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
                if (!response || response.error) {
                    $scope.user = {};
                    $scope.login.$setPristine();
                    $rootScope.connected = false;
                    $rootScope.error = true;
                    return;
                }
                $rootScope.error = "";
                $rootScope.initConnected(response);
            });
        };
        // Inlined template for demo 
        $scope.opts = {
            backdrop: true,
            keyboard: true,
            backdropClick: true,
            templateUrl: '/templates/passwordLost.html',
            controller: 'DialogPasswordLost'
        };
        $scope.passwordLost = function(email, key) {
            $rootScope.error = "";
            var opts = angular.copy($scope.opts);
            // Si un email est présent ou un code -> Ajout aux options de la popup
            if (email) opts.email = email;
            if (key) opts.key = key;
            var d = $dialog.dialog(opts);
            d.open().then(function(result) {
                if (result) {
                }
            });
        };
        // Appel de l'url de mot de passe oublié -> Ouverture automatique de la popup de récupération
        if (location.pathname.indexOf("lost") > -1 && $routeParams.email && $routeParams.key) {
            $scope.passwordLost($routeParams.email, $routeParams.key);
        }
    }

    // Contrôleur de la popup de modification de password
    function DialogPasswordLost($scope, $rootScope, dialog, LoginService) {
        $rootScope.error = "";
        $scope.enable = true;
        $scope.password = {
            etat: 0
        };
        // Alimentation depuis l'url
        if (dialog.options.email) {
            $scope.password.email = dialog.options.email;
            if (dialog.options.key) {
                $scope.password.key = dialog.options.key;
                // L'email et la clé est présent
                $scope.password.etat = 1;
            }
        }
        $scope.close = function() {
            $rootScope.error = "";
            dialog.close();
        };
        $scope.save = function(password) {
            if ($scope.pwdLost.$invalid) {
                return;
            }
            $rootScope.error = "";
            $scope.enable = false;
            LoginService.passwordLost(password).then(function(response) {
                $scope.enable = true;
                if (response && password.etat == 2) {
                    dialog.close();
                    $rootScope.initConnected(response);
                }
            }, function(response) {
                $scope.enable = true;
            });
        };
    }
}).call(app.controllerProvider);