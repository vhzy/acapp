export class AcGame {
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