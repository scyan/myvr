var getWebGLContext=require('./context');
var {Matrix4,Vector3}=require('lib/cuon-matrix');
var initShaders=require('./shader');
var vshader = 
  'attribute vec4 a_position; \n'+
  'uniform mat4 u_mvpMatrix;\n'+
  'uniform mat4 u_modelMatrix;\n'+
  'uniform mat4 u_normalMatrix;\n'+//变换矩阵
  'attribute vec4 a_color;\n'+
  'varying vec4 v_color;\n'+
  'attribute vec4 a_normal;\n'+//法向量
  'varying vec3 v_normal;\n'+
  'varying vec3 v_position;\n'+
  'void main() {\n' +
  'gl_Position =u_mvpMatrix * u_modelMatrix  * a_position;\n'+
  'v_normal = normalize(vec3(u_normalMatrix*a_normal));\n'+//变换后的法向量
  'v_position =vec3(u_modelMatrix * a_position);\n'+
  'v_color=a_color;\n'+
  '}\n';

 var fshader =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
   'uniform vec3 u_lightDirection;\n'+//平行光方向
  'uniform vec3 u_lightColor;\n'+//平行光颜色
  'uniform vec3 u_ambientColor;\n'+//环境光颜色
  'uniform vec3 u_lightPosition;\n'+//点光源位置
  'uniform vec3 u_pColor;\n'+//点光源颜色
  'varying vec4 v_color; \n'+
  'varying vec3 v_normal;\n'+
  'varying vec3 v_position;\n'+
  'void main() {\n' +
  'vec3 normal=normalize(v_normal);\n'+//法向量
  'vec3 pDirection=normalize(u_lightPosition - v_position);\n'+
  'float dotL = max (dot(normal,u_lightDirection),0.0);\n'+//光线方向和法向量点击
  'float dotP= max(dot(normal,pDirection),0.0);\n'+
  'vec3 diffuseL = u_lightColor * vec3(v_color) * dotL;\n'+
  'vec3 diffusep = u_pColor * vec3(v_color) * dotP;\n'+
  'vec3 ambientColor=u_ambientColor*vec3(v_color);\n'+
  'gl_FragColor = vec4(diffuseL+diffusep+ambientColor,v_color.a);\n' + // Set the point color
  '}\n';
var canvas={
	width:400,
	height:400
}
var gl=getWebGLContext('canvas');

//暂存matrix
var g_matrixStack = []; // Array for storing a matrix
function pushMatrix(m) { // Store the specified matrix to the array
  var m2 = new Matrix4(m);
  g_matrixStack.push(m2);
}

function popMatrix() { // Retrieve the matrix from the array
  return g_matrixStack.pop();
}

function init(gl){
	gl.clearColor(0,0,0,1);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.POLYGON_OFFSET_FILL);
	gl.polygonOffset(1.0,1.0);
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
}

function setView(gl){
	var mvpMatrix = new Matrix4();
	mvpMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0);
	mvpMatrix.lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
	var u_mvpMatrix=gl.getUniformLocation(gl.program,'u_mvpMatrix');
	gl.uniformMatrix4fv(u_mvpMatrix,false,mvpMatrix.elements);
}


//设置平行光
function setParallelLight(gl){
	//平行光颜色
	var u_lightColor=gl.getUniformLocation(gl.program,'u_lightColor');
	gl.uniform3f(u_lightColor, 1, 1, 1);
	//平行光方向
	var u_lightDirection=gl.getUniformLocation(gl.program,'u_lightDirection');
	var lightDirection = new Vector3([0.5, 3.0, 4.0]);
	lightDirection.normalize();     // Normalize
	gl.uniform3fv(u_lightDirection, lightDirection.elements);
}
function setPointLight(gl){
	//点光源位置
	var u_lightPosition=gl.getUniformLocation(gl.program,'u_lightPosition');
	gl.uniform3f(u_lightPosition,0,3,4);
	//点光源颜色
	var u_pColor=gl.getUniformLocation(gl.program,'u_pColor');
	gl.uniform3f(u_pColor,0,.3,0);
}
function setAmbientLight(gl){
	var u_ambientColor=gl.getUniformLocation(gl.program,'u_ambientColor');
	gl.uniform3f(u_ambientColor,.2,.2,.2);
}
function setTransform(gl,modelMatrix){

  var u_modelMatrix=gl.getUniformLocation(gl.program,'u_modelMatrix');
  gl.uniformMatrix4fv(u_modelMatrix,false,modelMatrix.elements);

  //法向量的变换矩阵
  var normalMatrix=new Matrix4();
  var u_normalMatrix=gl.getUniformLocation(gl.program,'u_normalMatrix');
  normalMatrix.setInverseOf(modelMatrix);//将自己作为modelMatrix的逆矩阵
  normalMatrix.transpose();//转置   
  gl.uniformMatrix4fv(u_normalMatrix,false,normalMatrix.elements);
}

function drawBox(gl,n,modelMatrix,width,height,depth){
  if(width||height||depth){
    pushMatrix(modelMatrix);
    modelMatrix.scale(width,height,depth);
  }
	setTransform(gl,modelMatrix);
	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  return popMatrix();
}
var ANGLE_STEP = 3.0;     // The increments of rotation angle (degrees)
var g_arm1Angle = 0//90.0;   // The rotation angle of arm1 (degrees)
var g_joint1Angle = 0//45.0; // The rotation angle of joint1 (degrees)
var g_joint2Angle = 0.0;  // The rotation angle of joint2 (degrees)
var g_joint3Angle = 0.0;  // The rotation angle of joint3 (degrees)
function draw(gl,n){
  var g_modelMatrix=new Matrix4();
  
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw a base
  var baseHeight = 2.0;
  g_modelMatrix.setTranslate(0.0, -12.0, 0.0);
  g_modelMatrix=drawBox(gl, n, g_modelMatrix,10.0,baseHeight,10.0);
  
 
  // Arm1
  var arm1Length = 10.0;
  g_modelMatrix.translate(0.0, baseHeight, 0.0);     // Move onto the base
  g_modelMatrix.rotate(g_arm1Angle, 0.0, 1.0, 0.0);  // Rotate around the y-axis
  g_modelMatrix=drawBox(gl, n,g_modelMatrix,3.0,arm1Length,3.0); // Draw

  // Arm2
  var arm2Length = 10.0;
  g_modelMatrix.translate(0.0, arm1Length, 0.0);       // Move to joint1
  g_modelMatrix.rotate(g_joint1Angle, 0.0, 0.0, 1.0);  // Rotate around the z-axis
  g_modelMatrix=drawBox(gl, n, g_modelMatrix,4.0,arm2Length,4.0); // Draw

  // A palm
  var palmLength = 2.0;
  g_modelMatrix.translate(0.0, arm2Length, 0.0);       // Move to palm
  g_modelMatrix.rotate(g_joint2Angle, 0.0, 1.0, 0.0);  // Rotate around the y-axis
  g_modelMatrix=drawBox(gl, n, g_modelMatrix,2.0, palmLength, 6.0);  // Draw

  // Move to the center of the tip of the palm
  g_modelMatrix.translate(0.0, palmLength, 0.0);

  // Draw finger1
  pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0.0, 0.0, 2.0);
    g_modelMatrix.rotate(g_joint3Angle, 1.0, 0.0, 0.0);  // Rotate around the x-axis
    drawBox(gl, n, g_modelMatrix,1.0, 2.0, 1.0);
  g_modelMatrix = popMatrix();

  // Draw finger2
  g_modelMatrix.translate(0.0, 0.0, -2.0);
  g_modelMatrix.rotate(-g_joint3Angle, 1.0, 0.0, 0.0);  // Rotate around the x-axis
  drawBox(gl, n, g_modelMatrix,1.0, 2.0, 1.0);

}


function keydown(ev, gl, n) {
    switch (ev.keyCode) {
    case 40: // Up arrow key -> the positive rotation of joint1 around the z-axis
      if (g_joint1Angle < 135.0) g_joint1Angle += ANGLE_STEP;
      break;
    case 38: // Down arrow key -> the negative rotation of joint1 around the z-axis
      if (g_joint1Angle > -135.0) g_joint1Angle -= ANGLE_STEP;
      break;
    case 39: // Right arrow key -> the positive rotation of arm1 around the y-axis
      g_arm1Angle = (g_arm1Angle + ANGLE_STEP) % 360;
      break;
    case 37: // Left arrow key -> the negative rotation of arm1 around the y-axis
      g_arm1Angle = (g_arm1Angle - ANGLE_STEP) % 360;
      break;
    case 90: // 'ｚ'key -> the positive rotation of joint2
      g_joint2Angle = (g_joint2Angle + ANGLE_STEP) % 360;
      break; 
    case 88: // 'x'key -> the negative rotation of joint2
      g_joint2Angle = (g_joint2Angle - ANGLE_STEP) % 360;
      break;
    case 86: // 'v'key -> the positive rotation of joint3
      if (g_joint3Angle < 60.0)  g_joint3Angle = (g_joint3Angle + ANGLE_STEP) % 360;
      break;
    case 67: // 'c'key -> the nagative rotation of joint3
      if (g_joint3Angle > -60.0) g_joint3Angle = (g_joint3Angle - ANGLE_STEP) % 360;
      break;
    default: return; // Skip drawing at no effective action
  }
  // Draw the robot arm
  //  var m=initLineBuffer(gl);
  // drawLine(gl,m);
  // var n=initVertexBuffer(gl);
  draw(gl,n);
}
function drawLine(gl,m){
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  var modelMatrix=new Matrix4();
  setTransform(gl,modelMatrix);
  gl.drawElements(gl.LINES, m, gl.UNSIGNED_BYTE, 0);
}
function main(){
	init(gl);
	initShaders(gl,vshader,fshader);
  setView(gl);
  setParallelLight(gl);
  setPointLight(gl);
  setAmbientLight(gl);
  var m=initLineBuffer(gl);
  drawLine(gl,m);
	var n=initVertexBuffer(gl);
  draw(gl,n);
  document.onkeydown=function(ev){
    keydown(ev,gl,n);
  }
	//---------------
	
	//----------------
	// gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

}
main();
function initLineBuffer(gl){
  
  var vertices = new Float32Array([
     -10.0,0.0,0.0,
     10.0,0.0,0.0
    ]);
  var colors=new Float32Array([
    1.0,0.0,0.0, 1.0,0.0,0.0,
    ])
  var normals=new Float32Array([
    0,0,1, 0,0,1, 
  ]);
  var indices=new Uint8Array([
    0,1,
  ])

  initArrayBuffer(gl,'a_position',vertices,3);
  initArrayBuffer(gl,'a_color',colors,3);
  initArrayBuffer(gl,'a_normal',normals,3);

  var indexBuffer=gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indices,gl.STATIC_DRAW);
  return indices.length;
}
function initVertexBuffer(gl){
	
    var vertices = new Float32Array([   // Vertex coordinates
    0.5, 1.0, 0.5, -0.5, 1.0, 0.5, -0.5, 0.0, 0.5,  0.5, 0.0, 0.5, // v0-v1-v2-v3 front
    0.5, 1.0, 0.5,  0.5, 0.0, 0.5,  0.5, 0.0,-0.5,  0.5, 1.0,-0.5, // v0-v3-v4-v5 right
    0.5, 1.0, 0.5,  0.5, 1.0,-0.5, -0.5, 1.0,-0.5, -0.5, 1.0, 0.5, // v0-v5-v6-v1 up
   -0.5, 1.0, 0.5, -0.5, 1.0,-0.5, -0.5, 0.0,-0.5, -0.5, 0.0, 0.5, // v1-v6-v7-v2 left
   -0.5, 0.0,-0.5,  0.5, 0.0,-0.5,  0.5, 0.0, 0.5, -0.5, 0.0, 0.5, // v7-v4-v3-v2 down
    0.5, 0.0,-0.5, -0.5, 0.0,-0.5, -0.5, 1.0,-0.5,  0.5, 1.0,-0.5  // v4-v7-v6-v5 back
    ]);
    var normals = new Float32Array([    // Normal
      0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
      1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
      0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
     -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
      0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
      0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
    ]);
    var colors = new Float32Array([     // Colors
      1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1,     // v0-v1-v2-v3 front
      1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1,     // v0-v3-v4-v5 right
      1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1,     // v0-v5-v6-v1 up
      1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1,     // v1-v6-v7-v2 left
      1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1,     // v7-v4-v3-v2 down
      1, 1, 1,   1, 1, 1,   1, 1, 1,  1, 1, 1　    // v4-v7-v6-v5 back
    ]);
  
    var indices = new Uint8Array([       // Indices of the vertices
       0, 1, 2,   0, 2, 3,    // front
       4, 5, 6,   4, 6, 7,    // right
       8, 9,10,   8,10,11,    // up
      12,13,14,  12,14,15,    // left
      16,17,18,  16,18,19,    // down
      20,21,22,  20,22,23     // back
    ]);

  	initArrayBuffer(gl,'a_position',vertices,3);
  	initArrayBuffer(gl,'a_color',colors,3);
  	initArrayBuffer(gl,'a_normal',normals,3);
  	var indexBuffer=gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indices,gl.STATIC_DRAW);
	return indices.length;
}
function initArrayBuffer(gl,attribute,data,num){
	var buffer= gl.createBuffer();//创建顶点缓冲区
	if(!buffer){
		console.log('fail create vertex buffer object');
		return -1;
	}
	gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
	gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
	var a_attribute=gl.getAttribLocation(gl.program,attribute);
	gl.vertexAttribPointer(a_attribute,num,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(a_attribute);
}