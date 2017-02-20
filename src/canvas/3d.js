var getWebGLContext=require('./context');
var {Matrix4}=require('lib/cuon-matrix');
var initShaders=require('./shader');
var canvas={
	width:400,
	height:400
}
var vshader = 
  'attribute vec4 a_position; \n'+
  'uniform mat4 u_projMatrix;\n'+//可视空间
  'uniform mat4 u_viewMatrix;\n'+//视点	
  'uniform mat4 u_modelMatrix;\n'+//视点	
  'attribute vec4 a_color;\n'+
  'varying vec4 v_color;\n'+
  'void main() {\n' +
  'gl_Position =u_projMatrix * u_viewMatrix * u_modelMatrix * a_position;\n'+
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
	gl.enable(gl.DEPTH_TEST);//遮挡开关，被遮挡的部分将不会被绘出
	gl.enable(gl.POLYGON_OFFSET_FILL);//解决深度冲突，给深度重叠的物体设置偏移量
	gl.polygonOffset(1.0,1.0);//gl.polygonOffset(factor,units) 偏移量=m*factor+r*units  m:顶点所在表面相对于观察者视线的角度，r:硬件能区分的两个z之差的最小值
	 gl.enable (gl.BLEND);
  // Set blending function
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	
	initShaders(gl,vshader,fshader);
	var viewMatrix = new Matrix4();
	var projMatrix = new Matrix4();
	var modelMatrix = new Matrix4();
	var a_position=gl.getAttribLocation(gl.program,'a_position');
	var a_color=gl.getAttribLocation(gl.program,'a_color');
	var n=initVertexBuffer(gl,a_position,a_color);
	var u_viewMatrix=gl.getUniformLocation(gl.program,'u_viewMatrix');
	var u_projMatrix=gl.getUniformLocation(gl.program,'u_projMatrix');
	var u_modelMatrix=gl.getUniformLocation(gl.program,'u_modelMatrix');
	//------设置可视范围
	// projMatrix.setOrtho(-1,1,-1,1,0,2);//left,right,bottom,top,near,far
	projMatrix.setPerspective(30,canvas.width/canvas.height,1,100);
	gl.uniformMatrix4fv(u_projMatrix,false,projMatrix.elements);
	//------视点
	viewMatrix.setLookAt(0,0,5,0,0,-100,0,1,0);//视点(.2,.25,.25) 观察点(0,0,0) 上方向(0,1,0)
	gl.uniformMatrix4fv(u_viewMatrix,false,viewMatrix.elements);
	//---------------
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
	//----------------
	//right triangles
	modelMatrix.setTranslate(0.75,0,0);
	gl.uniformMatrix4fv(u_modelMatrix,false,modelMatrix.elements);
	draw(gl,n,u_viewMatrix,viewMatrix,u_projMatrix)
	//-----------------
	//left triangles
	modelMatrix.setTranslate(-0.75,0,0);
	gl.uniformMatrix4fv(u_modelMatrix,false,modelMatrix.elements);
	draw(gl,n,u_viewMatrix,viewMatrix,u_projMatrix)
	document.onkeydown=function(e){
		keydown(e,gl,n,u_viewMatrix,viewMatrix);
	}
}
main();
function keydown(ev,gl,n,u_viewMatrix,viewMatrix){
	// if(ev.keyCode==39){//->
	// 	// eye_x+=.01;
	// 	g_near+=.01;
	// }else if(ev.keyCode==37){//<-
	// 	g_near-=.01;
	// }else if(ev.keyCode==38){//up
	// 	g_far+=.01;
	// }else if(ev.keyCode==40){//down
	// 	g_far-=.01;
	// }
	if(ev.keyCode==39){//->
		eye_x+=.01;
	}else if(ev.keyCode==37){//<-
		eye_x-=.01;
	}else {
		return;
	}
	draw(gl,n,u_viewMatrix,viewMatrix);

	// document.getElementById('g_near').innerText=g_near;
	// document.getElementById('g_far').innerText=g_far;
}
function draw(gl,n,u_viewMatrix,viewMatrix){
	
	// viewMatrix.setLookAt(eye_x,eye_y,eye_z,0,0,0,0,1,0);//视点(.2,.25,.25) 观察点(0,0,0) 上方向(0,1,0)
	// viewMatrix.setOrtho(-1,1,-1,1,g_near,g_far);
	// viewMatrix.setLookAt(0,0,5,0,0,-100,0,1,0);//视点(.2,.25,.25) 观察点(0,0,0) 上方向(0,1,0)
	// gl.uniformMatrix4fv(u_viewMatrix,false,viewMatrix.elements);
	// gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES, 0, n);
}
function initVertexBuffer(gl,a_position,a_color){
	var n=9;
	var vBuffer= gl.createBuffer();//创建顶点缓冲区
	if(!vBuffer){
		console.log('fail create vertex buffer object');
		return -1;
	}
	gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer);
	// var vertics = new Float32Array([
 //  // Vertex coordinates and color(RGBA)
 //     0.0,  0.5,  -0.4,  0.4,  1.0,  0.4, // The back green one
 //    -0.5, -0.5,  -0.4,  0.4,  1.0,  0.4,
 //     0.5, -0.5,  -0.4,  1.0,  0.4,  0.4, 
   
 //     0.5,  0.4,  -0.2,  1.0,  0.4,  0.4, // The middle yellow one
 //    -0.5,  0.4,  -0.2,  1.0,  1.0,  0.4,
 //     0.0, -0.6,  -0.2,  1.0,  1.0,  0.4, 

 //     0.0,  0.5,   0.0,  0.4,  0.4,  1.0,  // The front blue one 
 //    -0.5, -0.5,   0.0,  0.4,  0.4,  1.0,
 //     0.5, -0.5,   0.0,  1.0,  0.4,  0.4, 
	// ]);
  var vertics = new Float32Array([
    // Three triangles on the right side
    0.0,   1.0,  -4.0,  0.4,  1.0,  0.4,0.4, // The back green one
   -0.5,  -1.0,  -4.0,  0.4,  1.0,  0.4,0.4,
    0.5,  -1.0,  -4.0,  1.0,  0.4,  0.4, 0.4,

    0.0,   1.0,  -2.0,  1.0,  1.0,  0.4, 0.4,// The middle yellow one
   -0.5,  -1.0,  -2.0,  1.0,  1.0,  0.4,0.4,
    0.5,  -1.0,  -2.0,  1.0,  0.4,  0.4, 0.4,

    0.0,   1.0,   0.0,  0.4,  0.4,  1.0, 0.4, // The front blue one 
   -0.5,  -1.0,   0.0,  0.4,  0.4,  1.0,0.4,
    0.5,  -1.0,   0.0,  1.0,  0.4,  0.4, 0.4,
  ]);
	var fsize=vertics.BYTES_PER_ELEMENT;
	gl.bufferData(gl.ARRAY_BUFFER,vertics,gl.STATIC_DRAW);
	gl.vertexAttribPointer(a_position,3,gl.FLOAT,false,fsize*7,0);
	gl.enableVertexAttribArray(a_position);
	gl.vertexAttribPointer(a_color,4,gl.FLOAT,false,fsize*7,fsize*3);
	gl.enableVertexAttribArray(a_color);
	return n;
}