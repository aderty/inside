'use strict';

/* Controllers */

function appController($scope, $routeParams) {

}

function UsersMain($scope) {
    $scope.edition = false;
    $scope.mode = "";

    $scope.create = function () {
        $scope.currentUser = {};
        $scope.edition = true;
        $scope.mode = "Création";
    }

    $scope.cancelCreate = function () {
        $scope.edition = false;
    }

    $scope.edit = function (row) {
        $scope.currentUser = row.entity;
        $scope.edition = true;
        $scope.mode = "Edition";
    }

    $scope.currentUser = {};
}

function UsersGrid($scope) {
    $scope.users = [
        { matricule: "1205", nom: "Moroni", prenom: "Moroni", age: 50, cp: 15, cp_acc: 15, rtt: 0 },
        { matricule: "1206", nom: "Tiancum", prenom: "Jean-Marie", age: 43, cp: 20, cp_acc: 15, rtt: 10 },
        { matricule: "1207", nom: "Jacob", prenom: "Pierre-Simon", age: 27, cp: 9, cp_acc: 15, rtt: 5 },
        { matricule: "1208", nom: "Nephi", prenom: "Moroni", age: 29, cp: 10.5, cp_acc: 15, rtt: 6 },
        { matricule: "1209", nom: "Enos", prenom: "Moroni", age: 34, cp: 18.5, cp_acc: 15, rtt: 8 }];

    $scope.pagingOptions = {
        pageSizes: [250, 500, 1000],
        pageSize: 50,
        totalServerItems: 0,
        currentPage: 1
    };  

    $scope.gridOptions = {
        data: 'users',
        columnDefs: [
            { field: 'matricule', displayName: 'Matricule' },
            { field: 'nom', displayName: 'Nom' },
            { field: 'prenom', displayName: 'Prénom' },
            { field: 'age', displayName: 'Age' },
            { field: 'cp', displayName: 'CP' },
            { field: 'cp_acc', displayName: 'CP Aquis' },
            { field: 'rtt', displayName: 'RTT' },
            { field: '', cellTemplate: '<button class="btn btn-danger" type="button" ng-click="edit(row)"><i class="icon-align-center icon-edit"></i></button>' }
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


function AccordionDemoCtrl($scope) {
    $scope.oneAtATime = true;

    $scope.groups = [
      {
          title: "Dynamic Group Header - 1",
          content: "Dynamic Group Body - 1"
      },
      {
          title: "Dynamic Group Header - 2",
          content: "Dynamic Group Body - 2"
      }
    ];

    $scope.items = ['Item 1', 'Item 2', 'Item 3'];

    $scope.addItem = function () {
        var newItemNo = $scope.items.length + 1;
        $scope.items.push('Item ' + newItemNo);
    };
}
