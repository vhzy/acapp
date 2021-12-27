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
}