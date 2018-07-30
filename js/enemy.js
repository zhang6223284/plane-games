var Enemy=function(opts){
	var opts=opts||{};
	Element.call(this,opts);

	this.status='normal';
	this.icon=opts.icon;
	this.live=opts.live;
	this.type=opts.type;
	//特有属性，爆炸相关
	this.boomIcon=opts.boomIcon;
	this.boomCount=0;
};
Enemy.prototype=new Element();

Enemy.prototype.down=function(){
	this.move(0,this.speed);
};

/*
 	方法：booming 爆炸中
*/
Enemy.prototype.booming=function(){
	//设置状态为booming
	this.status='booming';
	this.boomCount+=1;
	//如果已经booming了6次，则设置状态为boomed
	if(this.boomCount>6){
		this.status='boomed';
	}
};

Enemy.prototype.draw=function(){
	// context.fillRect(this.x,this.y,this.width,this.height);
	switch(this.status){
		case 'normal':
		context.drawImage(this.icon,this.x,this.y,this.width,this.height);
		break;
		case 'booming':
		context.drawImage(this.boomIcon,this.x,this.y,this.width,this.height);
		break;
	}
};