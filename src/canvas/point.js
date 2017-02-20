var getWebGLContext=require('./context');
var {Matrix4,Vector3}=require('lib/cuon-matrix');
var initShaders=require('./shader');
var vshader = 
  'attribute vec4 a_position;\n' +
  'void main() {\n' +
  '  gl_Position = a_position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '}\n';

 var fshader =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'void main() {\n' +    // Center coordinate is (0.5, 0.5)
  '  float d = distance(gl_PointCoord, vec2(0.5, 0.5));\n' +
  '  if(d < 0.5) {\n' +  // Radius is 0.5
  '    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '  } else { discard; }\n' +
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




function main(){
	init(gl);
	initShaders(gl,vshader,fshader);
	var n=initVertexBuffer(gl);
	gl.drawArrays(gl.POINTS, 0, n);
	//---------------
	
	//----------------
	// gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

}
main();

function initVertexBuffer(gl){
	
  var vertices = new Float32Array([
    0, 0.5,   -0.5, -0.5,   0.5, -0.5
  ]);
  var n = 3; // The number of vertices
  	initArrayBuffer(gl,'a_position',vertices,2,gl.FLOAT);
  	
	return n;
}
function initArrayBuffer(gl,attribute,data,num,type){
	var buffer= gl.createBuffer();//创建顶点缓冲区
	if(!buffer){
		console.log('fail create vertex buffer object');
		return -1;
	}
	gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
	gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
	var a_attribute=gl.getAttribLocation(gl.program,attribute);
	gl.vertexAttribPointer(a_attribute,num,type,false,0,0);
	gl.enableVertexAttribArray(a_attribute);
}