class AcGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="ac-game-menu">
        <div class="ac-game-menu-field">
            <div class="ac-game-menu-field-item ac-game-menu-field-item-single-mode">
                单人模式
            </div>
            <br>
            <div class="ac-game-menu-field-item ac-game-menu-field-item-multi-mode">
                多人模式
            </div>
            <br>
            <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">
                退出
            </div>
        </div>
</div>
`);
        this.$menu.hide();
        this.root.$ac_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode');
        this.$multi_mode= this.$menu.find('.ac-game-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings');

        this.start();
}
    start(){
        this.add_listening_envents();
    }
    add_listening_envents(){
        let outer=this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show("single mode");
        });
        this.$multi_mode.click(function(){
            outer.hide();
            outer.root.playground.show("multi mode");
        });
        this.$settings.click(function(){
            console.log("click settings");
            outer.root.settings.logout_on_remote();
        });
    }
    show(){ //显示菜单
        this.$menu.show();
    }
    hide(){//关闭菜单
        this.$menu.hide();
    }
}

let GAME_OBJECTS = [];

class AcGameObject{
    constructor() {
        GAME_OBJECTS.push(this);
        this.has_called_start = false;  //表示有没有执行过start函数（把第一帧单独处理）
        this.timedelta = 0;//当前帧距离上一帧的时间间隔，因为不同浏览器帧的时间可能不同，所以速度统一用时间衡量，单位ms
        this.uuid = this.create_uuid();
    }


    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i ++ ) {
            let x = parseInt(Math.floor(Math.random() * 10));  // 返回[0, 1)之间的数
            res += x;
        }
        return res;
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

class GameMap extends AcGameObject{
    constructor(playground){
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);//创建画布
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }
    start(){

    }
    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    update(){
        this.render();
    }

    render(){
        this.ctx.fillStyle = "rgba(0,0,0,0.2)";
        this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
    }
}class Particle extends AcGameObject{
    constructor(playground,x,y,radius,vx,vy,color,speed,move_length){
        super();
        this.playground=playground;
        this.ctx=this.playground.game_map.ctx;
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.vx=vx;
        this.vy=vy;
        this.color=color;
        this.speed=speed;
        this.move_length=move_length;
        this.friction=0.9;
        this.eps=0.01;
    }


    start(){

    }

    update(){
        if(this.move_length<this.eps || this.speed<this.eps){
            this.destory();
            return false;
        }
        let moved=Math.min(this.move_length,this.speed*this.timedelta/1000);
        this.x+=this.vx*moved;
        this.y+=this.vy*moved;
        this.speed*=this.friction;
        this.move_length-moved;
        this.render();
    }

    render(){
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x* scale,this.y* scale,this.radius* scale,0,Math.PI*2,false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

}class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, character,username,photo) {
        super();
        this.x = x;
        this.y = y;
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.radius = radius;
        this.color = color;
        this.character = character;
        this.username = username;
        this.photo = photo;
        this.speed = speed;
        this.move_length = 0;
        this.vx = 0;
        this.vy = 0;
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = speed;
        this.friction = 0.9;
        this.eps = 0.01;
        this.cur_skill = null;
        this.spent_time = 0;
        this.fireballs=[];
        if(this.character !="robot" ){
            this.img = new Image();
            this.img.src = this.photo;
        }
    }

    start() {
        if (this.character === "me") {
            this.add_listening_events();
        }
        else if(this.character==="robot"){
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);
        }
    }

    add_listening_events() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function (e) {
            const rect=outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 3) {
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                outer.move_to(tx, ty);

                if (outer.playground.mode === "multi mode") {
                    outer.playground.mps.send_move_to(tx, ty);
                }

            }
            
            else if (e.which === 1) {
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                if (outer.cur_skill === "fireball") {


                    let fireball = outer.shoot_fireball(tx, ty);

                    if (outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_shoot_fireball(tx, ty, fireball.uuid);
                    }
                } 

    
                outer.cur_skill = null;
            }
        });

        $(window).keydown(function (e) {
            if (e.which === 81) {//q键火球
                outer.cur_skill = "fireball";

                return false;
            }
        });
    }


    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y;
        let radius = 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = 0.5;
        let move_length = 1;
        let fireball = new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length,  0.01);
        this.fireballs.push(fireball);
        return fireball;
    }

    destroy_fireball(uuid) {
        for (let i = 0; i < this.fireballs.length; i ++ ) {
            let fireball = this.fireballs[i];
            if (fireball.uuid === uuid) {
                fireball.destroy();
                break;
            }
        }
    }



    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy)
    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }


    is_attacked(angle, damage) {

        for (let i = 0; i < 10 + Math.random() * 10; i++) { //粒子特效
            let x = this.x;
            let y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 5;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }

        this.radius -= damage;
        if (this.radius < this.eps) {
            this.destory();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
        this.speed *= 0.9;


    }


    update() {
        this.update_move();
        this.render();
    }

    update_move(){
        this.spent_time += this.timedelta / 1000;
        if (this.character ==="robot" && this.spent_time > 4 && Math.random() < 1 / 300.0) {
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let tx = player.x+player.speed*player.vx*this.timedelta/1000*0.3;
            let ty = player.x+player.speed*player.vy*this.timedelta/1000*0.3;
            this.shoot_fireball(tx,ty);
        }

        if (this.damage_speed > this.eps) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        }
        else {
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (this.character === "robot") {
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height/ this.playground.scale;
                    this.move_to(tx, ty);
                }
            }
            else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
    }

    render() {
        let scale = this.playground.scale;
        if(this.character !== "robot"){
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y* scale, this.radius* scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2* scale, this.radius * 2* scale); 
            this.ctx.restore();
        }
        else{
            this.ctx.beginPath();
            this.ctx.arc(this.x* scale, this.y* scale, this.radius* scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
    }
}

    on_destory(){
        for(let i=0;i<this.playground.players.length;i++){
            if(this.playground.players[i]===this){
                this.playground.players.splice(i,1);
            }
        }
    }
}class FireBall extends AcGameObject{
    constructor(playground,player,x,y,radius,vx,vy,color,speed,move_length,damage){
        super();
        this.x=x;
        this.y=y;
        this.playground=playground;
        this.player = player;
        this.ctx=this.playground.game_map.ctx;
        this.radius=radius;
        this.color=color;
        this.speed=speed;
        this.vx =vx;
        this.vy=vy;
        this.move_length=move_length;
        this.eps=0.01;
        this.damage=damage;
    }

    start(){

    }

    update(){
        if(this.move_length<this.eps){
            this.destory();
            return false;
        }
        this.update_move();
        this.update_attack();

        this.render();
    }

    update_move(){
        let moved = Math.min(this.move_length,this.speed * this.timedelta/1000);
        this.x += this.vx*moved;
        this.y += this.vy*moved;
        this.move_length -= moved;
    }

    update_attack(){
        for(let i=0;i< this.playground.players.length;i++){
            let player = this.playground.players[i];
            if(this.player !== player &&this.is_collision(player)){
                this.attack(player);
                break;
            }
        }
    }

    get_dist(x1,y1,x2,y2){
        let dx =x1-x2;
        let dy=y1-y2;
        return Math.sqrt(dx*dx+dy*dy);
    }

    is_collision(player){
        let distance = this.get_dist(this.x,this.y,player.x,player.y);
        if(distance < this.radius + player.radius)
            return true;
        return false;
    }

    attack(player){
        let angle = Math.atan2(player.y-this.y,player.x-this.x);
        player.is_attacked(angle,this.damage);
        this.destory();

    }

    render(){
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x *scale,this.y*scale,this.radius*scale,0,Math.PI*2,false);
        this.ctx.fillStyle=this.color;
        this.ctx.fill();
}
on_destroy() {
    let fireballs = this.player.fireballs;
    for (let i = 0; i < fireballs.length; i ++ ) {
        if (fireballs[i] === this) {
            fireballs.splice(i, 1);
            break;
        }
    }
}

}
class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;

        this.ws = new WebSocket("wss://app946.acapp.acwing.com.cn/wss/multiplayer/");

        this.start();
    }

    start() {
        this.receive();
    }
    
    receive () {
        let outer = this;

        this.ws.onmessage = function(e) {
            let data = JSON.parse(e.data);
            let uuid = data.uuid;
            if (uuid === outer.uuid) return false;

            let event = data.event;
            if (event === "create_player") {
                outer.receive_create_player(uuid, data.username, data.photo);
            }else if (event === "move_to") {
                outer.receive_move_to(uuid, data.tx, data.ty);
            }else if (event === "shoot_fireball") {
                outer.receive_shoot_fireball(uuid, data.tx, data.ty, data.ball_uuid);
            }


        };
    }


    send_create_player(username, photo) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uuid': outer.uuid,
            'username': username,
            'photo': photo,
        }));
    }

    get_player(uuid) {
        let players = this.playground.players;
        for (let i = 0; i < players.length; i ++ ) {
            let player = players[i];
            if (player.uuid === uuid)
                return player;
        }

        return null;
    }


    receive_create_player(uuid, username, photo) {
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.15,
            "enemy",
            username,
            photo,
        );
        player.uuid = uuid;
        this.playground.players.push(player);

        }

        send_move_to(tx, ty) {
            let outer = this;
            this.ws.send(JSON.stringify({
                'event': "move_to",
                'uuid': outer.uuid,
                'tx': tx,
                'ty': ty,
            }));
        }

        receive_move_to(uuid, tx, ty) {
            let player = this.get_player(uuid);
    
            if (player) {
                player.move_to(tx, ty);
            }
        }
    
        send_shoot_fireball(tx, ty, ball_uuid) {
            let outer = this;
            this.ws.send(JSON.stringify({
                'event': "shoot_fireball",
                'uuid': outer.uuid,
                'tx': tx,
                'ty': ty,
                'ball_uuid': ball_uuid,
            }));
        }

        receive_shoot_fireball(uuid, tx, ty, ball_uuid) {
            let player = this.get_player(uuid);
            if (player) {
                let fireball = player.shoot_fireball(tx, ty);
                fireball.uuid = ball_uuid;
            }
        }
    
    
}class AcGamePlayground{
    constructor(root){
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);

        this.hide();
        this.root.$ac_game.append(this.$playground);

        this.start();
    }

    get_random_color(){
        let colors=["blue","red","pink","grey","green"];
        return colors[Math.floor(Math.random()*5)];
    }

    start(){
        let outer = this;
        $(window).resize (function() {
            outer.resize();
        });

    }

    resize() {
        console.log("resize");
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;
    
        if (this.game_map) this.game_map.resize();
    }

    show(mode){
        let outer = this
        this.$playground.show();
       
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.mode = mode;
        this.resize();
        this.players=[];
        this.players.push(new Player(this,this.width/2/this.scale,0.5,0.05,"white",0.15,"me",this.root.settings.username,this.root.settings.photo))

        if (mode === "single mode") {
        for(let i=0;i<5;i++){
            this.players.push(new Player(this,this.width/2/this.scale,0.5,0.05,this.get_random_color(),0.15,"robot"));
        }
    }else if (mode === "multi mode"){
        this.mps = new MultiPlayerSocket(this);
        this.mps.uuid = this.players[0].uuid;
        this.mps.ws.onopen = function() {
            outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
        };

    }
    }

    hide(){
        this.$playground.hide();
    }
}


class Settings
{
    constructor(root)
    {
        this.root = root; // 根基
        this.platform = "WEB"; // 默认平台
        if (this.root.AcWingOS) this.platform = "ACAPP"; // AcWingOS平台
        this.username = "";
        this.photo="";

        this.$settings = $(`
        <div class="ac-game-settings">
            <div class="ac-game-settings-login">

                <div class="ac-game-settings-title"> <!--标题-->
                    登录
                </div>

                <div class="ac-game-settings-username"> <!--用户名输入框-->
                    <div class="ac-game-settings-item">
                        <input type="text" placeholder="用户名"> <!--输入处-->
                    </div>
                </div>

                <div class="ac-game-settings-password"> <!--密码输入框-->
                    <div class="ac-game-settings-item">
                        <input type="password" placeholder="密码"> <!--密码输入处-->
                    </div>
                </div>

                <div class="ac-game-settings-submit"> <!--按钮-->
                    <div class="ac-game-settings-item">
                        <button>登录</button>
                    </div>
                </div>

                <div class="ac-game-settings-error-message">
                </div>
            
                <div class="ac-game-settings-option"> <!--注册选项-->
                    注册
                </div>

                <br> 
                <div class="ac-game-settings-acwing">
                    <img width="30" src="https://cdn.acwing.com/media/article/image/2021/11/18/1_ea3d5e7448-logo64x64_2.png" > 
                    <br>
                    <div> <!--图标下提示信息-->
                        AcWing 一键登录
                    </div>
                </div>

            </div>


            <div class="ac-game-settings-register"> <!--这是注册界面-->
                <div class="ac-game-settings-title">
                    注册
                </div>

                <div class="ac-game-settings-username"> <!--用户名输入框-->
                    <div class="ac-game-settings-item">
                        <input type="text" placeholder="用户名"> <!--输入处-->
                    </div>
                </div>

                <div class="ac-game-settings-password ac-game-settings-password-first"> <!--密码输入框-->
                    <div class="ac-game-settings-item">
                        <input type="password" placeholder="密码"> <!--密码输入处-->
                    </div>
                </div>

                <div class="ac-game-settings-password ac-game-settings-password-second"> <!--确认密码输入框-->
                    <div class="ac-game-settings-item">
                        <input type="password" placeholder="确认密码"> 
                    </div>
                </div>

                <div class="ac-game-settings-submit"> <!--按钮-->
                    <div class="ac-game-settings-item">
                        <button>注册</button>
                    </div>
                </div>

                <div class="ac-game-settings-error-message">
                </div>
            
                <div class="ac-game-settings-option"> 
                    登录
                </div>

                <br> 
                <div class="ac-game-settings-acwing">
                    <img width="30" src="https://cdn.acwing.com/media/article/image/2021/11/18/1_ea3d5e7448-logo64x64_2.png" > 
                    <br>
                    <div> <!--图标下提示信息-->
                        AcWing 一键登录
                    </div>
                </div>

        </div>
            `); // 生成settings的html对象


        
        
        this.$login = this.$settings.find(".ac-game-settings-login"); // 登录界面

        this.$login_username = this.$login.find(".ac-game-settings-username input"); // 用户名输入框
        this.$login_password = this.$login.find(".ac-game-settings-password input"); // 密码输入框
        this.$login_submit = this.$login.find(".ac-game-settings-submit button"); // 提交按钮
        this.$login_error_message = this.$login.find(".ac-game-settings-error-message"); // 错误信息
        this.$login_register = this.$login.find(".ac-game-settings-option"); // 注册选项
    
        this.$login.hide(); // 隐藏登录界面
        
        this.$register = this.$settings.find(".ac-game-settings-register"); // 注册界面
        this.$register_username = this.$register.find(".ac-game-settings-username input"); 

        this.$register_password = this.$register.find(".ac-game-settings-password-first input"); 
        this.$register_password_confirm = this.$register.find(".ac-game-settings-password-second input");
        this.$register_submit = this.$register.find(".ac-game-settings-submit button");
        this.$register_error_message = this.$register.find(".ac-game-settings-error-message");
        this.$register_login = this.$register.find(".ac-game-settings-option"); // 登陆选项
    

        this.$register.hide(); // 隐藏注册界面
        this.$acwing_login = this.$settings.find(".ac-game-settings-acwing img");

        this.root.$ac_game.append(this.$settings); // 将这个html对象加入到ac_game


        this.start();
    }


    add_listening_events()
{
    let outer = this;
    this.add_listening_events_login();
    this.add_listening_events_register();

    this.$acwing_login.click(function() {
        outer.acwing_login();
    });
}

add_listening_events_register()
{
    let outer = this;

    this.$register_login.click(function(){ // 在注册页面点击登录选项就打开登录界面
        outer.login(); 
    });
    this.$register_submit.click(function(){ // 在注册页面点击登录选项就打开登录界面
        outer.register_on_remote(); 
    });
}



acwing_login() {
    $.ajax({
        url: "https://app946.acapp.acwing.com.cn/settings/acwing/web/apply_code/",
        type: "GET",
        success: function(resp) {
            if (resp.result === "success") {
                window.location.replace(resp.apply_code_url);
            }
        }
    });
}


add_listening_events_login()
{
    let outer = this;

    this.$login_register.click(function(){ // 在登录页面点击注册选项就打开注册界面
        outer.register();    
    });
    this.$login_submit.click(function(){
        outer.login_on_remote();
    });
}

login_on_remote() // 在远程服务器上登录
{
    let outer = this;

    let username = this.$login_username.val(); // 获取输入框中的用户名
    let password = this.$login_password.val(); // 获取输入框中的密码

    this.$login_error_message.empty(); // 清楚错误信息

    $.ajax({
        url: "https://app946.acapp.acwing.com.cn/settings/login/", // 访问url
        type: "GET",
        data: {
            username: username, // 传输数据
            password: password, 
        },
        success: function(resp){

            if (resp.result === "success")
            {
                location.reload(); // 如果成功了就刷新
            }
            else
            {
                outer.$login_error_message.html(resp.result); // 如果失败了就显示错误信息
            }
        }
    });
}

register_on_remote()
{
    let outer = this;
    let username = this.$register_username.val();
    let password = this.$register_password.val();
    let password_confirm = this.$register_password_confirm.val();

    this.$register_error_message.empty();

    $.ajax({
        url: "https://app946.acapp.acwing.com.cn/settings/register/",
        type: "GET",
        data: {
            username: username,
            password: password,
            password_confirm: password_confirm,
        },
        success: function(resp){

            if (resp.result === "success")
            {
                location.reload(); // 刷新网页
            }
            else
            {
                outer.$register_error_message.html(resp.result);
            }
        }
    });
}

logout_on_remote() // 在远程服务器上登出
{
    if (this.platform === "ACAPP") {
        this.root.AcWingOS.api.window.close();
    } // 如果在ACAPP退出就直接退出
else{
    $.ajax({
        url: "https://app946.acapp.acwing.com.cn/settings/logout/",
        type: "GET",
        success: function(resp){
            if (resp.result === "success")
            {
                location.reload(); // 如果成功了就直接刷新
            }
        }
    });
}
}





    register() // 打开注册页面
    {
        this.$login.hide();
        this.$register.show();
    }

    login() // 打开登录页面
    {
        this.$register.hide();
        this.$login.show();
    }

    acapp_login(appid, redirect_uri, scope, state) {
        let outer = this;

        this.root.AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, function(resp) {
            if (resp.result === "success") {
                outer.username = resp.username;
                outer.photo = resp.photo;
                outer.hide();
                outer.root.menu.show();
            }
        });
    }



    getinfo_acapp() {
        let outer = this;

        $.ajax({
            url: "https://app946.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/",
            type: "GET",
            success: function(resp) {
                if (resp.result === "success") {
                    outer.acapp_login(resp.appid, resp.redirect_uri, resp.scope, resp.state);
                }
            }
        });
    }


    getinfo_web() // 获取信息
    {
        let outer = this;

        $.ajax({ // 发送一个请求
            url: "https://app946.acapp.acwing.com.cn/settings/getinfo/", // 获取信息的URL
            type: "GET", // 获取方式类型
            data: {
                platform: outer.platform, // 平台信息
            },
            success: function(resp){ // resp是发送请求之后返回的响应 (就是view里面返回的字典)

                if (resp.result === "success")
                {
                    outer.username=resp.username;
                    outer.photo=resp.photo;
                    outer.hide(); // 隐藏这个登录页面
                    outer.root.menu.show(); // 并显示游戏菜单
                }
                else
                { 
                    outer.login(); // 如果没有登录就打开这个登录页面
                }
            }
        })
    }

    hide()
    {
        this.$settings.hide();
    }

    show()
    {
        this.$settings.show();
    
    }

    start()
    {   
        if (this.platform === "ACAPP") {
            this.getinfo_acapp();
        } else {
            this.getinfo_web();
            this.add_listening_events();
        }

    }
}export class AcGame {
    constructor(id,AcWingOS) {
        this.id = id;
        this.$ac_game = $('#' + id);
        this.AcWingOS = AcWingOS;//跑在ACWING传入AcWINGOS时传入参数，判断在哪个端执行
        this.settings = new Settings(this);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);
        
        this.start();
    }
    start(){
        
    }
}