// http://localhost:8000/asg5c.html
// python -m http.server 8000

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';




function play_bg(song_file, play_bool) {
	var background_music = document.getElementById('audioP');
	background_music.src = './assets/music/'+song_file;
	background_music.volume = 0.2;
	if (play_bool) {
		background_music.play();
	}
}

function resizeRendererToDisplaySize( renderer ) {

	const canvas = renderer.domElement;
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;
	const needResize = canvas.width !== width || canvas.height !== height;
	if ( needResize ) {

		renderer.setSize( width, height, false );

	}

	return needResize;
}

function frameArea( sizeToFitOnScreen, boxSize, boxCenter, camera ) {
	const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
	const halfFovY = THREE.MathUtils.degToRad( camera.fov * .5 );
	const distance = halfSizeToFitOnScreen / Math.tan( halfFovY );


	const direction = ( new THREE.Vector3() )
		.subVectors( camera.position, boxCenter )
		.multiply( new THREE.Vector3( 1, 0, 1 ) )
		.normalize();

	camera.position.copy( direction.multiplyScalar( 50 ).add( boxCenter ) );

	camera.near = boxSize / 100;
	camera.far = boxSize * 100;

	camera.updateProjectionMatrix();

	camera.lookAt( boxCenter.x, boxCenter.y, boxCenter.z );

}






//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////// MAIN //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function main() {

	const canvas = document.querySelector( '#c' );
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

	const fov = 45;
	const aspect = 2;
	const near = 0.1;
	const far = 100;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.set( 0, 10, 20 );

	const controls = new OrbitControls( camera, canvas );
	controls.target.set( 0, 5, 0 );
	controls.update();

	const scene = new THREE.Scene();
	scene.background = new THREE.Color( 'blue' );

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	////////////// BASIC SHAPES //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	function spherer( r, w, h, x, y, z, color) {
			const loader = new THREE.TextureLoader();
			const texture = loader.load('./assets/textures/discoball.jpg');

			const geometry = new THREE.SphereGeometry( r, w, h );
			const material = new THREE.MeshBasicMaterial({
				map: texture
			});

			const sphere = new THREE.Mesh( geometry, material );
			scene.add( sphere );

			sphere.position.x = x;
			sphere.position.y = y;
			sphere.position.z = z;

			loadDonkey(x,y,z, );

			return sphere;
	}

	function cuber( w, h, d, x, y, z, color) {

			const geometry = new THREE.BoxGeometry( w, h, d );

			//const material = new THREE.MeshPhongMaterial( { color } );

			const material = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5 });

			const cube = new THREE.Mesh( geometry, material );
			scene.add( cube );

			cube.position.x = x;
			cube.position.y = y;
			cube.position.z = z;

			return cube;
	}
	
	const cubes = [];
	function danceFloor() {
		
		while (cubes.length > 0) {
			const cube = cubes.pop();
			scene.remove(cube);
		}

		for (let i = -100; i <= 100; i += 7) {
			for (let j = -100; j <= 100; j += 7) {
				const colors_arr = ["lime", "yellow", "orange", "magenta", "purple", "blue", "cyan", "skyblue", "grey", "lightgreen"];
				const randomIndCol = Math.floor(Math.random() * colors_arr.length);
				const color = new THREE.Color( colors_arr[randomIndCol] );
				const cube_chaos = (Math.random()*((Math.max(Math.abs(i),Math.abs(j))/30)**3))-5;
				cubes.push( cuber(7,7,7,i,cube_chaos,j,color) );
			}
		}
	}

	danceFloor();

	setInterval(danceFloor, 1000);


	{
		const geometry = new THREE.ConeGeometry(20, 12, 10);
		geometry.rotateX(Math.PI);

		const loader = new THREE.TextureLoader();
		const texture = loader.load('./assets/textures/wanted.jpg');
		texture.colorSpace = THREE.SRGBColorSpace;
		texture.rotation = -Math.PI / 2;
		//texture.offset.set(0.5, 0);
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(1, 1);

		const material = new THREE.MeshStandardMaterial({
			map: texture
		});

		const pyramid = new THREE.Mesh(geometry, material);
		pyramid.position.set(0, -4.75, 0);

		scene.add(pyramid);
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	////////////// LIGHTS //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	let hemi_lights = [];

	function setHemisphereLight(stren) {
		while (hemi_lights.length > 0) {
			const hlight = hemi_lights.pop();
			scene.remove(hlight);
		}

		const light = new THREE.HemisphereLight( 0xFFFFFF, 0xFFFFFF, stren );
		scene.add( light );
		hemi_lights.push(light);
	}

	setHemisphereLight(1);

	const ballColors = [0x0026FF, 0xFF002F, 0x00FF62, 0xFFA200];
	let ballX; let ballZ; let ballAngle = 0; const ballRadius = 10; const ballClock = new THREE.Clock();
	let ballIndex = 0;
	let currentLight = null;
	let discos = [];

	function discoLights() {
		while (discos.length > 0) {
			const disco = discos.pop();
			scene.remove(disco);
		}
		if (currentLight) { scene.remove(currentLight); currentLight.dispose(); }
		
		const light = new THREE.DirectionalLight( ballColors[ballIndex], 4.5 );
		light.position.set( ballX, 10, ballZ );
		light.target.position.set(-ballX, Math.random()*10, -ballZ);
		discos.push( spherer(70,70,70,ballX*50, 200, ballZ*50, 0xFFFFFF) );
		scene.add( light );
		scene.add( light.target );

		currentLight = light;

		if (ballIndex+1 == ballColors.length) {
			ballIndex = 0;
		} else {
			ballIndex += 1
		}
		const delta = ballClock.getDelta();
		ballAngle += delta/2; // speed of moving
		ballX = ballRadius * Math.cos(ballAngle);
		ballZ = ballRadius * Math.sin(ballAngle);
		console.log(ballX);
		console.log(ballZ);
	}

	setInterval(discoLights, 1000);

	let ambBallInd = 1;
	let currentAmbientLight = null;

	function ambientDisco() {
		if (currentAmbientLight) { scene.remove(currentAmbientLight); currentAmbientLight.dispose(); }
		
		const light = new THREE.AmbientLight( ballColors[ambBallInd], 0.025 );
		light.position.set( 0, 0, 0 );
		scene.add( light );

		currentAmbientLight = light;

		if (ambBallInd+1 == ballColors.length) {
			ambBallInd = 0;
		} else {
			ambBallInd += 1
		}
	}

	setInterval(ambientDisco, 1000);

	/*{
		const light = new THREE.DirectionalLight( 'white', 2.5 );
		light.position.set( 5, 10, 2 );
		scene.add( light );
		scene.add( light.target );
	}*/

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	////////////// MTL //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	

	{
		const mtlLoader = new MTLLoader();
		mtlLoader.load( './assets/models/shrek.mtl', ( mtl ) => {
			mtl.preload();
			const objLoader = new OBJLoader();
			objLoader.setMaterials( mtl );
			objLoader.load( './assets/models/shrek.obj', ( root ) => {
				root.scale.set(5, 5, 5);
				root.position.set(0, -100, -300);

				scene.add( root );
			} );
		} );
	}

	{
		const mtlLoader = new MTLLoader();
		mtlLoader.load( './assets/models/House/Shrek_home.mtl', ( mtl ) => {
			mtl.preload();
			const objLoader = new OBJLoader();
			objLoader.setMaterials( mtl );
			objLoader.load( './assets/models/House/Shrek_home.obj', ( root ) => {
				root.scale.set(40, 40, 40);
				root.position.set(-300, 0, 0);

				scene.add( root );
			} );
		} );
	}

	{
		const mtlLoader = new MTLLoader();
		mtlLoader.load( './assets/models/Beware/PROP_Sign_Beware_Of_Ogres.mtl', ( mtl ) => {
			mtl.preload();
			const objLoader = new OBJLoader();
			objLoader.setMaterials( mtl );
			objLoader.load( './assets/models/Beware/PROP_Sign_Beware_Of_Ogres.obj', ( root ) => {
				root.scale.set(500, 500, 500);
				root.position.set(200, -100, 0);
				root.rotation.set( 0, 4.75, 0);

				scene.add( root );
			} );
		} );
	}

	let donkeys = [];

	function loadDonkey(x,y,z, r) {
		while (donkeys.length > 0) {
			const donkey = donkeys.pop();
			scene.remove(donkey);
		}

		const mtlLoader = new MTLLoader();
		mtlLoader.load( './assets/models/Donkey/donkey.mtl', ( mtl ) => {
			mtl.preload();
			const objLoader = new OBJLoader();
			objLoader.setMaterials( mtl );
			objLoader.load( './assets/models/Donkey/donkey.obj', ( root ) => {
				root.traverse((child) => { if (child.isMesh) { child.material.transparent = false; } });
				root.scale.set(200, 200, 200);
				root.position.set(x, y-300, z);
				root.rotation.set( 0, Math.atan2(-x,-z), 0);

				scene.add( root );
				donkeys.push( root );
			} );
		} );
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	////////////// FBX BACKROUND //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let dancers = [];

	function bada(backupDance, startAngle, scale_) {
		const loader = new FBXLoader(); let object; let mixer; let angle = startAngle; const radius = 30; const clock = new THREE.Clock();

		loader.load(backupDance, (loadedObject) => {
			loadedObject.traverse((child) => { if (child.isMesh) { child.material.transparent = false; } });

			object = loadedObject;
			object.scale.set(scale_, scale_, scale_);
			object.position.set(0, -1, 0);
			scene.add(object);

			mixer = new THREE.AnimationMixer(object);
			object.animations.forEach((clip) => {
				mixer.clipAction(clip).play();
			});

			dancers.push( object );
			dancers.push( mixer );

			animate();
		});

		function animate() {
			requestAnimationFrame(animate);
			const delta = clock.getDelta();

			if (mixer) { mixer.update(delta); }

			if (object) {
				angle += delta/2; // speed of moving
				object.position.x = radius * Math.cos(angle);
				object.position.z = radius * Math.sin(angle);
				object.rotation.y -= 0.01
			}
			renderer.render(scene, camera);
		}
	}

	function spawnDancers(backupDance, scale_=1) {
		while (dancers.length > 0) {
			const dancer = dancers.pop();
			scene.remove(dancer);
		}

		//for (let l = 0; l < 360; l += 120) {
		bada('./assets/dances/'+backupDance, 0, scale_);
		//}
		// my computer cant handle more than one...
	}

	function despawnDancers() {
		while (dancers.length > 0) {
			const dancer = dancers.pop();
			scene.remove(dancer);
		}
	}

	document.getElementById('silly').onclick = function() { spawnDancers('Silly_Dancing.fbx', 10); play_bg('SMB_extra.mp3', true); setHemisphereLight(0.1); }
	document.getElementById('rumba').onclick = function() { spawnDancers('Rumba_Dancing.fbx', 10); play_bg('SMB_target.mp3', true); setHemisphereLight(0.1); }
	document.getElementById('jazz').onclick = function() { spawnDancers('Jazz_Dancing.fbx', 10); play_bg('SMB_arctic.mp3', true); setHemisphereLight(0.1); }
	document.getElementById('break').onclick = function() { spawnDancers('Breakdance_Uprock.fbx', 20); play_bg('OP_1999.mp3', true); setHemisphereLight(1); }
	document.getElementById('gangnam').onclick = function() { spawnDancers('Gangnam_Style.fbx', 20); play_bg('SMB_fight.mp3', true); setHemisphereLight(1); }
	document.getElementById('nomusic').onclick = function() { despawnDancers(); play_bg('SMB_fight.mp3', false); setHemisphereLight(1); }

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	////////////// FBX MAIN //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	let dances = [];
	let hasntSetCam = true;

	function danceMan(sel_dance) {
		while (dances.length > 0) {
			const danceC = dances.pop();
			scene.remove(danceC);
		}

		const loader = new FBXLoader();
		loader.load('./assets/dances/main_dances/'+sel_dance, (object) => {
			object.traverse((child) => { if (child.isMesh) { child.material.transparent = false; } });

			object.scale.set(20, 20, 20);
			object.position.set(0, 1, 0);
			scene.add(object);

			const mixer = new THREE.AnimationMixer(object);
			object.animations.forEach((clip) => {
				mixer.clipAction(clip).play();
			});

			const clock = new THREE.Clock();
			function animate() {
				requestAnimationFrame(animate);
				const delta = clock.getDelta();
				mixer.update(delta);
				renderer.render(scene, camera);
			}
			animate();

			dances.push( object );
			dances.push( mixer );

			if (hasntSetCam) {
				const box = new THREE.Box3().setFromObject( object );

				const boxSize = box.getSize( new THREE.Vector3() ).length();
				const boxCenter = box.getCenter( new THREE.Vector3() );

				frameArea( boxSize , boxSize, boxCenter, camera );

				controls.maxDistance = boxSize * 10;
				controls.target.copy( boxCenter );
				controls.update();

				camera.position.set(boxCenter.x, boxCenter.y, boxCenter.z + boxSize);
				camera.lookAt(boxCenter);

				hasntSetCam = false;
			}
		});
	}

	danceMan('Idle.fbx');

	document.addEventListener('keydown', function(event) {
		if (event.key == '1') { danceMan('Flair.fbx') }
		else if (event.key == '2') { danceMan('Wave1.fbx') }
		else if (event.key == '3') { danceMan('Silly.fbx') }
		else if (event.key == '4') { danceMan('Wave2.fbx') }
		else if (event.key == '5') { danceMan('Salsa.fbx') }
		else if (event.key == '6') { danceMan('Dancing.fbx') }
		else if (event.key == '7') { danceMan('Maraschino.fbx') }
		else if (event.key == '7') { danceMan('Maraschino.fbx') }
		else if (event.key == '8') { danceMan('Backflip.fbx') }
		else if (event.key == '9') { danceMan('Jumping.fbx') }
		else if (event.key == '0') { danceMan('Idle.fbx') }
	});

	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	////////////// SKY BOX //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	const bgFrames = ['darkened_realshrek1.jpg','darkened_realshrek2.jpg','darkened_realshrek3.jpg','darkened_realshrek4.jpg','darkened_realshrek5.jpg'];
	let bgInd = 0;
	const bgs = [];

	function animateBG() {
		while (bgs.length > 0) {
			const cur_bg = bgs.pop();
			scene.remove(bgs);
		}

		const loader = new THREE.TextureLoader();
		const texture = loader.load(
			'./assets/textures/bg_animation/'+bgFrames[bgInd],
			() => {
				texture.mapping = THREE.EquirectangularReflectionMapping;
				texture.colorSpace = THREE.SRGBColorSpace;
				scene.background = texture;
			} );

		bgs.push(texture);

		if (bgInd+1 == bgFrames.length) {
			bgInd = 0;
		} else {
			bgInd += 1
		}
	}

	setInterval(animateBG, 1000);

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	////////////// RENDER //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function clearExtras() {
		while (hemi_lights.length > 1) {
			const hemiL = hemi_lights.pop();
			scene.remove(hemiL);
		}
		while (dancers.length > 1) {
			const unwanteddancer = dancers.pop();
			scene.remove(unwanteddancer);
		}
		while (dances.length > 1) {
			const glitchdance = dances.pop();
			scene.remove(glitchdance);
		}
	}

	setInterval(clearExtras, 500);

	function render() {

		if ( resizeRendererToDisplaySize( renderer ) ) {

			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();

		}

		renderer.render( scene, camera );

		requestAnimationFrame( render );
	}

	requestAnimationFrame( render );

}

main();






