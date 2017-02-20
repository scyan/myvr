
module.exports=function initTextures(gl, program,src) {
  var promise=new Promise(function(resolve,reject){

    // Register the event handler to be called when image loading is completed
    var texture = gl.createTexture();   // Create a texture object
    if (!texture) {
      console.log('Failed to create the texture object');
      reject();
    }

    var image = new Image();  // Create a image object
    if (!image) {
      console.log('Failed to create the image object');
      reject();
    }
    image.onload = function() {
      // Write the image data to texture object
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image Y coordinate
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      // Pass the texure unit 0 to u_Sampler
      gl.useProgram(program);
      gl.uniform1i(program.u_Sampler, 0);

      gl.bindTexture(gl.TEXTURE_2D, null); // Unbind texture
      resolve(texture)
    };

    // Tell the browser to load an Image
    image.src = src||'./src/resource/orange.jpg';
  })

  return promise;
}