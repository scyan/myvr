//获取webglcontext
module.exports=function getWebGLContext(canvas)
{
  var webGLContext;
  var canvas = document.getElementById(canvas);

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
