module.exports={
	initArrayBuffer:function(gl,data,num,type){
		  // Create a buffer object
	  var buffer = gl.createBuffer();
	  if (!buffer) {
	    console.log('Failed to create the buffer object');
	    return null;
	  }
	  // Write date into the buffer object
	  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

	  // Store the necessary information to assign the object to the attribute variable later
	  buffer.num = num;
	  buffer.type = type;

	  return buffer;
	},

	initElementArrayBuffer:function(gl,data,type){
	// Create a buffer object
	  var buffer = gl.createBuffer();
	  if (!buffer) {
	    console.log('Failed to create the buffer object');
	    return null;
	  }
	  // Write date into the buffer object
	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
	  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);

	  buffer.type = type;

	  return buffer;
	},
	initAttributeVariable:function(gl, a_attribute, buffer) {
	  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	  gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
	  gl.enableVertexAttribArray(a_attribute);
	},
//帧缓冲区
	initFramebuffer: function(gl,OFFSCREEN_WIDTH,OFFSCREEN_HEIGHT){
		var framebuffer, texture, depthBuffer;

		// Define the error handling function
		var error = function() {
		  if (framebuffer) gl.deleteFramebuffer(framebuffer);
		  if (texture) gl.deleteTexture(texture);
		  if (depthBuffer) gl.deleteRenderbuffer(depthBuffer);
		  return null;
		}
		// Create a frame buffer object (FBO)
		framebuffer = gl.createFramebuffer();
		if (!framebuffer) {
		  console.log('Failed to create frame buffer object');
		  return error();
		}

		// Create a texture object and set its size and parameters
		texture = gl.createTexture(); // Create a texture object
		if (!texture) {
		  console.log('Failed to create texture object');
		  return error();
		}
		gl.bindTexture(gl.TEXTURE_2D, texture); // Bind the object to target
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		framebuffer.texture = texture; // Store the texture object

		 // Create a renderbuffer object and Set its size and parameters
		depthBuffer = gl.createRenderbuffer(); // Create a renderbuffer object
		if (!depthBuffer) {
		  console.log('Failed to create renderbuffer object');
		  return error();
		}
		gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer); // Bind the object to target
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);

		// Attach the texture and the renderbuffer object to the FBO
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

		// Check if FBO is configured correctly
		var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
		if (gl.FRAMEBUFFER_COMPLETE !== e) {
		  console.log('Frame buffer object is incomplete: ' + e.toString());
		  return error();
		}

		// Unbind the buffer object
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);


		return framebuffer;
	}
}

