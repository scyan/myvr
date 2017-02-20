var getWebGLContext=require('./context');
var Matrix4=require('lib/cuon-matrix');
var initShaders=require('./shader');
var canvas={
	width:400,
	height:400
}
var vshader = 
  'attribute vec4 a_position; \n'+
  'uniform mat4 u_mvpMatrix;\n'+
  'attribute vec4 a_color;\n'+
  'varying vec4 v_color;\n'+
  'void main() {\n' +
  'gl_Position =u_mvpMatrix   * a_position;\n'+
  ' v_color=a_color;\n'+
  '}\n';

 var fshader =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_color; \n'+
  'void main() {\n' +
  '  gl_FragColor = v_color;\n' + // Set the point color
  '}\n';

var eye_x=.2,eye_y=.25,eye_z=.25;
var g_near=0,g_far=0.5;
function main(){
	var gl=getWebGLContext('canvas');
	gl.clearColor(0,0,0,1);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.POLYGON_OFFSET_FILL);
	gl.polygonOffset(1.0,1.0);
	
	initShaders(gl,vshader,fshader);
	var mvpMatrix = new Matrix4();
mvpMatrix.setPerspective(30, 1, 1, 100);
  mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
	var a_position=gl.getAttribLocation(gl.program,'a_position');
	var a_color=gl.getAttribLocation(gl.program,'a_color');
	var n=initVertexBuffer(gl,a_position,a_color);
	var u_mvpMatrix=gl.getUniformLocation(gl.program,'u_mvpMatrix');
	gl.uniformMatrix4fv(u_mvpMatrix,false,mvpMatrix.elements);
	//------视点
	// viewMatrix.setLookAt(0,0,5,0,0,-100,0,1,0);//视点(.2,.25,.25) 观察点(0,0,0) 上方向(0,1,0)
	// gl.uniformMatrix4fv(u_viewMatrix,false,viewMatrix.elements);
	//---------------
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
	//----------------
	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

}
main();

function initVertexBuffer(gl,a_position,a_color){
	var n=9;
	var vBuffer= gl.createBuffer();//创建顶点缓冲区
	var colorBuffer=gl.createBuffer();
	var indexBuffer=gl.createBuffer();
	if(!vBuffer){
		console.log('fail create vertex buffer object');
		return -1;
	}
	

  var vertics = new Float32Array([   // Vertex coordinates
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
  ]);

  var colors = new Float32Array([     // Colors
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
    0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
    1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
    1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
    0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back
  ]);

  var indices = new Uint8Array([       // Indices of the vertices
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);

	var fsize=vertics.BYTES_PER_ELEMENT;
	gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER,vertics,gl.STATIC_DRAW);
	gl.vertexAttribPointer(a_position,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(a_position);

	gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER,colors,gl.STATIC_DRAW);
	gl.vertexAttribPointer(a_color,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(a_color);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indices,gl.STATIC_DRAW);
	return indices.length;
}