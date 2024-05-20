import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';


var music_has_started = false;
const groove = document.getElementById('groove');
groove.volume = 0.2;


document.addEventListener('click', (ev) => {
	if (music_has_started == false) {
		try {
			groove.play();
			music_has_started = true;
		} catch (error) {
			music_has_started = false;
		}
	}
});


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


	{
		function cuber( w, h, d, x, y, z, color) {

			const geometry = new THREE.BoxGeometry( w, h, d );

			const material = new THREE.MeshPhongMaterial( { color } );

			const cube = new THREE.Mesh( geometry, material );
			scene.add( cube );

			cube.position.x = x;
			cube.position.y = y;
			cube.position.z = z;

			return cube;
		}
		
		const cubes = [];

		for (let i = -50; i <= 50; i += 5) {
			for (let j = -50; j <= 50; j += 5) {
				const color = new THREE.Color(Math.random(), Math.random()/2, Math.random()/2);
				cubes.push( cuber(5,5,5,i,(Math.random()*10)-20,j,color) );
			}
		}
	}

	/*{
		const geometry = new THREE.CylinderGeometry(4.9, 5.5, 12, 10);

		const loader = new THREE.TextureLoader();

		const texture = loader.load( './assets/pine.jpg' );
		texture.colorSpace = THREE.SRGBColorSpace;
		texture.rotation = Math.PI / 2;
		texture.offset.set(0.5, 0);
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(1, 1);

		const material = new THREE.MeshBasicMaterial( {
			map: texture
		} );
		const cylinder = new THREE.Mesh( geometry, material );
		cylinder.position.set( 0, -4.75, 0 );

		scene.add( cylinder );
	}*/

	{
		const geometry = new THREE.ConeGeometry(5.5, 12, 4);
		geometry.rotateX(Math.PI);

		const loader = new THREE.TextureLoader();
		const texture = loader.load('./assets/pine.jpg');
		texture.colorSpace = THREE.SRGBColorSpace;
		texture.rotation = Math.PI / 2;
		texture.offset.set(0.5, 0);
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(1, 1);

		const material = new THREE.MeshBasicMaterial({
			map: texture
		});

		const pyramid = new THREE.Mesh(geometry, material);
		pyramid.position.set(0, -4.75, 0);

		scene.add(pyramid);
	}

	{
		const light = new THREE.HemisphereLight( 0x00FFF2, 0x00FFF2, 1 );
		scene.add( light );
	}

	{
		const light = new THREE.DirectionalLight( 0xFFFFFF, 2.5 );
		light.position.set( 5, 10, 2 );
		scene.add( light );
		scene.add( light.target );

	}

	{
		const light = new THREE.AmbientLight(0x00FF40, 1);
		light.position.set( 5, 20, 2 );
		scene.add( light );
	}

	{
		const mtlLoader = new MTLLoader();
		mtlLoader.load( './assets/shrek.mtl', ( mtl ) => {
			mtl.preload();
			const objLoader = new OBJLoader();
			objLoader.setMaterials( mtl );
			objLoader.load( './assets/shrek.obj', ( root ) => {
				root.scale.set(0.5, 0.5, 0.5);
				root.position.y += 1;

				scene.add( root );

				const box = new THREE.Box3().setFromObject( root );

				const boxSize = box.getSize( new THREE.Vector3() ).length();
				const boxCenter = box.getCenter( new THREE.Vector3() );

				frameArea( boxSize * 1.2, boxSize, boxCenter, camera );

				controls.maxDistance = boxSize * 10;
				controls.target.copy( boxCenter );
				controls.update();

			} );
		} );
	}

	{
		const loader = new FBXLoader();
		loader.load('./assets/waluigi.fbx', (object) => {
			object.scale.set(1, 1, 1);
			object.position.set(0, 25, 0);
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
		});
	}

	{
		const loader = new THREE.TextureLoader();
		const texture = loader.load(
			'./assets/yuha.jpg',
			() => {
				texture.mapping = THREE.EquirectangularReflectionMapping;
				texture.colorSpace = THREE.SRGBColorSpace;
				scene.background = texture;
			} );
	}

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