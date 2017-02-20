module.exports=function initTextures(gl,n){
  var texture0=gl.createTexture();
  var texture1=gl.createTexture();
  var u_sampler0=gl.getUniformLocation(gl.program,'u_sampler0');
  var u_sampler1=gl.getUniformLocation(gl.program,'u_sampler1');
  var image0=new Image();
  var image1=new Image();
  // image.src='//img.alicdn.com/tps/TB1zNDSPXXXXXa0XFXXXXXXXXXX-256-256.jpg';
  image1.src='./src/resource/sky.jpg';
  image0.src='./src/resource/circle.gif';
  image0.onload=function(){
  	loadTexture(gl,n,texture0,u_sampler0,image0,0);
  }
  image1.onload=function(){
  	loadTexture(gl,n,texture1,u_sampler1,image1,1);
  }
}
var texture0=false,texture1=false;
function loadTexture(gl,n,texture,u_sampler,image,textureUnit){
  //对纹理图像进行y轴反转
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // 开启0号纹理单元
  // gl.activeTexture(gl.TEXTURE0);
  // gl.activeTexture(gl['TEXTURE'+textureUnit]);
  if(textureUnit==0){
  	gl.activeTexture(gl.TEXTURE0);
  	texture0=true;
  }else{
  	gl.activeTexture(gl.TEXTURE1);
  	texture1=true;
  }
  // Bind the texture object to the target绑定纹理对象
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters配置纹理参数
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // Set the texture image配置纹理图案 gl.RGB跟图像格式有关，png用gl.RGBA  
  //gl.UNSIGNED_BYTE:每个颜色值占一个字节  gl.UNSIGNED_SHORT_5_6_5 RGB分别占5，6，5个字节压缩进16个字节；gl.UNSIGNED_SHORT_4_4_4_4 gl.UNSIGNED_SHORT_5_5_5_1
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler将0号纹理传递给着色器
  gl.uniform1i(u_sampler, textureUnit);
  
  gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>
  if(texture0&&texture1){
	  gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
  }
}