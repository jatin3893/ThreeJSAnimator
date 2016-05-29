var myAppModule = angular.module('designer', [])
                        .controller('assetLibraryController', assetLibraryController)
                        .controller('attributeEditorController', attributeEditorController);

function assetLibraryController($scope) {
    $scope.assetLibrary = {}

    $.get("query/getAssetsByType", function(response, status){
       $scope.assetLibrary.assetsByType = response.data;
       $scope.$apply();
    });

    sidebar = {
        'panels': [
            '#assetLibrary',
            '#attributeEditor',
            '#outliner'
        ],
        init: function() {
            sidebar.current = 0;
            $(sidebar.panels[1]).slideToggle();
            $(sidebar.panels[2]).slideToggle();
        }
    };
    sidebar.init();

    $scope.assetLibrary.actions = [
        {
            'name': 'Add To Scene',
            'thumbnail': 'images/icons/add.png',
            onMouseClick: function(asset) {
                $('#viewport').trigger('addToScene', [asset]);
            }
        },
        {
            'name': 'Mark as Favourite',
            'thumbnail': 'images/icons/favorite.png',
            onMouseClick: function(asset) {

            }
        }
    ];

    $('#viewport, #sidebar').on('keydown', function(event) {
        keyCode = event.keyCode || event.which;
        switch(keyCode) {
            case 49:
            case 50:
            case 51: {
                changeSidebar(keyCode - 49);
            }
        }
    });

    function changeSidebar(value) {
        if (value != sidebar.current) {
            $(sidebar.panels[sidebar.current]).slideToggle();
            sidebar.current = value;
            $(sidebar.panels[sidebar.current]).slideToggle();
        }
    }
}

function attributeEditorController($scope) {
    $scope.attributeEditor = {
    }

    $('#attributeEditor').on('setSelection', function(event, currentObject) {
        $scope.attributeEditor.currentObject = currentObject;
        if (currentObject == undefined)
            return;
        $scope.$apply();     
    });

    $('#attributeEditor').on('update', function(event) {
        $scope.$apply();
    });
}

$(document).ready(function() {
    initViewport();
});