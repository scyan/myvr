
var getWebGLContext=require('./context');
var initShaders=require('./shader');
var initVertexBuffer=require('./vbuffer');
var Matrix4=require('lib/cuon-matrix');
var initTexture=require('./texture');
//---------------用一个颜色清空canvas------------
function clear(gl){

	// var gl=getWebGLContext();

	gl.clearColor(0,0,0,1);
	//清空颜色缓冲区
	gl.clear(gl.COLOR_BUFFER_BIT);//清空颜色缓冲区（此外还有深度缓冲区(DEPTH_BUFFER_BIT)，模板缓冲区(STENCIL_BUFFER_BIT)）
	//gl.clearDepth()  g.clearStencil()
}

//attribute:存储限定付，该变量用于给定点着色器传值，且必须是全局变量
//gl_PointSize只在绘制单个点时有用
var vshader = 
  'attribute vec4 a_position; \n'+
  // 'attribute float a_positionSize; \n'+
  // 'uniform vec4 u_translation;\n'+
  // 'uniform float u_cosB,u_sinB;\n'+
  // 'uniform mat4 u_rotateMatrix;\n'+

  // 'attribute vec4 a_color;\n'+
  // 'varying vec4 v_color;\n'+

  'attribute vec2 a_textCoord;\n'+
  'varying vec2 v_textCoord;\n'+
  'void main() {\n' +
  'gl_Position = a_position;\n'+
  // 'gl_Position.x = a_position.x * u_cosB - a_position.y * u_sinB;\n'+
  // 'gl_Position.y = a_position.x * u_sinB + a_position.y*u_cosB; \n'+
  // 'gl_Position.z=0.0;\n'+
  // 'gl_Position.w=1.0;\n'+
  // '  gl_Position = a_position+u_translation;\n' + // Set the vertex coordinates of the point
  // ' gl_PointSize = a_positionSize;\n' +                    // Set the point size
  // ' v_color=a_color;\n'+
  ' v_textCoord=a_textCoord;\n'+
  '}\n';

// Fragment shader program
var fshader =
'#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
// 'precision mediump float; \n'+

  // 'uniform vec4 u_fColor; \n'+

  // 'uniform float u_width; \n'+
  // 'uniform float u_height; \n'+
  // 'varying vec4 v_color; \n'+

  'uniform sampler2D u_sampler0;\n'+
  'uniform sampler2D u_sampler1;\n'+
  'varying vec2 v_textCoord;\n'+
  'void main() {\n' +
  // '  gl_FragColor = u_fColor;\n' + // Set the point color
  // '  gl_FragColor = v_color;\n' + // Set the point color
  //gl_FragCoord:片元在canvas坐标中的坐标
  // '  gl_FragColor = vec4(gl_FragCoord.x/u_width,0.0,gl_FragCoord.y/u_height,1.0);\n' + // Set the point color
  'vec4 color0=texture2D(u_sampler0,v_textCoord);\n'+
  'vec4 color1=texture2D(u_sampler1,v_textCoord);\n'+
  	'gl_FragColor=color0*color1;\n'+
  '}\n';

var points=[];
function click(ev,gl,a_position,u_fColor){
	clear(gl);
	var cx=ev.clientX,cy=ev.clientY;
	var rect=ev.target.getBoundingClientRect();
	var x=(cx-rect.left-rect.width/2)/(rect.width/2);
	var y=-(cy-rect.top-rect.height/2)/(rect.height/2);
	points.push([x,y]);
	var rgba=[];
	var len=points.length;
	for(var i=0;i<len;i++){
		x=points[i][0];
		y=points[i][1];
		if(x>=0&&y>=0){
			rgba=[1.0,0.0,0.0,1.0];
		}else if(x<0&&y<0){
			rgba=[1.0,1.0,0.0,1.0];
		}else{
			rgba=[0.0,0.0,1.0,1.0];
		}
		//向该地址传值
		gl.vertexAttrib3f(a_position,points[i][0],points[i][1],0.0);
		//vertexAttrib1f:传第1个值，2，3被设定为0.0,4被设定为1.0；vertexAttrib2f；vertexAttrib4f
		//vertexAttrib1f:1代表参数个数，f代表浮点数,i代表整数，
		//vertexAttrib3fv：fv代表可以传递数组gl.vertexAttrib3fv(a_position,new Float32Array([0.0,0.0,0.0]));
		gl.uniform4f(u_fColor,rgba[0],rgba[1],rgba[2],rgba[3]);
		gl.drawArrays(gl.POINTS,0,1);
	}

}
var g_last=Date.now();
function newAngle(angle,ANGLE_STEP){
	var now = Date.now();
	var elapsed = now - g_last;
	g_last = now;
	var newAn=( angle + (ANGLE_STEP * elapsed) / 1000.0);
	return newAn %= 360;
}
function draw(gl,xMatrix,u_rotateMatrix,angle,n){
	xMatrix.setRotate(angle,0,0,1);
	xMatrix.translate(1,0,0);
	gl.uniformMatrix4fv(u_rotateMatrix,false,xMatrix.elements);
	clear(gl);
	gl.drawArrays(gl.TRIANGLES,0,n);
}
function main(){
	var gl=getWebGLContext('canvas');
	var canvas=document.getElementById('canvas');
	clear(gl);
	initShaders(gl,vshader,fshader);
	//获取位置变量在webgl程序中的存储地址，该地址再initShader时生成
	var a_position=gl.getAttribLocation(gl.program,'a_position');
	// var a_size=gl.getAttribLocation(gl.program,'a_positionSize');
	// var a_color=gl.getAttribLocation(gl.program,'a_color');
	var a_textCoord=gl.getAttribLocation(gl.program,'a_textCoord')
	var n=initVertexBuffer(gl,a_position,a_textCoord);
	initTexture(gl,n);
	//获取大小变量的存储地址
	// var a_positionSize=gl.getAttribLocation(gl.program,'a_positionSize');
	// gl.vertexAttrib1f(a_positionSize,20.0);
	//获取颜色变量的存储地址
	// var u_fColor=gl.getUniformLocation(gl.program,'u_fColor');
	// gl.uniform4f(u_fColor,0.0,0.0,0.0,1.0);
	// gl.drawArrays(gl.TRIANGLES,0,n);

	// var u_width=gl.getUniformLocation(gl.program,'u_width');
	// gl.uniform1f(u_width,400.0);

	// var u_height=gl.getUniformLocation(gl.program,'u_height');
	// gl.uniform1f(u_height,400.0);
	// gl.drawArrays(gl.TRIANGLES,0,n);



	var angle=15;
	var ANGLE_STEP=45;
	var xMatrix=new Matrix4();
	var u_rotateMatrix=gl.getUniformLocation(gl.program,'u_rotateMatrix');
	
	var tick=function(){
		angle=newAngle(angle,ANGLE_STEP);
		draw(gl,xMatrix,u_rotateMatrix,angle,n);
		requestAnimationFrame(tick);
	}

}

main();
