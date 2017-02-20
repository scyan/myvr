var getWebGLContext = require('./context');
var getshaders=require('./shader');
 // var canvas = document.getElementById("glcanvas");
var gl=getWebGLContext();
function start(){

	  // Initialize the GL context
	  // gl = getWebGLContext();
	  
	  // Only continue if WebGL is available and working
	  if (!gl) {
	    return;
	  }

	  // Set clear color to black, fully opaque
	  gl.clearColor(0.0, 0.0, 0.0, 1.0);
	  // Enable depth testing
	  // gl.enable(gl.DEPTH_TEST);
	  // Near things obscure far things
	  // gl.depthFunc(gl.LEQUAL);
	  // Clear the color as well as the depth buffer.
	  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

start();
getshaders(gl);
function initBuffers() {
  squareVerticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
  
  var vertices = [
    1.0,  1.0,  0.0,
    -1.0, 1.0,  0.0,
    1.0,  -1.0, 0.0,
    -1.0, -1.0, 0.0
  ];
  
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}
initBuffers();
function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //透视角度 45° ，canvas width/height,距离相机0.1到100个单位的物体被渲染
  // perspectiveMatrix = makePerspective(45, 640.0/480.0, 0.1, 100.0);
  
  // loadIdentity();
  // mvTranslate([-0.0, 0.0, -6.0]);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  // setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
drawScene();
function loadIdentity() {
  mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
  mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
  multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms() {
  var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

  var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}
