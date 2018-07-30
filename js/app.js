var $body=$(document.body);

var $canvas=$('#game');
var canvas=$canvas.get(0);
var context=canvas.getContext("2d");

canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

var canvasWidth=canvas.clientWidth;
var canvasHeight=canvas.clientHeight;

window.requestAnimFrame =
window.requestAnimationFrame ||
window.webkitRequestAnimationFrame ||
window.mozRequestAnimationFrame ||
window.oRequestAnimationFrame ||
window.msRequestAnimationFrame ||
function(callback) {
    window.setTimeout(callback, 1000 / 30);
};

// function changeBackground(which_pic){
// 	var source=which_pic.getElementsByTagName("option");
// 	var sources=source[2].getAttribute("value");
// 	var img;
// 	if(source===0){
// 		img="../img/bg_1.jpg";
// 	}else if(source===1){
// 		img="../img/bg_2.jpg";
// 	}else if(source===2){
// 		img="../img/bg_3.jpg";
// 	}else if(source===3){
// 		img="../img/bg_4.jpg";
// 	}
// 	var body=document.getElementById("body");
// 	body.setAttribute("background-image","../img/bg_3.jpg");
// }
function bindEvent(){

	var self=this;

	$body.on('click','.js-start',function(){
		$body.attr('data-status','start');
		GAME.start();
	});

	$body.on('click','.js-rule',function(){
		$body.attr('data-status','rule');
	});

	$body.on('click','.js-setting',function(){
		$body.attr('data-status','setting');
	});

	$body.on('click','.js-confirm-setting',function(){
		$body.attr('data-status','index');
	});

	$body.on('click','.js-confirm-rule',function(){
		$body.attr('data-status','index');
	});
}
var GAME={
	init:function(opts){
		var opts=Object.assign({},opts,CONFIG);
		this.opts=opts;

		this.planePosX=canvasWidth/2-opts.planeSize.width/2;
		this.planePosY=canvasHeight-opts.planeSize.height-50;

	},
	start:function(){
		var self=this;
		var opts=this.opts;
		var images=this.images;

		this.enemies=[];
		this.score=0;

		this.createSmallEnemyInterval=setInterval(function(){
			self.createEnemy('normal');
		},500);
		this.createBigEnemyInterval=setInterval(function(){
			self.createEnemy('big');
		},1500);

		//创建主角英雄
		this.plane=new Plane({
			x:this.planePosX,
			y:this.planePosY,
			width:opts.planeSize.width,
			height:opts.planeSize.height,
			//子弹尺寸速度
			bulletSize:opts.bulletSize,
			bulletSpeed:opts.bulletSpeed,
			//图标相关
			icon:resourceHelper.getImage('bluePlaneIcon'),
			bulletIcon:resourceHelper.getImage('fireIcon'),
			boomIcon:resourceHelper.getImage('enemyBigBoomIcon')
		});
		//飞机开始射击
		this.plane.startShoot();
		console.log(1);
		//开始更新游戏
		this.update();
	},
	update:function(){
		var self=this;
		var opts=this.opts;
		context.clearRect(0,0,canvasWidth,canvasHeight);
		//更新飞机、敌人
		this.updateElement();
		//先清理画布
		context.clearRect(0,0,canvasWidth,canvasHeight);
		if(this.plane.status==='boomed'){
			this.end();
			return;
		}
		//绘制画布
		this.draw();

		requestAnimFrame(function(){
			self.update()
		});

	},
	updateElement:function(){
		var enemies =this. enemies;
		var opts=this.opts;
		var enemySize=opts.enemySmallSize;
		var plane=this.plane
		var i=enemies.length;
		
		if(plane.status==='booming'){
			plane.booming();
			return;
		}

		//循环更新敌人
		while(i--){
			var enemy=enemies[i];
			enemy.down();
			if(enemy.y>=canvasHeight){
				this.enemies.splice(i,1);
			}else{
				//判断飞机状态
				if(plane.status==='normal'){
					if(plane.hasCrash(enemy)){
						plane.booming();
					}
				}
				//根据怪兽状态判断是否击中
				switch(enemy.status){
					case 'normal':
						if(plane.hasHit(enemy)){
							enemy.live-=1;
							if(enemy.live===0){
								enemy.booming();
							}
						}
						break;
					case 'booming':
						enemy.booming();
						break;
					case 'boomed':
						enemies.splice(i,1);
						break;
				}
			}
		}
	},
	/*
		绑定手指触摸
	*/
	bindTouchAction:function(){
		var opts=this.opts;
		var self=this;
		//飞机极限横坐标/纵坐标
		var planeMinX=0;
		var planeMinY=0;
		var planeMaxX=canvasWidth-opts.planeSize.width;
		var planeMaxY=canvasHeight-opts.planeSize.height;
		//手指初始位置坐标
		var startTouchX;
		var stratTouchY;
		//飞机起始位置
		var startPlaneX;
		var startPlaneY;

		//首次触屏
		$canvas.on('touchstart',function(e){
			var plane=self.plane;
			//记录首次触摸位置
			startTouchX=e.touches[0].clientX;
			startTouchY=e.touches[0].clientY;
			console.log('touchstart',startTouchX,stratTouchY);
			//记录飞机的起始位置
			startPlaneX=plane.x;
			startPlaneY=plane.y;

		});
		//滑动屏幕
		$canvas.on('touchmove',function(e){
			var newTouchX=e.touches[0].clientX;
			var newTouchY=e.touches[0].clientY;
			console.log('touchmove',newTouchX,newTouchY);
			//新的飞机坐标等于手指滑动的距离加上飞机初始位置
			var newPlaneX=startPlaneX+newTouchX-startTouchX;
			var newPlaneY=startPlaneY+newTouchY-startTouchY;
			//判断位置是否超出
			if(newPlaneX<planeMinX){
				newPlaneX=planeMinX;
			}
			if(newPlaneX>planeMaxX){
				newPlaneX=planeMaxX;
			}
			if(newPlaneY<planeMinY){
				newPlaneY=planeMinY;
			}
			if(newPlaneY>planeMaxY){
				newPlaneY=planeMaxY;
			}
			//更新飞机位置
			self.plane.setPosition(newPlaneX,newPlaneY);
			//禁止默认事件，防止滚动屏幕
			e.preventDefault();
		});
	},

	createEnemy:function(enemyType){
		var enemies =this. enemies;
		var opts=this.opts;
		var images=this.images||{};
		var enemySize=opts.enemySmallSize;
		var enemySpeed=opts.enemySpeed;
		var enemyIcon=resourceHelper.getImage('enemySmallIcon');
		var enemyBoomIcon=resourceHelper.getImage('enemySmallBoomIcon');

		var enemyLive=1;

		if(enemyType=='big'){
			enemySize=opts.enemyBigSize;
			enemyIcon=resourceHelper.getImage('enemyBigIcon');
			enemyBoomIcon=resourceHelper.getImage('enemyBigBoomIcon');
			enemySpeed=opts.enemySpeed*0.6;
			enemyLive=10;
		}
		var initOpt={
			x:Math.floor(Math.random()*(canvasWidth-enemySize.width)),
			y:-enemySize.height,
			enemyType:enemyType,
			live:enemyLive,
			width:enemySize.width,
			height:enemySize.height,
			speed:enemySpeed,
			icon:enemyIcon,
			boomIcon:enemyBoomIcon
		}

		if(enemies.length<opts.enemyMaxNum){
			enemies.push(new Enemy(initOpt));
		}


	},
	end:function(){
		alert('游戏结束');
		$body.attr('data-status','index');

	},
	draw:function(){
		this.enemies.forEach(function(enemy){
			enemy.draw();
		});
		this.plane.draw();
	}
};
function init(){
	resourceHelper.load(CONFIG.resources,function(resources){
		GAME.init();
		//绑定手指事件
		GAME.bindTouchAction();
		bindEvent();
	});
	
}

init();