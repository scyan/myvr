var {initArrayBuffer,initElementArrayBuffer,initFramebuffer,initAttributeVariable}=require('util/buffer');
var gl;
var {Matrix4,Vector3,Vector4}=require('lib/cuon-matrix');
module.exports=class Cube{
	constructor(g,raw){
		gl=g;
		Object.assign(this,raw);
		this.initVertexBuffer();
	}
	draw(){
		
		var m=this.getTrueMatrix();
		this.setTransform(m);
		var program=gl.program;
		// 顶点buffer
		initAttributeVariable(gl, program.a_position, this.vertexBuffer); // Vertex coordinates
		//法向量buffer
		initAttributeVariable(gl, program.a_normal, this.normalBuffer);   // Normal
		initAttributeVariable(gl, program.a_color, this.colorBuffer);   // color
		initAttributeVariable(gl,program.a_face,this.faceBuffer);
		initAttributeVariable(gl,program.a_number,this.numberBuffer);
		//索引buffer
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);  // Bind indices
		gl.drawElements(gl.TRIANGLES, this.indexNum, this.indexBuffer.type, 0);   // Draw
	}
	getTrueMatrix(){

	  var modelMatrix=new Matrix4(this.modelMatrix);
	  var extraMatrix=new Matrix4(this.extraMatrix);
	  modelMatrix=extraMatrix.multiply(modelMatrix);
	  this.trueMatrix=modelMatrix;
	  return modelMatrix;
	}
	setTransform(modelMatrix){
	  // var gl=this.gl;
	  var u_modelMatrix=gl.getUniformLocation(gl.program,'u_modelMatrix');
	  gl.uniformMatrix4fv(u_modelMatrix,false,modelMatrix.elements);

	  //法向量的变换矩阵
	  var normalMatrix=new Matrix4();
	  var u_normalMatrix=gl.getUniformLocation(gl.program,'u_normalMatrix');
	  normalMatrix.setInverseOf(modelMatrix);//将自己作为modelMatrix的逆矩阵
	  normalMatrix.transpose();//转置   
	  gl.uniformMatrix4fv(u_normalMatrix,false,normalMatrix.elements);
	}
	initVertexBuffer(){
	      // Create a cube
	  //    v6----- v5
	  //   /|      /|
	  //  v1------v0|
	  //  | |     | |
	  //  | |v7---|-|v4
	  //  |/      |/
	  //  v2------v3


	  // var v1=[0,0,1,1],v2=[1,0,0,1],v3=[0,1,0,1],v4=[-1,0,0,1],v5=[0,-1,0,1],v6=[0,0,-1,1];
	    var vertices = new Float32Array([   // Vertex coordinates
	      1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
	      1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
	      1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
	     -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
	     -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
	      1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0,     // v4-v7-v6-v5 back

	      0.8, 0.8, 1.1,  -0.8, 0.8, 1.1,  -0.8,-0.8, 1.1,   0.8,-0.8, 1.1,    // v24-v25-v26-v27 front
	      1.1, 0.8, 0.8,   1.1,-0.8, 0.8,   1.1,-0.8,-0.8,   1.1, 0.8,-0.8,    // v28-v29-v30-v31 right
	      0.8, 1.1, 0.8,   0.8, 1.1,-0.8,  -0.8, 1.1,-0.8,  -0.8, 1.1, 0.8,    // v0-v5-v6-v1 up
	     -1.1, 0.8, 0.8,  -1.1, 0.8,-0.8,  -1.1,-0.8,-0.8,  -1.1,-0.8, 0.8,    // v1-v6-v7-v2 left
	     -0.8,-1.1,-0.8,   0.8,-1.1,-0.8,   0.8,-1.1, 0.8,  -0.8,-1.1, 0.8,    // v7-v4-v3-v2 down
	      0.8,-0.8,-1.1,  -0.8,-0.8,-1.1,  -0.8, 0.8,-1.1,   0.8, 0.8,-1.1     // v4-v7-v6-v5 back
	    ]);
	    var normals = new Float32Array([    // Normal
	      0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
	      1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
	      0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
	     -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
	      0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
	      0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   // v4-v7-v6-v5 back

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

	      1, 1, 1, 1,     // v0-v1-v2-v3 front
	      2, 2, 2, 2,     // v0-v3-v4-v5 right
	      3, 3, 3, 3,     // v0-v5-v6-v1 up
	      4, 4, 4, 4,     // v1-v6-v7-v2 left
	      5, 5, 5, 5,     // v7-v4-v3-v2 down
	      6, 6, 6, 6,     // v4-v7-v6-v5 back
	    ]);
	    var colors = this.color;
	    var numbers=[]
	    for(var i=0;i<48;i++){
	      numbers.push(this.number);
	    }
	    numbers=new Uint8Array(numbers);
	    var indices = new Uint8Array([       // Indices of the vertices
	       0, 1, 2,   0, 2, 3,    // front
	       4, 5, 6,   4, 6, 7,    // right
	       8, 9,10,   8,10,11,    // up
	      12,13,14,  12,14,15,    // left
	      16,17,18,  16,18,19,    // down
	      20,21,22,  20,22,23,     // back

	       0+24, 1+24, 2+24,   0+24, 2+24, 3+24,    // front
	       4+24, 5+24, 6+24,   4+24, 6+24, 7+24,    // right
	       8+24, 9+24,10+24,   8+24,10+24,11+24,    // up
	      12+24,13+24,14+24,  12+24,14+24,15+24,    // left
	      16+24,17+24,18+24,  16+24,18+24,19+24,    // down
	      20+24,21+24,22+24,  20+24,22+24,23+24     // back
	    ]);
	    this.vertexBuffer=initArrayBuffer(gl,vertices,3,gl.FLOAT);
	    this.colorBuffer = initArrayBuffer(gl, colors, 4, gl.FLOAT);
	    this.normalBuffer=initArrayBuffer(gl,normals,3,gl.FLOAT);
	    this.faceBuffer=initArrayBuffer(gl,faces,1,gl.UNSIGNED_BYTE);
	    this.numberBuffer=initArrayBuffer(gl,numbers,1,gl.UNSIGNED_BYTE);
	    this.indexBuffer=initElementArrayBuffer(gl,indices,gl.UNSIGNED_BYTE);
	    this.indexNum=indices.length;
	     // Unbind the buffer object
	    gl.bindBuffer(gl.ARRAY_BUFFER, null);
	    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}
}