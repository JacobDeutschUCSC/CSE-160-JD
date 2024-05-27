// asg4.js
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec3 a_Normal;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix_1;
  uniform mat4 u_GlobalRotateMatrix_2;
  uniform mat4 u_GlobalRotateMatrix_3;
  varying vec3 v_Normal;
  uniform mat4 u_NormalMatrix;
  varying vec4 v_VertPOS;
  void main() {
    gl_Position = u_GlobalRotateMatrix_1 * u_GlobalRotateMatrix_2 * u_GlobalRotateMatrix_3 * u_ModelMatrix * a_Position;
    v_Normal = a_Normal;
    v_VertPOS = u_ModelMatrix * a_Position;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform int u_whichTexture;
  uniform vec3 u_lightPOS;
  uniform vec3 u_cameraPOS;
  varying vec4 v_VertPOS;
  uniform bool u_lightOn;
  void main() {
    if (u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);
    } else if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    }
    
    vec3 lightVector = u_lightPOS-vec3(v_VertPOS);
    float r = length(lightVector);

    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N,L), 0.0);

    vec3 R = reflect(-L, N);
    vec3 E = normalize(u_cameraPOS-vec3(v_VertPOS));
    float specular = pow(max(dot(E,R), 0.0), 10.0);

    vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.3;
    if (u_lightOn) {
      gl_FragColor = vec4(diffuse+ambient+specular, 1.0);
    }
    //gl_FragColor = vec4(diffuse+ambient, 1.0);


    //if (r < 0.5) {
    //  gl_FragColor = vec4(1,0,0,1);
    //} else if (r < 1.0) {
    //  gl_FragColor = vec4(0,1,0,1);
    //}
    //gl_FragColor = vec4(vec3(gl_FragColor)/(r*r),1);
  }`;

// GLOBALS
let canvas;
let gl;
let a_Position;
let a_Normal;
let u_whichTexture;
let g_normalsON = false;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix_1;
let u_GlobalRotateMatrix_2;
let u_GlobalRotateMatrix_3;
let g_globalAngle_1 = 0;
let g_globalAngle_2 = 0;
let g_globalAngle_3 = 0;
let g_lightPOS = [0,.45,-.7];
let g_camPOS = [0,0,-10];
let g_lightOn = true;
let u_lightPOS;
let u_cameraPOS;
let u_lightOn;

let side_fins_angle = 45;
let tail_angle = 0;
let top_base_angle = 0;
let top_second_angle = 0;
let top_third_angle = 0;
let animation_bool = true;
let light_anime_bool = true;
let spin_bool = false;
let swim_speed = 1;

var g_startTime = performance.now()/1000.0;
var g_seconds = (performance.now()/1000.0)-g_startTime;

function tick() {
	g_seconds = (performance.now()/1000.0)-g_startTime
	//console.log(g_seconds);
	renderAllShapes();
	requestAnimationFrame(tick);
}

function setupWebGL() {
  canvas = document.getElementById('webgl');

  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) { console.log('Failed to intialize shaders.'); return; }

  u_lightPOS = gl.getUniformLocation(gl.program, 'u_lightPOS');
  if (!u_lightPOS) { console.log('Failed to get the storage location of u_lightPOS'); return; }
  u_cameraPOS = gl.getUniformLocation(gl.program, 'u_cameraPOS');
  if (!u_cameraPOS) { console.log('Failed to get the storage location of u_cameraPOS'); return; }
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) { console.log('Failed to get the storage location of u_lightOn'); return; }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  u_GlobalRotateMatrix_1 = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix_1');
  u_GlobalRotateMatrix_2 = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix_2');
  u_GlobalRotateMatrix_3 = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix_3');

  if (a_Position < 0) { console.log('Failed to get the storage location of a_Position'); return; }
  if (a_Normal < 0) { console.log('Failed to get the storage location of a_Normal'); return; }
  if (!u_whichTexture) { console.log('Failed to get the storage location of u_whichTexture'); return; }
  if (!u_FragColor) { console.log('Failed to get the storage location of u_FragColor'); return; }
  if (!u_ModelMatrix) { console.log('Failed to get the storage location of u_ModelMatrix'); return; }
  if (!u_GlobalRotateMatrix_1) { console.log('Failed to get the storage location of u_GlobalRotateMatrix_1'); return; }
  if (!u_GlobalRotateMatrix_2) { console.log('Failed to get the storage location of u_GlobalRotateMatrix_2'); return; }
  if (!u_GlobalRotateMatrix_3) { console.log('Failed to get the storage location of u_GlobalRotateMatrix_3'); return; }
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function connectWebControls() {
  document.getElementById('norm_on').onclick = function() { g_normalsON = true; renderAllShapes(); };
  document.getElementById('norm_off').onclick = function() { g_normalsON = false;  renderAllShapes(); };
  document.getElementById('L_ani_on').onclick = function() { light_anime_bool = true; renderAllShapes(); };
  document.getElementById('L_ani_off').onclick = function() { light_anime_bool = false; renderAllShapes(); };
  document.getElementById('light_on').onclick = function() { g_lightOn = true; renderAllShapes(); };
  document.getElementById('light_off').onclick = function() { g_lightOn = false; renderAllShapes(); };

  document.getElementById('LslideX').addEventListener('mousemove', function() {g_lightPOS[0] = this.value/100; renderAllShapes(); });
  document.getElementById('LslideY').addEventListener('mousemove', function() {g_lightPOS[1] = this.value/100; renderAllShapes(); });
  document.getElementById('LslideZ').addEventListener('mousemove', function() {g_lightPOS[2] = this.value/100; renderAllShapes(); });

  document.getElementById('angleSlide1').addEventListener('mousemove', function() {g_globalAngle_1 = this.value; renderAllShapes(); });
  //document.getElementById('angleSlide2').addEventListener('mousemove', function() {g_globalAngle_2 = this.value; renderAllShapes(); });
  //document.getElementById('angleSlide3').addEventListener('mousemove', function() {g_globalAngle_3 = this.value; renderAllShapes(); });

  //document.getElementById('finSlide').addEventListener('mousemove', function() {side_fins_angle = this.value; renderAllShapes(); });
  //document.getElementById('tailSlide').addEventListener('mousemove', function() {tail_angle = this.value; renderAllShapes(); });

  //document.getElementById('tfb').addEventListener('mousemove', function() {top_base_angle = this.value; renderAllShapes(); });
  //document.getElementById('tfm').addEventListener('mousemove', function() {top_second_angle = this.value; renderAllShapes(); });
  //document.getElementById('tft').addEventListener('mousemove', function() {top_third_angle = this.value; renderAllShapes(); });

  document.getElementById('swim_speed').addEventListener('mousemove', function() {swim_speed = this.value; renderAllShapes(); });

  document.getElementById('animation_on').onclick = function() { animation_bool = true; renderAllShapes(); };
  document.getElementById('animation_off').onclick = function() { animation_bool = false; renderAllShapes(); };

  //document.getElementById('spin_on').onclick = function() { spin_bool = true; renderAllShapes(); };
  //document.getElementById('spin_off').onclick = function() { spin_bool = false;  renderAllShapes(); };
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  connectWebControls();

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //renderAllShapes();
  requestAnimationFrame(tick);
}



function renderAllShapes() {
  var globalRotMat_1 = new Matrix4().rotate(g_globalAngle_1,0,1,0);
  var globalRotMat_2 = new Matrix4().rotate(g_globalAngle_2,1,0,0);
  var globalRotMat_3 = new Matrix4().rotate(g_globalAngle_3,0,0,1);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix_1, false, globalRotMat_1.elements);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix_2, false, globalRotMat_2.elements);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix_3, false, globalRotMat_3.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniform3f(u_lightPOS, g_lightPOS[0], g_lightPOS[1], g_lightPOS[2]);
  gl.uniform3f(u_cameraPOS, g_camPOS[0], g_camPOS[1], g_camPOS[2]);
  gl.uniform1i(u_lightOn, g_lightOn);

  renderScene(animation_bool);
}

function renderScene(animation_bool) {
  let spin_speed;
  if (spin_bool) {
    spin_speed = g_seconds*swim_speed*100;
    g_globalAngle_3 = spin_speed;
  }

  let SIDE_FINS;
  let TAIL;
  let TFB;
  let TFM;
  let TFT;
  let SNOOT;
  if (animation_bool) {
  	SIDE_FINS = Math.abs(Math.sin(g_seconds*swim_speed)*45);
  	TAIL = Math.sin(g_seconds*swim_speed)*10;
  	TFB = Math.sin(g_seconds*swim_speed)*10;
  	TFM = Math.sin(g_seconds*swim_speed)*20;
  	TFT = Math.sin(g_seconds*swim_speed)*30;
  	SNOOT = (-Math.abs(Math.sin(g_seconds*swim_speed)*1.3)*.4)-.3;
  } else {
  	SIDE_FINS = side_fins_angle;
  	TAIL = tail_angle;
  	TFB = top_base_angle;
  	TFM = top_second_angle;
  	TFT = top_third_angle;
  	SNOOT = -0.4;
  }

  let sizer = 2;



  /////////////////////////////////
  /////////lights////////////////
  //////////////////

  if (light_anime_bool) {
    g_lightPOS[0] = Math.cos(g_seconds)/1.2;
    g_lightPOS[1] = Math.cos(g_seconds)/1.2;
  }

  var light1 = new Cube();
  light1.matrix.translate(g_lightPOS[0],g_lightPOS[1],g_lightPOS[2]);
  light1.matrix.scale(-.05,-.05,-.05);
  light1.color = [1,1,0,1];
  light1.render();




  var camtest = new Cube();
  camtest.matrix.translate(Math.sin(g_globalAngle_1/57.295)*10,0,-Math.cos(g_globalAngle_1/57.295)*10);
  camtest.matrix.scale(-.05,-.05,-.05);
  camtest.color = [.5,.9,.5,1];
  camtest.render();
  //console.log(camtest.get_POS());
  g_camPOS = [camtest.get_POS()[0],camtest.get_POS()[1],camtest.get_POS()[2]];


  /////////////////////////////////
  /////////balls////////////////
  //////////////////


  var puffer1 = new Sphere();
  if (g_normalsON) puffer1.textureNum = -3;
  puffer1.matrix.translate(-.5,-.5,.5);
  puffer1.matrix.scale(.25,.25,.25);
  puffer1.color = [.9,.9,.3,1];
  puffer1.render();

  var puffer2 = new Sphere();
  if (g_normalsON) puffer2.textureNum = -3;
  puffer2.matrix.translate(.5,.5,-.25);
  puffer2.matrix.scale(.25,.25,.25);
  puffer2.color = [.9,.9,.3,1];
  puffer2.render();


  /////////////////////////////////
  /////////fish////////////////
  //////////////////

  var body = new Cube();
  if (g_normalsON) body.textureNum = -3;
  body.matrix.translate(-.25/sizer,-.5/sizer,0/sizer);
  body.matrix.scale(.5/sizer,.5/sizer,.7/sizer);
  body.color = [.9,.9,.3,1];
  body.render();

  var snout = new Cube();
  if (g_normalsON) snout.textureNum = -3;
  snout.matrix.rotate(45, 1,0,0);
  snout.matrix.translate(-.105/sizer,-.1/sizer,.2/sizer);
  snout.matrix.scale(.2/sizer,SNOOT/sizer,.2/sizer);
  snout.color = [.9,.9,.3,1];
  snout.render();

  var eye1 = new Cube();
  if (g_normalsON) eye1.textureNum = -3;
  eye1.matrix.translate(.1/sizer,-.1/sizer,-.1/sizer);
  eye1.matrix.scale(.2/sizer,.2/sizer,.2/sizer);
  eye1.color = [1,1,1,1];
  eye1.render();

  var eye2 = new Cube();
  if (g_normalsON) eye2.textureNum = -3;
  eye2.matrix.translate(-.3/sizer,-.1/sizer,-.1/sizer);
  eye2.matrix.scale(.2/sizer,.2/sizer,.2/sizer);
  eye2.color = [1,1,1,1];
  eye2.render();

  var pup1 = new Cube();
  if (g_normalsON) pup1.textureNum = -3;
  pup1.matrix.translate(.15/sizer,-.05/sizer,-.15/sizer);
  pup1.matrix.scale(.1/sizer,.1/sizer,.1/sizer);
  pup1.color = [.2,0,0,1];
  pup1.render();

  var pup2 = new Cube();
  if (g_normalsON) pup2.textureNum = -3;
  pup2.matrix.translate(-.25/sizer,-.05/sizer,-.15/sizer);
  pup2.matrix.scale(.1/sizer,.1/sizer,.1/sizer);
  pup2.color = [.2,0,0,1];
  pup2.render();

  //// ANIMATED AND MOVING ////
  /////////////////////////////
  /////////////////////////////
  /////////////////////////////
  var fin1 = new Cube();
  if (g_normalsON) fin1.textureNum = -3;
  fin1.matrix.rotate(SIDE_FINS, 1,0,0);
  fin1.matrix.translate(.15/sizer,-.15/sizer,.3/sizer);
  fin1.matrix.scale(.2/sizer,.4/sizer,.2/sizer);
  fin1.color = [.5,.5,.2,1];
  fin1.render();

  var fin2 = new Cube();
  if (g_normalsON) fin2.textureNum = -3;
  fin2.matrix.rotate(SIDE_FINS, 1,0,0);
  fin2.matrix.translate(-.35/sizer,-.15/sizer,.3/sizer);
  fin2.matrix.scale(.2/sizer,.4/sizer,.2/sizer);
  fin2.color = [.5,.5,.2,1];
  fin2.render();

  var base_tail = new Cube();
  if (g_normalsON) base_tail.textureNum = -3;
  base_tail.matrix.rotate(TAIL, 0,1,0);
  base_tail.matrix.translate(-.05/sizer,-.6/sizer,0.65/sizer);
  base_tail.matrix.scale(.1/sizer,.7/sizer,.2/sizer);
  base_tail.color = [.5,.5,.2,1];
  base_tail.render();
  
  var top_fin_base = new Cube();
  if (g_normalsON) top_fin_base.textureNum = -3;
  top_fin_base.matrix.rotate(TFB, 0,1,0);
  top_fin_base.matrix.translate(-.05/sizer,-.2/sizer,.25/sizer);
  top_fin_base.matrix.scale(.1/sizer,.4/sizer,.2/sizer);
  top_fin_base.color = [.5,.5,.2,1];
  top_fin_base.render();

  var mid_top_fin = new Cube();
  if (g_normalsON) mid_top_fin.textureNum = -3;
  mid_top_fin.matrix = top_fin_base.matrix;
  mid_top_fin.matrix.rotate(TFM, 0,1,0);
  mid_top_fin.matrix.translate(0.15/sizer,0.75/sizer,.15/sizer);
  mid_top_fin.matrix.scale(.75/sizer,.75/sizer,.75/sizer);
  mid_top_fin.color = [.5,.5,.2,1];
  mid_top_fin.render();

  var top_top_fin = new Cube();
  if (g_normalsON) top_top_fin.textureNum = -3;
  top_top_fin.matrix = mid_top_fin.matrix;
  top_top_fin.matrix.rotate(TFT, 0,1,0);
  top_top_fin.matrix.translate(0.15/sizer,0.9/sizer,.125/sizer);
  top_top_fin.matrix.scale(.75/sizer,.5/sizer,.75/sizer);
  top_top_fin.color = [.5,.5,.2,1];
  top_top_fin.render();

}

