var container;
var scene;
var renderer;
var camera;
var assetsInScene = {}
var currentObject = undefined;
var boundingBoxHelper = undefined;
var boxHelper;

function addViewport() {
    // Initial setup of scene
    container = $('#viewport');
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();

    renderer.setSize(container.width(), container.height());
    container.append(renderer.domElement);
}

function addCamera() {
    camera = new THREE.PerspectiveCamera(45, container.width() / container.height(), 0.1, 1000);
    camera.position.set(20, 20, 20);
    camera.lookAt(scene.position);
    scene.add(camera);
    orbitControls = new THREE.OrbitControls( camera, renderer.domElement );

    transformControls = new THREE.TransformControls(camera, renderer.domElement);
    transformControls.setTranslationSnap(0.1);
    transformControls.setRotationSnap(THREE.Math.degToRad(1));
    transformControls.addEventListener('change', render);
    scene.add(transformControls);
}

function addDefaultLights() {
    // Add default lights
    var light = new THREE.PointLight(0xff0000);
    light.position.set(0,1000,0);
    scene.add(light);

    light = new THREE.PointLight(0x00ff00);
    light.position.set(0,0,1000);
    scene.add(light);

    light = new THREE.PointLight(0x0000ff);
    light.position.set(1000,0,0);
    scene.add(light);

    var ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);
}

function initEventListeners() {
    window.addEventListener('resize', function() {
        // May need to adjust the camera/projection matrices
        renderer.setSize( container.width(), container.height());
        camera.aspect   = container.width() / container.height();
        camera.updateProjectionMatrix();
    }, false);

    $('#viewport, #sidebar').on('keydown', function(event) {
        keyCode = event.keyCode || event.which;
        switch(keyCode) {
            case 46: {
                // Delete selected asset instance
                if (currentObject != undefined) {
                    groupObject = currentObject;
                    while (!(groupObject instanceof THREE.Group))
                        groupObject = groupObject.parent;
                    scene.remove(groupObject);
                    delete assetsInScene[groupObject.uuid];
                    container.trigger('clearSelection');
                }
                break;
            }
            case 17: {
                // Ctrl
                transformControls.setTranslationSnap( 5 );
                transformControls.setRotationSnap( THREE.Math.degToRad( 15 ) );
            }
            case 87: {
                // W
                transformControls.setMode('translate');
                break;
            }
            case 69: {
                // E
                transformControls.setMode('rotate');
                break;
            }
            default:
        }
        console.log(keyCode);
    });

    $('#viewport, #sidebar').on('keyup', function(event) {
        var keyCode = event.keyCode || event.which;
        switch(keyCode) {
        case 17: // Ctrl
            transformControls.setTranslationSnap(0.1);
            transformControls.setRotationSnap( THREE.Math.degToRad(1) );
            break;
        }
    });

    container.on('addToScene', function(event, asset) {
        loadObjMtlFile(asset, function(assetInstance) {
            scene.add(assetInstance);
            assetsInScene[assetInstance.uuid] = assetInstance;
            container.trigger('selectionChanged', [assetInstance]);
        });
    });

    container.on('mousedown', function(event) {
        container.focus();
        container.trigger('clearSelection');
        
        mouse = new THREE.Vector2((event.offsetX / container.width()) * 2 - 1, -((event.offsetY / container.height()) * 2 - 1));
        raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        assetList = [];
        for (p in assetsInScene)
            assetList.push(assetsInScene[p])
        var intersects = raycaster.intersectObjects(assetList, true);
        if (intersects.length > 0) {
            object = intersects[0].object;
            if (object != currentObject) {
                container.trigger('selectionChanged', [object]);
            }
        }
    });

    container.on('selectionChanged', function(event, asset) {
        currentObject = asset;
        transformControls.attach(currentObject);

        boundingBoxHelper = new THREE.BoundingBoxHelper( currentObject, 0xff0000 );
        boundingBoxHelper.update();
        boxHelper = new THREE.BoxHelper(boundingBoxHelper);
        scene.add(boxHelper);
        $('#attributeEditor').trigger('setSelection', [currentObject]);
    });

    container.on('clearSelection', function(event) {
        if (currentObject != undefined) {
            transformControls.detach(currentObject);
            currentObject = undefined;
            scene.remove(boxHelper);
            boundingBoxHelper = undefined;
            $('#attributeEditor').trigger('setSelection', [currentObject]);
        }
    });

    container.focus();
}

function initScene() {
    var geometry = new THREE.PlaneGeometry( 50, 50, 20, 20 );
    var material = new THREE.MeshPhongMaterial({color: 0x156289, side: THREE.DoubleSide});
    var plane = new THREE.Mesh( geometry, material );
    plane.rotation.x = Math.PI / 2;
    scene.add( plane );
}

function animate() {
    requestAnimationFrame( animate );
    render();
    update();
}

function render() {
    renderer.render(scene, camera);
}

function update() {
    orbitControls.update();
    transformControls.update();
    if (boundingBoxHelper != undefined) {
        boundingBoxHelper.update();
        boxHelper.update(boundingBoxHelper);
    }
    $('#attributeEditor').trigger('update');
}

function loadObjMtlFile (asset, onLoaded) {
    var objLoader = new THREE.OBJMTLLoader();
    objLoader.load( asset.rootPath + '/asset.obj', asset.rootPath + '/asset.mtl', onLoaded, 
    function() {
        // In Progress
    }, function() {
        // On Error
    });
}

function initViewport() {
    addViewport();
    addCamera();
    addDefaultLights();
    initEventListeners();
    initScene();
    animate();
}