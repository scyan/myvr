	    // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
var {Matrix4,Vector3,Vector4}=require('lib/cuon-matrix');
// module.exports={
var cubes={
	cube0:{
	}
	,
    cubeR:{
	},
    cubeY:{
	},
    cubeG:{

	},
    cubeW:{

    },
    cubeB:{

    },
    cubeO:{

    },
    cubeRY:{

    },
    cubeRG:{

    },
    cubeRW:{

    },
    cubeRB:{

    },
    cubeRYG:{

    },
    cubeRYB:{

    },
    cubeRWG:{

    },
    cubeRWB:{

    },
    cubeYG:{

    },
    cubeYB:{},
    cubeWG:{},
    cubeWB:{},
    cubeOG:{},
    cubeOB:{},
    cubeOW:{},
    cubeOY:{},
    cubeOGW:{},
    cubeOGY:{},
    cubeOBW:{},
    cubeOBY:{},
}
Object.keys(cubes).map(function(cubeName,i){
	var color=[
    0.4, 0.4, 0.4,1.0,  0.4, 0.4, 0.4,1.0,  0.4, 0.4, 0.4,1.0,  0.4, 0.4, 0.4,1.0,  // v0-v1-v2-v3 front(blue)
    0.4, 0.4, 0.4,1.0,  0.4, 0.4, 0.4,1.0,  0.4, 0.4, 0.4,1.0,  0.4, 0.4, 0.4,1.0,  // v0-v3-v4-v5 right(green)
    0.4, 0.4, 0.4,1.0,  0.4, 0.4, 0.4,1.0,  0.4, 0.4, 0.4,1.0,  0.4, 0.4, 0.4,1.0,  // v0-v5-v6-v1 up(red)
    0.4, 0.4, 0.4,1.0,  0.4, 0.4, 0.4,1.0,  0.4, 0.4, 0.4,1.0,  0.4, 0.4, 0.4,1.0,  // v1-v6-v7-v2 left
    0.4, 0.4, 0.4,1.0,  0.4, 0.4, 0.4,1.0,  0.4, 0.4, 0.4,1.0,  0.4, 0.4, 0.4,1.0,  // v7-v4-v3-v2 down
    0.4, 0.4, 0.4,1.0,  0.4, 0.4, 0.4,1.0,  0.4, 0.4, 0.4,1.0,  0.4, 0.4, 0.4,1.0,  // v4-v7-v6-v5 back
	];
	var m=new Matrix4();
	m.setTranslate(0,0,0);
	var extraMatrix=new Matrix4();
	extraMatrix.setTranslate(0,0,0);

	for(var j=0;j<24;j++){
		
		if(cubeName.match(/R/)&&j>=8&&j<=11){
			color=color.concat([1,0,0,0.9])
		}
		else if(cubeName.match(/Y/)&&j>=0&&j<=3){
			color=color.concat([1, 1, 0,0.9])
		}
		else if(cubeName.match(/G/)&&j>=4&&j<=7){
			color=color.concat([0, 1, 0,0.9])
		}
		else if(cubeName.match(/B/)&&j>=12&&j<=15){
			color=color.concat([0, 0, 1,0.9])
		}
		else if(cubeName.match(/W/)&&j>=20&&j<=23){
			color=color.concat([1, 1, 1,0.9])
		}
		else if(cubeName.match(/O/)&&j>=16&&j<=19){
			color=color.concat([1, .5, 0,0.9])
		}else{
			color=color.concat([1,1,1,0.9]);
		}
	}
// this.faceCenter=[
// 	  	[0,0,1,1],//f1
// 	  	[1,0,0,1],//f2
// 	  	[0,1,0,1],//f3
// 	  	[-1,0,0,1],//f4
// 	  	[0,-1,0,1],//f5
// 	  	[0,0,-1,1]//f6
// 	  ]
	cubes[cubeName].faceCenter=[];
	if(cubeName.match(/R/)){
		m.translate(0,2.0,0);
		cubes[cubeName].faceCenter.face3=[0,1,0,1];//f3
	}
	if(cubeName.match(/Y/)){
		m.translate(0,0,2.0);
		cubes[cubeName].faceCenter.face1=[0,0,1,1];//f1
	}
	if(cubeName.match(/G/)){
		m.translate(2.0,0.0,0.0);
		cubes[cubeName].faceCenter.face2=[1,0,0,1];//f2
	}
	if(cubeName.match(/B/)){
		m.translate(-2.0,0.0,0.0);
		cubes[cubeName].faceCenter.face4=[-1,0,0,1];//f4
	}
	if(cubeName.match(/O/)){
		m.translate(0.0,-2.0,0.0);
		cubes[cubeName].faceCenter.face5=[0,-1,0,1];//f5
	}
	if(cubeName.match(/W/)){
		m.translate(0.0,0.0,-2.0);
		cubes[cubeName].faceCenter.face5=[0,0,-1,1];//f6
	}
	cubes[cubeName].name=cubeName;
	cubes[cubeName].number=i+1
	cubes[cubeName].modelMatrix=m;
	cubes[cubeName].color=new  Float32Array(color);
	cubes[cubeName].extraMatrix=extraMatrix;
});
function init(cubeName,i){

}
module.exports=cubes;