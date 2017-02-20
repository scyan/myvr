
//获取webglcontext
function getWebGLContext()
{
  var webGLContext;
  var canvas = document.getElementById("canvas");

  /* Context name can differ according to the browser used */
  /* Store the context name in an array and check its validity */
  var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
  for (var i = 0; i < names.length; ++i) 
  {
     
    var  webGLContext = canvas.getContext(names[i]);
     
   if (webGLContext) break;
  }
		
  return webGLContext;
}


//---------------用一个颜色清空canvas------------
function clear(){

	var gl=getWebGLContext();

	gl.clearColor(0,1,0,1);
	//清空颜色缓冲区
	gl.clear(gl.COLOR_BUFFER_BIT);//清空颜色缓冲区（此外还有深度缓冲区(DEPTH_BUFFER_BIT)，模板缓冲区(STENCIL_BUFFER_BIT)）
	//gl.clearDepth()  g.clearStencil()
}
//---------------------------------------------
//--------------绘制一个点-----------------------
function initShaders(gl, vshader, fshader) {
  var program = createProgram(gl, vshader, fshader);
  if (!program) {
    console.log('Failed to create program');
    return false;
  }

  gl.useProgram(program);
  gl.program = program;

  return true;
}

/**
 * Create the linked program object
 * @param gl GL context
 * @param vshader a vertex shader program (string)
 * @param fshader a fragment shader program (string)
 * @return created program object, or null if the creation has failed
 */
function createProgram(gl, vshader, fshader) {
  // Create shader object
  var vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
  var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
  if (!vertexShader || !fragmentShader) {
    return null;
  }

  // Create a program object
  var program = gl.createProgram();
  if (!program) {
    return null;
  }

  // Attach the shader objects
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // Link the program object
  gl.linkProgram(program);

  // Check the result of linking
  var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    var error = gl.getProgramInfoLog(program);
    console.log('Failed to link program: ' + error);
    gl.deleteProgram(program);
    gl.deleteShader(fragmentShader);
    gl.deleteShader(vertexShader);
    return null;
  }
  return program;
}

/**
 * 创建着色器
 * @param gl GL context
 * @param type the type of the shader object to be created
 * @param source shader program (string)
 * @return created shader object, or null if the creation has failed.
 */
function loadShader(gl, type, source) {
	// gl, gl.VERTEX_SHADER, vshader
  // Create shader object
  var shader = gl.createShader(type);
  if (shader == null) {
    console.log('unable to create shader');
    return null;
  }
    // Set the shader program
  gl.shaderSource(shader, source);
  
  // Compile the shader
  gl.compileShader(shader);

  // Check the result of compilation
  var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    var error = gl.getShaderInfoLog(shader);
    console.log('Failed to compile shader: ' + error);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

//顶点着色器
var py=
 ' void main(void) {\n'+
      '      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n'
       '   }';
//片元着色器
// var py=
// 'void main() {\n'+
// 'gl_FlagColor=vec4(1.0,0,0,1.0);\n'+
// '}\n';
var dd=
'attribute vec3 aVertexPosition;\n'+

         ' uniform mat4 uMVMatrix;\n'+
         ' uniform mat4 uPMatrix;\n'+
          
         ' void main(void) {\n'+
          '  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\n'+
          '}';
function main(){
	var gl=getWebGLContext();
	initShaders(gl,dd,py);

	// gl.drawArrays(gl.POINTS,0,1);
}
main()
