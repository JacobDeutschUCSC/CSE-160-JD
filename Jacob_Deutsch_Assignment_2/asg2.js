// asg2.js
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix_1;
  uniform mat4 u_GlobalRotateMatrix_2;
  uniform mat4 u_GlobalRotateMatrix_3;
  void main() {
    gl_Position = u_GlobalRotateMatrix_1 * u_GlobalRotateMatrix_2 * u_GlobalRotateMatrix_3 * u_ModelMatrix * a_Position;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

// GLOBALS
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix_1;
let u_GlobalRotateMatrix_2;
let u_GlobalRotateMatrix_3;
let g_globalAngle_1 = 45;
let g_globalAngle_2 = 0;
let g_globalAngle_3 = 0;
let side_fins_angle = 45;
let tail_angle = 0;
let top_base_angle = 0;
let top_second_angle = 0;
let top_third_angle = 0;
let animation_bool = true;
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

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  u_GlobalRotateMatrix_1 = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix_1');
  u_GlobalRotateMatrix_2 = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix_2');
  u_GlobalRotateMatrix_3 = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix_3');

  if (a_Position < 0) { console.log('Failed to get the storage location of a_Position'); return; }
  if (!u_FragColor) { console.log('Failed to get the storage location of u_FragColor'); return; }
  if (!u_ModelMatrix) { console.log('Failed to get the storage location of u_ModelMatrix'); return; }
  if (!u_GlobalRotateMatrix_1) { console.log('Failed to get the storage location of u_GlobalRotateMatrix_1'); return; }
  if (!u_GlobalRotateMatrix_2) { console.log('Failed to get the storage location of u_GlobalRotateMatrix_2'); return; }
  if (!u_GlobalRotateMatrix_3) { console.log('Failed to get the storage location of u_GlobalRotateMatrix_3'); return; }
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function connectWebControls() {
  document.getElementById('angleSlide1').addEventListener('mousemove', function() {g_globalAngle_1 = this.value; renderAllShapes(); });
  document.getElementById('angleSlide2').addEventListener('mousemove', function() {g_globalAngle_2 = this.value; renderAllShapes(); });
  document.getElementById('angleSlide3').addEventListener('mousemove', function() {g_globalAngle_3 = this.value; renderAllShapes(); });

  document.getElementById('finSlide').addEventListener('mousemove', function() {side_fins_angle = this.value; renderAllShapes(); });
  document.getElementById('tailSlide').addEventListener('mousemove', function() {tail_angle = this.value; renderAllShapes(); });

  document.getElementById('tfb').addEventListener('mousemove', function() {top_base_angle = this.value; renderAllShapes(); });
  document.getElementById('tfm').addEventListener('mousemove', function() {top_second_angle = this.value; renderAllShapes(); });
  document.getElementById('tft').addEventListener('mousemove', function() {top_third_angle = this.value; renderAllShapes(); });

  document.getElementById('swim_speed').addEventListener('mousemove', function() {swim_speed = this.value; renderAllShapes(); });

  document.getElementById('animation_on').onclick = function() { animation_bool = true; renderAllShapes(); };
  document.getElementById('animation_off').onclick = function() { animation_bool = false; renderAllShapes(); };

  document.getElementById('spin_on').onclick = function() { spin_bool = true; renderAllShapes(); };
  document.getElementById('spin_off').onclick = function() { spin_bool = false;  renderAllShapes(); };
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

  var body = new Cube();
  body.matrix.translate(-.25,-.5,0);
  body.matrix.scale(.5,.5,.7);
  body.color = [.9,.9,.3,1];
  body.render();

  var snout = new Cube();
  snout.matrix.rotate(45, 1,0,0);
  snout.matrix.translate(-.105,-.1,.2);
  snout.matrix.scale(.2,SNOOT,.2);
  snout.color = [.9,.9,.3,1];
  snout.render();

  var eye1 = new Cube();
  eye1.matrix.translate(.1,-.1,-.1);
  eye1.matrix.scale(.2,.2,.2);
  eye1.color = [1,1,1,1];
  eye1.render();

  var eye2 = new Cube();
  eye2.matrix.translate(-.3,-.1,-.1);
  eye2.matrix.scale(.2,.2,.2);
  eye2.color = [1,1,1,1];
  eye2.render();

  var pup1 = new Cube();
  pup1.matrix.translate(.15,-.05,-.15);
  pup1.matrix.scale(.1,.1,.1);
  pup1.color = [.2,0,0,1];
  pup1.render();

  var pup2 = new Cube();
  pup2.matrix.translate(-.25,-.05,-.15);
  pup2.matrix.scale(.1,.1,.1);
  pup2.color = [.2,0,0,1];
  pup2.render();

  //// ANIMATED AND MOVING ////
  /////////////////////////////
  /////////////////////////////
  /////////////////////////////
  var fin1 = new Cube();
  fin1.matrix.rotate(SIDE_FINS, 1,0,0);
  fin1.matrix.translate(.15,-.15,.3);
  fin1.matrix.scale(.2,.4,.2);
  fin1.color = [.5,.5,.2,1];
  fin1.render();

  var fin2 = new Cube();
  fin2.matrix.rotate(SIDE_FINS, 1,0,0);
  fin2.matrix.translate(-.35,-.15,.3);
  fin2.matrix.scale(.2,.4,.2);
  fin2.color = [.5,.5,.2,1];
  fin2.render();

  var base_tail = new Cube();
  base_tail.matrix.rotate(TAIL, 0,1,0);
  base_tail.matrix.translate(-.05,-.6,0.65);
  base_tail.matrix.scale(.1,.7,.2);
  base_tail.color = [.5,.5,.2,1];
  base_tail.render();
  
  var top_fin_base = new Cube();
  top_fin_base.matrix.rotate(TFB, 0,1,0);
  top_fin_base.matrix.translate(-.05,-.2,.25);
  top_fin_base.matrix.scale(.1,.4,.2);
  top_fin_base.color = [.5,.5,.2,1];
  top_fin_base.render();

  var mid_top_fin = new Cube();
  mid_top_fin.matrix = top_fin_base.matrix;
  mid_top_fin.matrix.rotate(TFM, 0,1,0);
  mid_top_fin.matrix.translate(0.15,0.75,.15);
  mid_top_fin.matrix.scale(.75,.75,.75);
  mid_top_fin.color = [.5,.5,.2,1];
  mid_top_fin.render();

  var top_top_fin = new Cube();
  top_top_fin.matrix = mid_top_fin.matrix;
  top_top_fin.matrix.rotate(TFT, 0,1,0);
  top_top_fin.matrix.translate(0.15,0.9,.125);
  top_top_fin.matrix.scale(.75,.5,.75);
  top_top_fin.color = [.5,.5,.2,1];
  top_top_fin.render();
}

function spin_fish() {

}

