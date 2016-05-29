function loadObjMtlFile (asset, onLoaded) {
    var objLoader = new THREE.OBJMTLLoader();
    objLoader.load( asset.rootPath + '/asset.obj', asset.rootPath + '/asset.mtl', onLoaded, 
    function() {
        // In Progress
    }, function() {
        // On Error
    });
}

function addToScene (asset) {
    
}