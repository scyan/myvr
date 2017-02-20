var getWebGLContext=require('./context');
var {Matrix4,Vector3,Vector4}=require('lib/cuon-matrix');
var {initShaders}=require('util/shader');
var {initArrayBuffer,initElementArrayBuffer,initFramebuffer,initAttributeVariable}=require('util/buffer');
var cubes=require('../rubik/cubes');
var vshader = 
  'attribute vec4 a_position; \n'+
  'attribute float a_face;\n' +   // Surface number (Cannot use int for attribute variable)
  'varying float v_face;\n' +   // Surface number (Cannot use int for attribute variable)
  'attribute float a_number;\n' +   // Surface number (Cannot use int for attribute variable)
  'varying   float v_number;\n' +   // Surface number (Cannot use int for attribute variable)
  'uniform mat4 u_mvpMatrix;\n'+
  'uniform mat4 u_modelMatrix;\n'+
  'uniform mat4 u_normalMatrix;\n'+//变换矩阵
  
  
  'attribute vec4 a_color;\n'+
  'varying vec4 v_color;\n'+
  'attribute vec4 a_normal;\n'+//法向量
  'varying vec3 v_normal;\n'+
  'varying vec3 v_position;\n'+
  'void main() {\n' +
  // 'int face = int(a_face);\n' + // Convert to int
  'v_face = a_face;\n'+
  'v_number=a_number;\n'+
 
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
  'uniform bool u_clicked;\n' + // Mouse is pressed
  'varying vec4 v_color; \n'+
  'varying vec3 v_normal;\n'+
  'varying vec3 v_position;\n'+
  'varying float v_face;\n' + 
  'varying float v_number;\n' +   // Surface number (Cannot use int for attribute variable)
  // 'varying bool v_clicked;\n'+
  'void main() {\n' +
  'int face = int(v_face);\n' + // Convert to int
  'int number = int(v_number);\n' + // Convert to int
  'vec3 normal=normalize(v_normal);\n'+//法向量
  'vec3 pDirection=normalize(u_lightPosition - v_position);\n'+
  'float dotL = max (dot(normal,u_lightDirection),0.0);\n'+//光线方向和法向量点击
  'float dotP= max(dot(normal,pDirection),0.0);\n'+
  'vec3 diffuseL = u_lightColor * vec3(v_color) * dotL;\n'+
  'vec3 diffusep = u_pColor * vec3(v_color) * dotP;\n'+
  'vec3 ambientColor=u_ambientColor*vec3(v_color);\n'+
  '  if (u_clicked) {\n' + //  Draw in red if mouse is pressed
  '    gl_FragColor = vec4(v_number/255.0, v_face/255.0, 1.0, 1.0);\n' +
  '  } else {\n' +
  '    gl_FragColor = vec4(diffuseL+diffusep+ambientColor,v_color.a);\n' + // Set the point color
  '  }\n' +
  // 'gl_FragColor = vec4(diffuseL+diffusep+ambientColor,v_color.a);\n' + // Set the point color
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
  gl.enable(gl.DEPTH_TEST);//深度遮挡开关
  gl.enable(gl.POLYGON_OFFSET_FILL);
  gl.polygonOffset(1.0,1.0);
  gl.enable (gl.BLEND);
  // Set blending function
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
}

function setView(gl,sight,lookAt){
	var mvpMatrix = new Matrix4();
	//垂直视角，近裁剪面的款高比，视点到近裁剪面的距离，视点到远裁剪面的距离
	mvpMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0);
	mvpMatrix.lookAt(sight[0], sight[1], sight[2], lookAt[0], lookAt[1], lookAt[2], 0.0, 1.0, 0.0);
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
	var lightDirection = new Vector3([20.0, 10.0, 30.0]);
	lightDirection.normalize();     // Normalize
	gl.uniform3fv(u_lightDirection, lightDirection.elements);
}
function setPointLight(gl){
	//点光源位置
	var u_lightPosition=gl.getUniformLocation(gl.program,'u_lightPosition');
	gl.uniform3f(u_lightPosition,0,3,10);
	//点光源颜色
	var u_pColor=gl.getUniformLocation(gl.program,'u_pColor');
	gl.uniform3f(u_pColor,.1,.1,.1);
}
function setAmbientLight(gl){
	var u_ambientColor=gl.getUniformLocation(gl.program,'u_ambientColor');
	gl.uniform3f(u_ambientColor,1,1,1);
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

//控制视点
function sightCtrl(gl,sight,lookAt) {
	var anglex=0,angley=0,anglez=0;
	var angle_step=10;
	sight.push(1);
	var m=new Matrix4();
	var changed=false;
	document.addEventListener('keydown',function(e){

		switch (e.keyCode){
			case 40://down
				anglex=(anglex+angle_step)%360;
				changed=true;
			break;
			case 38://up
				anglex=(anglex-angle_step)%360;
				changed=true;
			break;
			case 37://left
				angley=(angley+angle_step)%360;
				changed=true;
			break;
			case 39://right
				angley=(angley-angle_step)%360;
				changed=true;
			break;
		}
		if(changed){

			var v=new Vector4(sight);
			m.setRotate(anglex,1,0,0);
			m.rotate(angley,0,1,0);
			v=m.multiplyVector4(v);
			setView(gl,v.elements,lookAt);
			draw(gl);
			changed=false;
		}
	})
	
		//a:65 d:68 w:87 s:83
}
function isClickCube(gl,ev){
	var x = ev.clientX, y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    
    // if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      // If pressed position is inside <canvas>, check if it is above object
    var x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
    var picked = check(gl,  x_in_canvas, y_in_canvas);
   return picked;
    // }
}
function check(gl,  x, y) {
	
  var picked = false;
  gl.uniform1i(gl.program.u_clicked, 1);  // Pass true to u_Clicked
  draw(gl); // Draw cube with red
  // Read pixel at the clicked position
  var pixels = new Uint8Array(4); // Array for storing the pixel value
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
console.log(pixels)
  if (pixels[2] == 255) // The mouse in on cube if R(pixels[0]) is 255
    picked = true;

  gl.uniform1i(gl.program.u_clicked, 0);  // Pass false to u_Clicked(rewrite the cube)
  draw(gl); // Draw the cube
  
  return picked;
}
//控制观察点
function lookAtCtrl(gl,sight,lookAt){

	var angley=0,anglex=0;
	var angley_step=10,anglex_step=10;
	var mousedown=false;
	var x,y;
	var m=new Matrix4();
	lookAt.push(1);
	var cc=document.getElementById('canvas');
	var last_time;

	cc.addEventListener('mousedown',function(e){
		if(isClickCube(gl,e)){
			return;
		}
		mousedown=true;
		x=e.offsetX;
		y=e.offsetY;
		last_time=+new Date();
		last=[0,0,0]
	})
	cc.addEventListener('mousemove',function(e){
		if(mousedown){
			var changed=false;
			var now=+new Date();
			if(now-last_time<20){
				return;
			}
			last_time=now;
			var v=new Vector4(lookAt);
			m.setTranslate(0,0,0);
			//沿着Z负轴移动10
			m.setTranslate(0,0,10);
			if(Math.abs(e.offsetX-x)>5){
				if(e.offsetX>x){
					angley=(angley-angley_step)%360;
				}else if(e.offsetX<x){
					angley=(angley+angley_step)%360;
				}
				// m.rotate(angley,0,1,0);
				changed=true;
				x=e.offsetX;

				// var m2=new Matrix4(m);
				// v=m2.multiplyVector4(v);
			}
			m.rotate(angley,0,1,0);
			if(Math.abs(e.offsetY-y)>5){
				
				if(e.offsetY>y){
					anglex=(anglex-anglex_step)%360;
				}else if(e.offsetY<y){
					
					anglex=(anglex+anglex_step)%360;
				}
				// m.rotate(anglex,1,0,0);
				
				changed=true;
				y=e.offsetY;
			}
			m.rotate(anglex,1,0,0);

			if(changed){
				m.translate(0,0,-10);
				v=m.multiplyVector4(v);


				last=[v.elements[0],v.elements[1],v.elements[2]]
				setView(gl,sight,v.elements);
				draw(gl);
			}
			
		}
	})
	cc.addEventListener('mouseup',function(e){
		mousedown=false;
	})
}

function main(){
	var sight=[10,10,10];
	var lookAt=[0,0,0];
    init(gl);
    initShaders(gl,vshader,fshader);
    setView(gl,sight,lookAt);
    setParallelLight(gl);
    setPointLight(gl);
    setAmbientLight(gl);
    
    initParams(gl);
    gl.uniform1i(gl.program.u_clicked, 0); 
    draw(gl);
    // mouseEvent(gl,sight,lookAt)
	lookAtCtrl(gl,sight,lookAt);
	sightCtrl(gl,sight,lookAt);
	operate(gl);
}
main();
function operate(gl){
	document.addEventListener('keydown',function(e){
		console.log(e.keyCode);
		switch(e.keyCode){
			case 70://front
			// var extraMatrix=new Matrix4();
			// extraMatrix.setRotate(90,0,0,1);
			draw(gl,null,'f1');
			break;
		}
	})

}
function initParams(gl){
	var program=gl.program;
	program.a_position=gl.getAttribLocation(gl.program,'a_position');
	program.a_color=gl.getAttribLocation(gl.program,'a_color');
	program.a_normal=gl.getAttribLocation(gl.program,'a_normal');
	program.a_face=gl.getAttribLocation(gl.program,'a_face');
	program.a_number=gl.getAttribLocation(gl.program,'a_number');
	program.u_clicked=gl.getUniformLocation(gl.program, 'u_clicked');
}

function draw(gl){
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

	Object.keys(cubes).map(function(cubeName){
		var cube=cubes[cubeName];
		drawCube(gl,cube);
	})


}
function drawCube(gl,cube){

  if(!cube.vertexBuffer){
  	initVertexBuffer(gl,cube)
  

  }
  
  // var m=cube.modelMatrix;
 //  if(rotateFace){
	// m=setExtraTransition(gl,cube);
 //  }
 var m=getTrueMatrix(cube);
  

  setTransform(gl,m);
  var program=gl.program;
 // 顶点buffer
  initAttributeVariable(gl, program.a_position, cube.vertexBuffer); // Vertex coordinates
  //法向量buffer
  initAttributeVariable(gl, program.a_normal, cube.normalBuffer);   // Normal
  initAttributeVariable(gl, program.a_color, cube.colorBuffer);   // color
  initAttributeVariable(gl,program.a_face,cube.faceBuffer);
  initAttributeVariable(gl,program.a_number,cube.numberBuffer);
  //索引buffer
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cube.indexBuffer);  // Bind indices

  gl.drawElements(gl.TRIANGLES, cube.indexNum, cube.indexBuffer.type, 0);   // Draw
}
function getTrueMatrix(cube){
	var modelMatrix=new Matrix4(cube.modelMatrix);
	var extraMatrix=new Matrix4(cube.extraMatrix);
	modelMatrix=extraMatrix.multiply(modelMatrix);
	cube.trueMatrix=modelMatrix;
	return modelMatrix;
}
function setExtraTransition(gl,cube,rotateFace){
	var modelMatrix=new Matrix4(cube.modelMatrix);
	var extraMatrix=new Matrix4(cube.extraMatrix);
	modelMatrix=extraMatrix.multiply(modelMatrix);
	e.trueMatrix=modelMatrix;
	if(rotateFace=='f1'){
		if(checkFace(modelMatrix.elements[14])){
			var e=new Matrix4();
			e.setRotate(90,0,0,1);
			e.multiply(cube.extraMatrix);
			cube.extraMatrix=new Matrix4(e);
			// cube.extraMatrix=e.multiply(extraMatrix);
			// cube.trueMatrix= e.multiply(cube.modelMatrix);
			return  e.multiply(cube.modelMatrix);
		}
	}
	// if(rotateFace=='f1')
	return modelMatrix;
}
function checkFace(translate){
	return Math.floor(translate*10)/10==2.2;
}
function initVertexBuffer(gl,cube){
	    // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
    var vertices = new Float32Array([   // Vertex coordinates
	    1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
	    1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
	    1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
	   -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
	   -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
	    1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
    ]);
    var normals = new Float32Array([    // Normal
      0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
      1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
      0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
     -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
      0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
      0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
    ]);
    var faces = new Uint8Array([   // Faces
	    1, 1, 1, 1,     // v0-v1-v2-v3 front
	    2, 2, 2, 2,     // v0-v3-v4-v5 right
	    3, 3, 3, 3,     // v0-v5-v6-v1 up
	    4, 4, 4, 4,     // v1-v6-v7-v2 left
	    5, 5, 5, 5,     // v7-v4-v3-v2 down
	    6, 6, 6, 6,     // v4-v7-v6-v5 back
	]);
    var colors = cube.color;
  	var numbers=[]
  	for(var i=0;i<24;i++){
  		numbers.push(cube.number);
  	}
  	numbers=new Uint8Array(numbers);
    var indices = new Uint8Array([       // Indices of the vertices
       0, 1, 2,   0, 2, 3,    // front
       4, 5, 6,   4, 6, 7,    // right
       8, 9,10,   8,10,11,    // up
      12,13,14,  12,14,15,    // left
      16,17,18,  16,18,19,    // down
      20,21,22,  20,22,23     // back
    ]);
    

    cube.vertexBuffer=initArrayBuffer(gl,vertices,3,gl.FLOAT);
    cube.colorBuffer = initArrayBuffer(gl, colors, 4, gl.FLOAT);
    cube.normalBuffer=initArrayBuffer(gl,normals,3,gl.FLOAT);
    cube.faceBuffer=initArrayBuffer(gl,faces,1,gl.UNSIGNED_BYTE);
    cube.numberBuffer=initArrayBuffer(gl,numbers,1,gl.UNSIGNED_BYTE);
    cube.indexBuffer=initElementArrayBuffer(gl,indices,gl.UNSIGNED_BYTE);
    cube.indexNum=indices.length;
     // Unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    
    return cube;
}
