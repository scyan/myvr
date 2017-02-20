var getWebGLContext=require('./context');
var {Matrix4,Vector3}=require('lib/cuon-matrix');
var initShaders=require('./shader');
var canvas={
	width:400,
	height:400
}
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
  'gl_Position =u_mvpMatrix   * a_position;\n'+
  'v_normal = normalize(vec3(u_normalMatrix*a_normal));\n'+//变换后的法向量
  'v_position =vec3(u_modelMatrix * a_position);\n'+
  // 'vec3 normal=normalize(vec3(u_normalMatrix*a_normal));\n'+//归一化法向量，使其长度为1
  // 'float dotL=max(dot(u_lightDirection,normal),0.0);\n'+//光线方向和法向量点积得到cos0 0:光线颜色和法向量的夹角
  // 'vec3 u_pDirection=normalize(u_lightPosition-vec3(u_modelMatrix*a_position));\n'+//归一化点光源方向，点光源位置-顶点位置
  // 'float dotP=max(dot(u_pDirection,normal),0.0);\n'+//点光源cos
  // 'vec3 diffuseP=u_pColor * vec3(a_color) * dotP;\n'+//点光源颜色
  // 'vec3 diffuse=u_lightColor * vec3(a_color) * dotL;\n'+//漫反射颜色=光线颜色*基础色*cos0	
  // 'vec3 ambient=u_ambientColor*vec3(a_color);\n'+
  ' v_color=a_color;\n'+
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
  '  gl_FragColor = vec4(diffuseL+diffusep+ambientColor,v_color.a);\n' + // Set the point color
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
	var n=initVertexBuffer(gl);

	var mvpMatrix = new Matrix4();
	mvpMatrix.setPerspective(30, 1, 1, 100);
	mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
	var modelMatrix=new Matrix4();
	// modelMatrix.setTranslate(0,1,0);
	// modelMatrix.rotate(90,0,0,1);
	mvpMatrix.multiply(modelMatrix);
	var u_mvpMatrix=gl.getUniformLocation(gl.program,'u_mvpMatrix');
	gl.uniformMatrix4fv(u_mvpMatrix,false,mvpMatrix.elements);

	var u_modelMatrix=gl.getUniformLocation(gl.program,'u_modelMatrix');
	gl.uniformMatrix4fv(u_modelMatrix,false,modelMatrix.elements);

	var normalMatrix=new Matrix4();
	var u_normalMatrix=gl.getUniformLocation(gl.program,'u_normalMatrix');
	normalMatrix.setInverseOf(modelMatrix);//将自己作为modelMatrix的逆矩阵
	normalMatrix.transpose();//转置		
	gl.uniformMatrix4fv(u_normalMatrix,false,normalMatrix.elements);
	//平行光颜色
	var u_lightColor=gl.getUniformLocation(gl.program,'u_lightColor');
	gl.uniform3f(u_lightColor, .2, .2, .2);
	//平行光方向
	var u_lightDirection=gl.getUniformLocation(gl.program,'u_lightDirection');
	var lightDirection = new Vector3([0.5, 3.0, 4.0]);
	lightDirection.normalize();     // Normalize
	gl.uniform3fv(u_lightDirection, lightDirection.elements);

	//点光源位置
	var u_lightPosition=gl.getUniformLocation(gl.program,'u_lightPosition');
	gl.uniform3f(u_lightPosition,0,3,4);
	//点光源颜色
	var u_pColor=gl.getUniformLocation(gl.program,'u_pColor');
	gl.uniform3f(u_pColor,0,.3,0);

	var u_ambientColor=gl.getUniformLocation(gl.program,'u_ambientColor');
	gl.uniform3f(u_ambientColor,.2,.2,.2);
	//---------------
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
	//----------------
	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

}
main();

function initVertexBuffer(gl){
	var n=9;


	

  var vertices = new Float32Array([   // Vertex coordinates
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
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