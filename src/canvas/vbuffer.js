module.exports=function initVertexBuffer(gl,a_position,a_textCoord){
	//创建缓冲区对象
	var n=4;
	var vBuffer= gl.createBuffer();//创建顶点缓冲区
	if(!vBuffer){
		console.log('fail create vertex buffer object');
		return -1;
	}
	//绑定缓冲区对象,gl.ARRAY_BUFFER：缓冲区对象绑定的目标，[gl.ARRAY_BUFFER 顶点数据,gl.ELEMENT_ARRAY_BUFFER 顶点索引值]
	gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer);
	//顶点
	// var vertics = new Float32Array([-0.5,-0.5,  -0.5,0.5,0.5,-0.5]);
	//顶点，大小和色值
	// var vertics = new Float32Array([
	// 	-0.7,-0.7,10.0,1.0,0.0,0.0,
	// 	-0.7,0.7,20.0,1.0,1.0,0.0,
	// 	0.7,0.7,30.0,0.0,0.0,1.0]);
	//顶点和纹理坐标
	var vertics = new Float32Array([
		-0.5,-0.5,0.0,0.0,
		0.5,-0.5,1.0,0.0,
		-0.5,0.5,0.0,1.0,
		0.5,0.5,1.0,1.0
	])
	// var vertics = new Float32Array([
	// 	-0.5,-0.5,-1.0,0.0,
	// 	0.5,-0.5,1.0,0.0,
	// 	-0.5,0.5,-1.0,1.0,
	// 	0.5,0.5,1.0,1.0
	// ])
	var fsize=vertics.BYTES_PER_ELEMENT;
	//写入数据
	//gl.STATIC_DRAW:如何使用缓冲区中的数据，优化执行效率。[gl.STATIC_DRAW(写入一次但绘制多次)|gl.STREAM_DRAW（写入一次，绘制若干次）|gl.DINAMIC_DRAW写入多次绘制多次]
	gl.bufferData(gl.ARRAY_BUFFER,vertics,gl.STATIC_DRAW);
	// var a_position=gl.getAttribLocation(gl.program,'a_position');
	//将缓冲区对象分配给a_position
	gl.vertexAttribPointer(a_position,2,gl.FLOAT,false,fsize*4,0);
	gl.enableVertexAttribArray(a_position);
	//gl.disableVertexAttribArray(a_position);//关闭分配

	// gl.vertexAttribPointer(a_size,1,gl.FLOAT,false,fsize*6,fsize*2);
	// gl.enableVertexAttribArray(a_size);

	// gl.vertexAttribPointer(a_color,3,gl.FLOAT,false,fsize*6,fsize*3);
	// gl.enableVertexAttribArray(a_color);

	gl.vertexAttribPointer(a_textCoord,2,gl.FLOAT,false,fsize*4,fsize*2);
	gl.enableVertexAttribArray(a_textCoord);

	return n

}
// function initVertexBuffers(gl) {
//   var vertices = new Float32Array([
//     0.0, 0.5,   -0.5, -0.5,   0.5, -0.5
//   ]);
//   var n = 3; // The number of vertices

//   // Create a buffer object
//   var vertexBuffer = gl.createBuffer();
//   if (!vertexBuffer) {
//     console.log('Failed to create the buffer object');
//     return -1;
//   }

//   // Bind the buffer object to target
//   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
//   // Write date into the buffer object
//   gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

//   var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
//   if (a_Position < 0) {
//     console.log('Failed to get the storage location of a_Position');
//     return -1;
//   }
//   // Assign the buffer object to a_Position variable
//   gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

//   // Enable the assignment to a_Position variable
//   gl.enableVertexAttribArray(a_Position);

//   return n;
// }

