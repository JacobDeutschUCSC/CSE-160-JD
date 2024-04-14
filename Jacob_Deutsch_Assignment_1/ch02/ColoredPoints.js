// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
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
let u_Size;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true})
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor = [1.0,1.0,1.0,1.0]
let g_selSize = 50;
let g_selSeg = 10;
let g_selectedType=POINT;
let g_sizeMode = 0;
let g_segMode = 0;
let g_colorMode = 0;
let g_shapeMode = 0;

function addActionsUI() {
  //document.getElementById('green').onclick = function() { g_selectedColor = [0.0,1.0,0.0,1.0]};
  //document.getElementById('red').onclick = function() { g_selectedColor = [1.0,0.0,0.0,1.0]};

  document.getElementById('clearButton').onclick = function() { g_shapesList = []; renderAllShapes(); };
  document.getElementById('drawBeetle').onclick = function() { g_shapesList = []; renderAllShapes(); drawBeelte(); };

  document.getElementById('normalShapeMode').onclick = function() { g_shapeMode=0; };
  document.getElementById('randomShapeMode').onclick = function() { g_shapeMode=1; };
  document.getElementById('pointButton').onclick = function() { g_selectedType=POINT; };
  document.getElementById('triangleButton').onclick = function() { g_selectedType=TRIANGLE; };
  document.getElementById('circlesButton').onclick = function() { g_selectedType=CIRCLE; };

  document.getElementById('normalColorMode').onclick = function() { g_colorMode=0; };
  document.getElementById('randomColorMode').onclick = function() { g_colorMode=1; };
  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });

  document.getElementById('normalSizeMode').onclick = function() { g_sizeMode=0; };
  document.getElementById('randomSizeMode').onclick = function() { g_sizeMode=1; };
  document.getElementById('normalSegMode').onclick = function() { g_segMode=0; };
  document.getElementById('randomSegMode').onclick = function() { g_segMode=1; };
  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selSize = this.value; });
  document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_selSeg = this.value; });
}

function main() {

  setupWebGL()
  connectVariablesToGLSL()
  addActionsUI()

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

function click(ev) {
  let [x,y] = handleClicks(ev);

  let point;
  if (g_shapeMode==0) {
    if (g_selectedType==POINT) {
      point = new Point();
    } else if (g_selectedType==TRIANGLE) {
      point = new Triangle();
    } else if (g_selectedType==CIRCLE) {
      point = new Circle();
      if (g_segMode==0) {
        point.segments = g_selSeg;
      } else if (g_segMode==1) {
        point.segments = Math.round(getRandom(3, 20));
      }
    }
  } else if (g_shapeMode==1) {
    let randomShape = getRandom(0, 100);
    if (randomShape>66) {
      point = new Point();
    } else if (randomShape>33) {
      point = new Triangle();
    } else if (randomShape>0) {
      point = new Circle();
      if (g_segMode==0) {
        point.segments = g_selSeg;
      } else if (g_segMode==1) {
        point.segments = Math.round(getRandom(3, 20));
      }
    }
  }


  point.position = [x,y];

  if (g_colorMode==0) {
    point.color = g_selectedColor.slice();
  } else if (g_colorMode==1) {
    point.color = [getRandom(0.0, 1.0),getRandom(0.0, 1.0),getRandom(0.0, 1.0),1.0];
  }

  if (g_sizeMode==0) {
    point.size = g_selSize;
  } else if (g_sizeMode==1) {
    point.size = getRandom(5.0, 100.0);
  }
  

  g_shapesList.push(point);

  renderAllShapes();
}

function handleClicks(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

function renderAllShapes() {
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;

  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
}

function easyCustonTriangle(points, color) {
  custom_tri = new customTriangle();
  custom_tri.points = points;
  custom_tri.color = color;
  custom_tri.render();
}

function drawBeelte() {
  white = [1.0, 1.0, 1.0, 1.0];
  black = [0.0, 0.0, 0.0, 1.0];
  red = [1.0, 0.0, 0.0, 1.0];
  blue = [0.0, 0.0, 1.0, 1.0];
  grey = [0.3, 0.3, 0.3, 1.0];
  background_color = [0.7, 0.6, 0.6, 1.0];
  
  //background
  easyCustonTriangle([0, 10,   -10, -10.0,   10, -10.0], background_color);

  //Goliathus albosignatus

  //thorax
  easyCustonTriangle([0, -0.55,   -0.45, 0.3,   0.45, 0.3], white);
  easyCustonTriangle([0, -0.55,   -0.45, 0.0,   0.45, 0.0], background_color);
  easyCustonTriangle([0, 0.8,   -0.45, 0.3,   0.45, 0.3], white);
  easyCustonTriangle([0, 1.0,   -0.25, 0.55,   0.25, 0.55], background_color);
  easyCustonTriangle([-0.05, 0.5,   -0.05, 0.1,   -0.15, 0.25], black);
  easyCustonTriangle([0.05, 0.5,   0.05, 0.1,   0.15, 0.25], black);
  easyCustonTriangle([-0.1, 0.5,   -0.25, 0.1,   -0.3, 0.25], black);
  easyCustonTriangle([0.1, 0.5,   0.25, 0.1,   0.3, 0.25], black);
  easyCustonTriangle([0, 0.55,   -0.075, 0.3,   0.075, 0.3], white);
  easyCustonTriangle([0, 0.0,   -0.075, 0.3,   0.075, 0.3], white);

  //head
  easyCustonTriangle([0, 1.0,   -0.175, 0.58,   0.175, 0.58], white);
  easyCustonTriangle([0, 1.0,   -0.175, 0.85,   0.175, 0.85], background_color);
  easyCustonTriangle([0.1, 0.7,   0.15, 0.6,   0.2, 0.7], black);
  easyCustonTriangle([-0.1, 0.7,   -0.15, 0.6,   -0.2, 0.7], black);
  easyCustonTriangle([0, 0.85,   -0.05, 0.9,   0.05, 0.9], black);
  easyCustonTriangle([0.1, 0.95,   0.05, 0.9,   0.2, 0.95], black);
  easyCustonTriangle([-0.1, 0.95,   -0.05, 0.9,   -0.2, 0.95], black);

  //abdomen
  easyCustonTriangle([0, -5.0,   0.0, -0.7,   0.5, 0.3], white);
  easyCustonTriangle([0, -5.0,   -0.5, 0.3,   0.0, -0.7], white);
  easyCustonTriangle([0, -10.0,   -0.45, -0.8,   0.45, -0.8], background_color);
  easyCustonTriangle([0, -0.8,   -0.4, -0.04,   0.4, -0.04], white);
  easyCustonTriangle([0, -0.3,   -0.1, -0.04,   0.1, -0.04], black);
  easyCustonTriangle([0, -0.8,   -0.025, -0.04,   0.025, -0.04], black);
  easyCustonTriangle([0, -0.04,   -0.025, -0.8,   0.025, -0.8], black);
  easyCustonTriangle([0, -0.5,   -0.05, -0.8,   0.05, -0.8], black);
  easyCustonTriangle([0, -0.9,   -0.3, -0.84,   0.3, -0.84], white);
  easyCustonTriangle([-0.15, -0.7,   -0.1, -0.2,   -0.4, -0.1], black);
  easyCustonTriangle([0.15, -0.7,   0.1, -0.2,   0.4, -0.1], black);
  easyCustonTriangle([-0.05, -0.4,   -0.2, -0.3,   -0.425, -0.35], white);
  easyCustonTriangle([0.05, -0.4,   0.2, -0.3,   0.425, -0.35], white);
  easyCustonTriangle([-0.05, -0.5,   -0.2, -0.5,   -0.425, -0.4], white);
  easyCustonTriangle([0.05, -0.5,   0.2, -0.5,   0.425, -0.4], white);

  //legs
  easyCustonTriangle([0.6, -0.7,   0.55, -0.95,   0.5, 0.0], black);
  easyCustonTriangle([-0.6, -0.7,   -0.55, -0.95,   -0.5, 0.0], black);
  easyCustonTriangle([0.75, -0.5,   0.75, -0.85,   0.525, 0.2], black);
  easyCustonTriangle([-0.75, -0.5,   -0.75, -0.85,   -0.525, 0.2], black);
  easyCustonTriangle([0.75, 0.55,   0.95, 0.95,   0.45, 0.35], black);
  easyCustonTriangle([-0.75, 0.55,   -0.95, 0.95,   -0.45, 0.35], black);
}



