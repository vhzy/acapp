let GAME_OBJECTS = [];

class AcGameObject{
    constructor() {
        GAME_OBJECTS.push(this);
        this.has_called_start = false;  //表示有没有执行过start函数（把第一帧单独处理）
        this.timedelta = 0;//当前帧距离上一帧的时间间隔，因为不同浏览器帧的时间可能不同，所以速度统一用时间衡量，单位ms
    }

    start(){  //只会在第一帧执行一次

    }

    update(){//每一帧执行一次

    }

    on_destory(){   //销毁前执行一次

    }



    destory(){    //删除该物体
        this.on_destory();
        for(let i=0;i<GAME_OBJECTS.length;i++){
            if(GAME_OBJECTS[i] === this){
                GAME_OBJECTS.splice(i,1);
                break;
            }
        }
    }
}

let last_timestamp;
let GAME_ANIMATION = function(timestamp){  //timestamp时间戳，在哪一个时刻调用这个函数
    for (let i = 0;i<GAME_OBJECTS.length; i++){
        let obj = GAME_OBJECTS[i];
        if(!obj.has_called_start){
            obj.start();
            obj.has_called_start = true;
        }
        else{
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;

    requestAnimationFrame(GAME_ANIMATION);
}


requestAnimationFrame(GAME_ANIMATION);  //一秒钟调用60次，在下一次调用上函数并给它传参timestamp

