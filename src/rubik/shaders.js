exports.vshader = 
  'attribute vec4 a_position; \n'+
  'attribute float a_face;\n' +   // Surface number (Cannot use int for attribute variable)
  'varying float v_face;\n' +   // Surface number (Cannot use int for attribute variable)
  'attribute float a_number;\n' +   // Surface number (Cannot use int for attribute variable)
  'varying   float v_number;\n' +   // Surface number (Cannot use int for attribute variable)
  'uniform mat4 u_mvpMatrix;\n'+
  'uniform mat4 u_modelMatrix;\n'+
  'uniform mat4 u_normalMatrix;\n'+//变换矩阵
  
  
  'attribute vec4 a_color;\n'+
  'varying vec4 v_color;\n'+
  'attribute vec4 a_normal;\n'+//法向量
  'varying vec3 v_normal;\n'+
  'varying vec3 v_position;\n'+
  'void main() {\n' +
  // 'int face = int(a_face);\n' + // Convert to int
  'v_face = a_face;\n'+
  'v_number=a_number;\n'+
 
  'gl_Position =u_mvpMatrix * u_modelMatrix  * a_position;\n'+
  'v_normal = normalize(vec3(u_normalMatrix*a_normal));\n'+//变换后的法向量
  'v_position =vec3(u_modelMatrix * a_position);\n'+
  'v_color=a_color;\n'+
  '}\n';

 exports.fshader=
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform vec3 u_lightDirection;\n'+//平行光方向
  'uniform vec3 u_lightColor;\n'+//平行光颜色
  'uniform vec3 u_ambientColor;\n'+//环境光颜色
  'uniform vec3 u_lightPosition;\n'+//点光源位置
  'uniform vec3 u_pColor;\n'+//点光源颜色
  'uniform bool u_clicked;\n' + // Mouse is pressed
  'varying vec4 v_color; \n'+
  'varying vec3 v_normal;\n'+
  'varying vec3 v_position;\n'+
  'varying float v_face;\n' + 
  'varying float v_number;\n' +   // Surface number (Cannot use int for attribute variable)
  // 'varying bool v_clicked;\n'+
  'void main() {\n' +
  'int face = int(v_face);\n' + // Convert to int
  'int number = int(v_number);\n' + // Convert to int
  'vec3 normal=normalize(v_normal);\n'+//法向量
  'vec3 pDirection=normalize(u_lightPosition - v_position);\n'+
  'float dotL = max (dot(normal,u_lightDirection),0.0);\n'+//光线方向和法向量点击
  'float dotP= max(dot(normal,pDirection),0.0);\n'+
  'vec3 diffuseL = u_lightColor * vec3(v_color) * dotL;\n'+
  'vec3 diffusep = u_pColor * vec3(v_color) * dotP;\n'+
  'vec3 ambientColor=u_ambientColor*vec3(v_color);\n'+
  '  if (u_clicked) {\n' + //  Draw in red if mouse is pressed
  '    gl_FragColor = vec4(v_number/255.0, v_face/255.0, 1.0, 1.0);\n' +
  '  } else {\n' +
  '    gl_FragColor = vec4(diffuseL+diffusep+ambientColor,v_color.a);\n' + // Set the point color
  '  }\n' +
  // 'gl_FragColor = vec4(diffuseL+diffusep+ambientColor,v_color.a);\n' + // Set the point color
  '}\n';