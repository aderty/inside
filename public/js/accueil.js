﻿'use strict';
(function() {
    /* Controllers */
    // Contrôleur principal de la gestion des utilisateurs
    this.register('LoginController', ['$scope', '$rootScope', '$dialog', 'LoginService', LoginController]);
    this.register('DialogPasswordLost', ['$scope', '$rootScope', 'dialog', 'LoginService', DialogPasswordLost]);
 
    /* Controllers */
    // Contrôleur de login
    function LoginController($scope, $rootScope, $dialog, LoginService) {
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
            templateUrl: '/templates/passwordLost.html',
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
        $scope.enable = true;
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