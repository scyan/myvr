var {vshader,fshader} =require( './shaders')
var getWebGLContext=require('util/context');
var {Matrix4,Vector3,Vector4}=require('lib/cuon-matrix');
var {initShaders}=require('util/shader');
var {initArrayBuffer,initElementArrayBuffer,initFramebuffer,initAttributeVariable}=require('util/buffer');
var cubes=require('./cubes');
var Cube=require('./cube');
var canvas={

  width:400,
  height:400
}
var gl=getWebGLContext('canvas');
class Rubik{
	constructor(){
	 
		this.sight=[10,10,10,1];
		this.lookAt=[0,0,0,1];
		this.cubes=[];
		this.init();
		initShaders(gl,vshader,fshader);
		this.setView(this.sight,this.lookAt);
		this.setParallelLight();
		this.setPointLight();
		this.setAmbientLight();
		
		this.initParams(gl);
		gl.uniform1i(gl.program.u_clicked, 0); 
		this.initCubes();
		this.draw();
		this.mouseEvent();
		this.sightCtrl()
	}
	init(){
		// var gl=this.gl;
		gl.clearColor(0,0,0,1);
		gl.enable(gl.DEPTH_TEST);//深度遮挡开关
		gl.enable(gl.POLYGON_OFFSET_FILL);
		gl.polygonOffset(1.0,1.0);
		gl.enable (gl.BLEND);
		// Set blending function
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
	}
	initParams(){
		// var gl=this.gl;
		var program=gl.program;
		program.a_position=gl.getAttribLocation(gl.program,'a_position');
		program.a_color=gl.getAttribLocation(gl.program,'a_color');
		program.a_normal=gl.getAttribLocation(gl.program,'a_normal');
		program.a_face=gl.getAttribLocation(gl.program,'a_face');
		program.a_number=gl.getAttribLocation(gl.program,'a_number');
		program.u_clicked=gl.getUniformLocation(gl.program, 'u_clicked');
	}
	initCubes(){
		var _this=this;
		Object.keys(cubes).map(function(cubeName){
			_this.cubes.push(new Cube(gl,cubes[cubeName]))
		  // drawCube(gl,cube);
		})
	}
	setView(sight,lookAt){
		// var gl=this.gl;
		var mvpMatrix = new Matrix4();
		//垂直视角，近裁剪面的款高比，视点到近裁剪面的距离，视点到远裁剪面的距离
		mvpMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0);
		mvpMatrix.lookAt(sight[0], sight[1], sight[2], lookAt[0], lookAt[1], lookAt[2], 0.0, 1.0, 0.0);
		this.mvpMatrix=mvpMatrix;
		var u_mvpMatrix=gl.getUniformLocation(gl.program,'u_mvpMatrix');
		gl.uniformMatrix4fv(u_mvpMatrix,false,mvpMatrix.elements);
	}
	setParallelLight(){
	  // var gl=this.gl;
	  //平行光颜色
	  var u_lightColor=gl.getUniformLocation(gl.program,'u_lightColor');
	  gl.uniform3f(u_lightColor, 1, 1, 1);
	  //平行光方向
	  var u_lightDirection=gl.getUniformLocation(gl.program,'u_lightDirection');
	  var lightDirection = new Vector3([20.0, 10.0, 30.0]);
	  lightDirection.normalize();     // Normalize
	  gl.uniform3fv(u_lightDirection, lightDirection.elements);
	}
	setPointLight(){
	  // var gl=this.gl;
	  //点光源位置
	  var u_lightPosition=gl.getUniformLocation(gl.program,'u_lightPosition');
	  gl.uniform3f(u_lightPosition,0,3,10);
	  //点光源颜色
	  var u_pColor=gl.getUniformLocation(gl.program,'u_pColor');
	  gl.uniform3f(u_pColor,.1,.1,.1);
	}
	setAmbientLight(){
	  // var gl=this.gl;
	  var u_ambientColor=gl.getUniformLocation(gl.program,'u_ambientColor');
	  gl.uniform3f(u_ambientColor,1,1,1);
	}

	draw(){
	  // var gl=this.gl;
	  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
	  // console.log(this.cubes)
	  this.cubes.map(function(cube){
	  	cube.draw();
	  })
	}
	getCrdInCanvas(ev){

	    var x = ev.clientX, y = ev.clientY,sight=this.sight,lookAt=this.lookAt;
	    var rect = ev.target.getBoundingClientRect();
	    var x0=rect.right/2.0,y0=rect.bottom/2.0;
	    var mvpMatrix = new Matrix4(this.mvpMatrix);
		var point=new Float32Array([(x-x0)*2/rect.width,(y0-y)*2/rect.height,0,1]);
		var v=new Vector4(point);
		v=mvpMatrix.multiplyVector4(v);
		// console.log(v.elements);
		return {crd:v};
	    // return{x:(x-x0)*2/rect.width,y:(y0-y)*2/rect.height}
	}
	getPixels(x,y){
		gl.uniform1i(gl.program.u_clicked, 1);  // Pass true to u_Clicked
	    this.draw(); // Draw cube with red
	    // Read pixel at the clicked position
	    var pixels = new Uint8Array(4); // Array for storing the pixel value
	    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
	    console.log(pixels)
	    gl.uniform1i(gl.program.u_clicked, 0);  // Pass false to u_Clicked(rewrite the cube)
	    this.draw(); // Draw the cube
	    
	    return pixels;
	}
	isClickCube(ev){
	    var x = ev.clientX, y = ev.clientY;
	    var rect = ev.target.getBoundingClientRect();
	    var cube=null;
	    // if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
	      // If pressed position is inside <canvas>, check if it is above object
	    var x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
	    var pixels = this.getPixels(x_in_canvas, y_in_canvas);
	    if(pixels[2]==255){
	    	this.cubes.map(function(item){
	    		if(item.number==pixels[0]){
	    			cube=item;
	    			cube=Object.assign({},item,{clickedFace:pixels[1]})
	    			return false;
	    		}
	    	})
	    }
	   return cube;
	    // }
	}
	mouseEvent(){
	  var mousedown=false;
	  var cc=document.getElementById('canvas');
	  var last_time;
	  var _this=this;
	  var lookAtCfg={
	    anglex:0,
	    angley:0,
	    anglex_step:10,
	    angley_step:10,
	    x:0,
	    y:0,
	    m:new Matrix4()
	  }
	  var cubeCfg={
	    anglex:0,
	    angley:0,
	    anglex_step:10,
	    angley_step:10,
	    last_cube:null,
	    crd:new Vector4(),
	    m:new Matrix4()
	  }
	  var clickedCube=null;
	  cc.addEventListener('mousedown',function(e){
	    clickedCube=_this.isClickCube(e);
	    if(clickedCube){
	    	cubeCfg.last_cube=clickedCube;
	    	// Object.assign(cubeCfg,_this.getCrdInCanvas(e));
	    }
	    mousedown=true;
	    lookAtCfg.x=e.offsetX;
	    lookAtCfg.y=e.offsetY;
	    lookAtCfg.last_time=+new Date();
	    
	  })
	  cc.addEventListener('mousemove',function(e){
	    if(mousedown){
	         clickedCube=_this.isClickCube(e);
	      if(clickedCube){
	        mousedown=_this.ctrlRubik(gl,e,clickedCube,cubeCfg)
	      }else{

	        _this.ctrlLookAt(e,lookAtCfg)
	      }
      
	    }
	  })
	  cc.addEventListener('mouseup',function(e){
	    mousedown=false;
	    clickedCube=null;
	  })
	}
	ctrlRubik(gl,e,clickedCube,cfg){
		var last_cube=cfg.last_cube;
		// console.log(last_cube.name,last_cube.faceCenter)
		console.log(clickedCube.name,clickedCube.clickedFace)
		if(!last_cube.faceCenter['face'+last_cube.clickedFace]){
			cfg.last_cube=clickedCube;
			return true;
		}
		if(!clickedCube.faceCenter['face'+clickedCube.clickedFace]){
			return true;
		}
		// console.log(last_cube.clickedFace,clickedCube.clickedFace);
		// return true;
		if(last_cube.cubeName!=clickedCube.cubeName||last_cube.clickedFace!=clickedCube.clickedFace){
			var m=new Matrix4(last_cube.trueMatrix);
			var fc=last_cube.faceCenter['face'+last_cube.clickedFace];
			fc=new Vector4(new Float32Array(fc));
			var last_p=m.multiplyVector4(fc).elements;

			m=new Matrix4(clickedCube.trueMatrix);
			fc=clickedCube.faceCenter['face'+clickedCube.clickedFace];
			fc=new Vector4(new Float32Array(fc));
			var p=m.multiplyVector4(fc).elements;
			console.log(last_cube.clickedFace,clickedCube.clickedFace)
			console.log(last_p,p)
			return false;//停止捕捉
		}
		return true;
		// console.log(clickedCube)
		// var crd=this.getCrdInCanvas(e).crd.elements;
		// var last_crd=cfg.crd.elements;
		// console.log(crd[0]-last_crd[0],crd[1]-last_crd[1],crd[2]-last_crd[2])
		

	}
	ctrlLookAt(e,cfg){
	  var changed=false;
	  var now=+new Date();
	  if(now-cfg.last_time<20){
	    return;
	  }
	  cfg.last_time=now;
	  var v=new Vector4(this.lookAt);
	  cfg.m.setTranslate(0,0,0);
	  //沿着Z负轴移动10
	  cfg.m.setTranslate(0,0,10);
	  if(Math.abs(e.offsetX-cfg.x)>5){
	    if(e.offsetX>cfg.x){
	      // cfg.angley=(cfg.angley-cfg.angley_step)%360;
	      cfg.angley=-cfg.angley_step;
	    }else if(e.offsetX<cfg.x){
	    	cfg.angley=cfg.angley_step;
	      // cfg.angley=(cfg.angley+cfg.angley_step)%360;
	    }
	    changed=true;
	    cfg.x=e.offsetX;
	  cfg.m.rotate(cfg.angley,0,1,0);
	  }
	  if(Math.abs(e.offsetY-cfg.y)>5){
	    if(e.offsetY>cfg.y){
	    	cfg.anglex=-cfg.anglex_step;
	      // cfg.anglex=(cfg.anglex-cfg.anglex_step)%360;
	    }else if(e.offsetY<cfg.y){
	      cfg.anglex=cfg.anglex_step;
	      // cfg.anglex=(cfg.anglex+cfg.anglex_step)%360;
	    }
	    
	    changed=true;
	    cfg.y=e.offsetY;
	  cfg.m.rotate(cfg.anglex,1,0,0);
	  }
	  if(changed){
	    cfg.m.translate(0,0,-10);
	    v=cfg.m.multiplyVector4(v);
	    // this.setView(this.sight,v.elements);
	    this.lookAt=v.elements;
	    this.setView(this.sight,this.lookAt);
	    this.draw();
	  }
	}
	sightCtrl() {
		var gl=this.gl;
		var anglex=0,angley=0,anglez=0;
		var angle_step=10;
		// sight.push(1);
		var m=new Matrix4();
		var changed=false;
		var _this=this;
		document.addEventListener('keydown',function(e){

			switch (e.keyCode){
				case 40://down
					// anglex=(anglex+angle_step)%360;
					anglex=angle_step;
					changed=true;
				break;
				case 38://up
					// anglex=(anglex-angle_step)%360;
					anglex=-angle_step;
					changed=true;
				break;
				case 37://left
					// angley=(angley+angle_step)%360;
					angley=angle_step;
					changed=true;
				break;
				case 39://right
					// angley=(angley-angle_step)%360;
					angley=-angle_step;
					changed=true;
				break;
				default:
				anglex=0;
				angley=0;
				break;
			}
			if(changed){
				var v=new Vector4(_this.sight);
				m.setRotate(anglex,1,0,0);
				m.rotate(angley,0,1,0);
				v=m.multiplyVector4(v);
				_this.sight=v.elements;
				_this.setView(_this.sight,_this.lookAt);
				_this.draw();
				changed=false;
			}
		})
	
		//a:65 d:68 w:87 s:83
	}
}

new Rubik()