var getWebGLContext=require('./context');
var {Matrix4,Vector3}=require('lib/cuon-matrix');
var initShaders=require('./shader');
var vshader = 
  'attribute vec4 a_position; \n'+
  'attribute vec4 a_color;\n' +
  'attribute float a_face;\n'+
  'uniform mat4 u_mvpMatrix;\n'+
  'uniform mat4 u_modelMatrix;\n'+
  'uniform mat4 u_normalMatrix;\n'+//变换矩阵
  'attribute vec4 a_normal;\n'+//法向量
  'varying vec3 v_normal;\n'+
  'varying vec3 v_position;\n'+
  'varying vec4 v_color;\n' +
  // 'uniform bool u_clicked;\n' + // Mouse is pressed
  'uniform int u_pickedFace;\n' + // Surface number of selected face
  'void main() {\n' +
  'gl_Position =u_mvpMatrix * u_modelMatrix  * a_position;\n'+
  'v_normal = normalize(vec3(u_normalMatrix*a_normal));\n'+//变换后的法向量
  'int face = int(a_face);\n' + // Convert to int
  'vec3 color = (face == u_pickedFace) ? vec3(1.0) : a_color.rgb;\n' +
  'v_position =vec3(u_modelMatrix * a_position);\n'+
    '  if (u_pickedFace==-1) {\n' + //  
  '    v_color = vec4(color, a_face/255.0);\n' +//readpixels中会将各个分量乘以255,得到原face数值
  '  } else {\n' +
  '    v_color = vec4(color, a_color.a);\n' +
  '  }\n' +
  // '  v_color = a_color;\n' +
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
  // 'vec4 t_color=texture2D(u_Sampler, v_TexCoord);\n'+
  // 'vec3 normal=normalize(v_normal);\n'+//法向量
  // 'vec3 pDirection=normalize(u_lightPosition - v_position);\n'+
  // 'float dotL = max (dot(normal,u_lightDirection),0.0);\n'+//光线方向和法向量点击
  // 'float dotP= max(dot(normal,pDirection),0.0);\n'+
  // 'vec3 diffuseL = u_lightColor * vec3(t_color) * dotL;\n'+
  // 'vec3 diffusep = u_pColor * vec3(t_color) * dotP;\n'+
  // 'vec3 ambientColor=u_ambientColor*vec3(t_color);\n'+
  // 'gl_FragColor = vec4(diffuseL+diffusep+ambientColor,t_color.a);\n' + // Set the point color
  'gl_FragColor = v_color;\n' + // Set the point color
  '}\n';
var canvas={
  width:400,
  height:400
}
var last = Date.now(); // Last time that this function was called
var ANGLE_STEP = 20.0; 

var gl=getWebGLContext('canvas');
var canvas=document.getElementById('canvas');
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
  mvpMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
  mvpMatrix.lookAt(3.0, 3.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
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
  if(!modelMatrix){
    modelMatrix=new Matrix4();
  }
  var u_modelMatrix=gl.getUniformLocation(gl.program,'u_modelMatrix');
  gl.uniformMatrix4fv(u_modelMatrix,false,modelMatrix.elements);

  //法向量的变换矩阵
  var normalMatrix=new Matrix4();
  var u_normalMatrix=gl.getUniformLocation(gl.program,'u_normalMatrix');
  normalMatrix.setInverseOf(modelMatrix);//将自己作为modelMatrix的逆矩阵
  normalMatrix.transpose();//转置   
  gl.uniformMatrix4fv(u_normalMatrix,false,normalMatrix.elements);
}

function draw(gl,n,currentAngle){
	var modelMatrix=new Matrix4();
	modelMatrix.setRotate(currentAngle,1.0,0.0,0.0);
	modelMatrix.rotate(currentAngle,0.0,1.0,0.0);
	modelMatrix.rotate(currentAngle,0.0,0.0,1.0);
	// console.log(currentAngle)
	setTransform(gl,modelMatrix);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

}



function main(){
  init(gl);
  initShaders(gl,vshader,fshader);
  setView(gl);
  setParallelLight(gl);
  setPointLight(gl);
  setAmbientLight(gl);
  setTransform(gl);
  var n=initVertexBuffer(gl);
  var u_clicked=gl.getUniformLocation(gl.program,'u_clicked');
  var u_pickedFace=gl.getUniformLocation(gl.program,'u_pickedFace');
  var currentAngle = 0.0; // Current rotation angle ([x-axis, y-axis] degrees)
   canvas.onmousedown = function(ev) {   // Mouse is pressed
      var x = ev.clientX, y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      // If Clicked position is inside the <canvas>, update the selected surface
      var x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
      var face = checkFace(gl, n, x_in_canvas, y_in_canvas, currentAngle, u_pickedFace);
      gl.uniform1i(u_pickedFace, face); // Pass the surface number to u_PickedFace
      draw(gl, n, currentAngle);
    }
  }
  // var tick = function() {   // Start drawing
  //   currentAngle = animate(currentAngle);
  //   draw(gl, n,currentAngle);
  //   requestAnimationFrame(tick, canvas);
  // };
  // tick();

 draw(gl, n,currentAngle);
}
main();
function checkFace(gl, n, x, y, currentAngle, u_pickedFace) {
  var pixels = new Uint8Array(4); // Array for storing the pixel value
  gl.uniform1i(u_pickedFace, -1);  // Draw by writing surface number into alpha value
  draw(gl, n, currentAngle);
  // Read the pixel value of the clicked position. pixels[3] is the surface number
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
console.log(pixels)
  return pixels[3];
}
function check(gl, n, x, y, u_clicked,currentAngle) {
  var picked = false;
  //把颜色置换为红色，用于识别点击区域
  gl.uniform1i(u_clicked, 1);  // Pass true to u_Clicked
  draw(gl, n,currentAngle); // Draw cube with red
  // Read pixel at the clicked position
  var pixels = new Uint8Array(4); // Array for storing the pixel value
  // console.log(x,y);
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
console.log(pixels)
  if (pixels[0] == 255) // The mouse in on cube if R(pixels[0]) is 255
    picked = true;
//把颜色置换为原来的颜色
  gl.uniform1i(u_clicked, 0);  // Pass false to u_Clicked(rewrite the cube)
  // draw(gl, n,currentAngle); // Draw the cube
  
  return picked;
}
function animate(angle) {
  var now = Date.now();   // Calculate the elapsed time

  var elapsed = now - last;
  last = now;
  // Update the current rotation angle (adjusted by the elapsed time)
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  
  return newAngle % 360;
}
function initVertexBuffer(gl){
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

    var colors = new Float32Array([   // Colors
	    0.2, 0.58, 0.82,   0.2, 0.58, 0.82,   0.2,  0.58, 0.82,  0.2,  0.58, 0.82, // v0-v1-v2-v3 front
	    0.5,  0.41, 0.69,  0.5, 0.41, 0.69,   0.5, 0.41, 0.69,   0.5, 0.41, 0.69,  // v0-v3-v4-v5 right
	    0.0,  0.32, 0.61,  0.0, 0.32, 0.61,   0.0, 0.32, 0.61,   0.0, 0.32, 0.61,  // v0-v5-v6-v1 up
	    0.78, 0.69, 0.84,  0.78, 0.69, 0.84,  0.78, 0.69, 0.84,  0.78, 0.69, 0.84, // v1-v6-v7-v2 left
	    0.32, 0.18, 0.56,  0.32, 0.18, 0.56,  0.32, 0.18, 0.56,  0.32, 0.18, 0.56, // v7-v4-v3-v2 down
	    0.73, 0.82, 0.93,  0.73, 0.82, 0.93,  0.73, 0.82, 0.93,  0.73, 0.82, 0.93, // v4-v7-v6-v5 back
    ]);
    var normals = new Float32Array([    // Normal
	     0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
	     1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
	     0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
	    -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
	     0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
	     0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
    ]);
	var faces = new Uint8Array([
		1, 1, 1, 1,     // v0-v1-v2-v3 front
	    2, 2, 2, 2,     // v0-v3-v4-v5 right
	    3, 3, 3, 3,     // v0-v5-v6-v1 up
	    4, 4, 4, 4,     // v1-v6-v7-v2 left
	    5, 5, 5, 5,     // v7-v4-v3-v2 down
	    6, 6, 6, 6,     // v4-v7-v6-v5 back
  	]);
    var indices = new Uint8Array([       // Indices of the vertices
       0, 1, 2,   0, 2, 3,    // front
       4, 5, 6,   4, 6, 7,    // right
       8, 9,10,   8,10,11,    // up
      12,13,14,  12,14,15,    // left
      16,17,18,  16,18,19,    // down
      20,21,22,  20,22,23     // back
    ]);

    initArrayBuffer(gl,'a_position',vertices,3,gl.FLOAT);
    initArrayBuffer(gl,'a_color',colors,3,gl.FLOAT);
    initArrayBuffer(gl,'a_normal',normals,3,gl.FLOAT);
    initArrayBuffer(gl,'a_face',faces,1,gl.UNSIGNED_BYTE);
    // initArrayBuffer(gl,'a_TexCoord',texCoords,2);
    var indexBuffer=gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indices,gl.STATIC_DRAW);
  return indices.length;
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

function initTextures(gl,n) {
  return new Promise(function(resolve,reject){
    // Create a texture object
    var texture = gl.createTexture();
    if (!texture) {
      console.log('Failed to create the texture object');
      return false;
    }

    // Get the storage location of u_Sampler
    var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
    if (!u_Sampler) {
      console.log('Failed to get the storage location of u_Sampler');
      return false;
    }

    // Create the image object
    var image = new Image();
    if (!image) {
      console.log('Failed to create the image object');
      return false;
    }
    // Register the event handler to be called when image loading is completed
    image.onload = function(){ 
      loadTexture(gl, texture, u_Sampler, image,n); 
      resolve();
    };
    // Tell the browser to load an Image
    image.src = './src/resource/sky.jpg';
  })

  
}

function loadTexture(gl, texture, u_Sampler, image,n) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image Y coordinate
  // Activate texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the image to texture
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Pass the texure unit 0 to u_Sampler
  gl.uniform1i(u_Sampler, 0);
  
}

