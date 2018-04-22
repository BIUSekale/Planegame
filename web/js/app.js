/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
//用户名与得分
var username;
var recordScore;

//设置选项
var planeIcon = "bluePlaneIcon";
var fireIcon = "fireIcon";
var background = "../img/bg_1.jpg";

// 常用的元素和变量
var $body = $(document.body);

// 画布相关
var $canvas = $('#game');
var canvas = $canvas.get(0);
var context = canvas.getContext("2d");
// 设置画布的宽度和高度
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
// 获取画布相关信息
var canvasWidth = canvas.clientWidth;
var canvasHeight = canvas.clientHeight;

var hitCount = 0;

// 判断是否有 requestAnimationFrame 方法，如果有则模拟实现
window.requestAnimFrame =
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 30);
        };

/**
 * 基本事件绑定
 */
function bindEvent() {
    // 绑定事件
    var self = this;
    // 点击开始按钮
    $body.on('click', '.js-start', function () {
        $body.attr('data-status', 'login');
    });

    //登录
    $body.on('click', '.js-login', function () {
        if ($("#userID").val() != "") {
            $body.attr('data-status', 'start');
            // 开始游戏
            GAME.start();
            username = $("#userID").val();
        } else {
            $body.attr('data-status', 'prompt');
        }
    });

    // 点击提示姓名不为空时的我知道了按钮
    $body.on('click', '.js-confirm-prompt', function () {
        $body.attr('data-status', 'login');
    });

    //点击再来一次
    $body.on('click', '.js-again', function () {
        $body.attr('data-status', 'start');
        GAME.start();
    });

    //点击分数排名
    $body.on('click', '.js-rank', function () {
        $body.attr('data-status', 'rank');
        $.ajax({
            type: "POST",
            url: "rank",
            async: false,
            error: function (request) {
                alert("Connection error");
            },
            success: function (data) {
                //接收后台返回的结果 
//                console.log(data);
                var ranks = data.split("!");
                console.log(ranks);
                for (var i = 1; i < ranks.length; i++) {
                    var rank = ranks[i - 1].split(" ");
                    $("#name" + i).text(rank[0]);
                    $("#record" + i).text(rank[1]);
                }
            }
        });
    });

    //点击回到菜单
    $body.on('click', '.js-back', function () {
        $body.attr('data-status', 'index');
    });

    // 点击说明按钮
    $body.on('click', '.js-rule', function () {
        $body.attr('data-status', 'rule');
    });

    // 点击设置按钮
    $body.on('click', '.js-setting', function () {
        $body.attr('data-status', 'setting');
    });

    // 点击确认设置按钮
    $body.on('click', '.js-confirm-setting', function () {
        $body.attr('data-status', 'index');
        // 设置游戏
        $body.css("background-image","url('"+background+"')");
        GAME.init();
    });

    // 点击我知道了规则的按钮
    $body.on('click', '.js-confirm-rule', function () {
        $body.attr('data-status', 'index');
    });

    $("#setting-bullet").change(function () {
        var r = $(this).children('option:selected').val();
        if (r == "1") {
            fireIcon = "fireIcon";
        } else if (r == "2") {
            fireIcon = "enemySmallBoomIcon";
        }
        console.log("setting-bullet" + r);
    });

    $("#setting-bg").change(function () {
        var r = $(this).children('option:selected').val();
        if (r == "1") {
            background = "./img/bg_1.jpg";
        } else if (r == "2") {
            background = "./img/bg_2.jpg";
        } else if (r == "3") {
            background = "./img/bg_3.jpg";
        } else if (r == "4") {
            background = "./img/bg_4.jpg";
        }
        console.log("setting-bg" + r);
    });

    $("#setting-plane").change(function () {
        var r = $(this).children('option:selected').val();
        planeIcon = r;
        console.log("setting-plane" + r);
    });

}


/**
 * 游戏对象
 */
var GAME = {
    /**
     * 游戏初始化
     */
    init: function (opts) {
        // 设置opts
        var opts = Object.assign({}, opts, CONFIG);
        this.opts = opts;

        // 计算飞机初始坐标
        this.planePosX = canvasWidth / 2 - opts.planeSize.width / 2;
        this.planePosY = canvasHeight - opts.planeSize.height - 50;


        // console.log(this.opts);
    },
    /**
     * 游戏开始需要设置
     */
    start: function () {
        // 获取游戏初始化 level
        var self = this; // 保存函数调用对象（即Game）
        var opts = this.opts;
        var images = this.images;
        // 清空射击目标对象数组和分数设置为 0
        this.enemies = [];
        this.score = 0;

        // 随机生成大小敌机
        this.createSmallEnemyInterval = setInterval(function () {
            self.createEnemy('normal');
        }, 500);
        this.createBigEnemyInterval = setInterval(function () {
            self.createEnemy('big');
        }, 1500);

        this.plane = new Plane({
            x: this.planePosX,
            y: this.planePosY,
            width: opts.planeSize.width,
            height: opts.planeSize.height,
            bulletSize: opts.bulletSize,
            bulletSpeed: opts.bulletSpeed,
            icon: resourceHelper.getImage(planeIcon),
            bulletIcon: resourceHelper.getImage(fireIcon),
            boomIcon: resourceHelper.getImage('enemyBigBoomIcon')
        });
        console.log(this.plane);
        this.plane.startShoot();
        // 开始更新游戏
        this.update();
    },
    update: function () {
        var self = this;
        var opts = this.opts;
        // 更新飞机、敌人
        this.updateElement();

        // 先清理画布
        context.clearRect(0, 0, canvasWidth, canvasHeight);

        if (this.plane.status === 'boomed') {
            this.end();
            return;
        }

        // 绘制画布
        this.draw();

        // 不断循环 update
        requestAnimFrame(function () {
            self.update()
        });
    },
    /**
     * 更新当前所有元素的状态
     */
    updateElement: function () {
        var opts = this.opts;
        var enemySize = opts.enemySize;
        var enemies = this.enemies;
        var i = enemies.length;
        var plane = this.plane;

        if (plane.status === 'booming') {
            plane.booming();
            return;
        }

        // 循环更新怪兽
        while (i--) {
            var enemy = enemies[i];
            enemy.down();
            if (enemy.y >= canvasHeight) {
                this.enemies.splice(i, 1);
            } else {
                // 判断飞机状态
                if (plane.status === 'normal') {
                    if (plane.hasCrash(enemy)) {
                        plane.booming();
                    }
                }
                //根据敌人状态判断是否被击中
                switch (enemy.status) {
                    case 'normal':
                        if (plane.hasHit(enemy)) {
                            enemy.live -= 1;
//                             console.log(enemy.boomCount,enemy.width);
                            if (enemy.live === 0) {
                                enemy.booming();
                            }
                        }
                        break;
                    case 'booming':
                        enemy.booming();
                        break;
                    case 'boomed':
                        if (enemy.width > 100)
                            this.score += 50;
                        else
                            this.score += 10;
                        $("#scoring").text(this.score);
                        hitCount += 1;
                        enemies.splice(i, 1);
//                        console.log(enemy.boomCount, enemy.width, enemy.height);
                        break;
                }
            }
        }
    },

    bindTouchAction: function () {
        var opts = this.opts;
        var self = this;
        var planeMinX = 0;
        var planeMinY = 0;
        var planeMaxX = canvasWidth - opts.planeSize.width;
        var planeMaxY = canvasHeight - opts.planeSize.height;

        var startTouchX;
        var startTouchY;

        var startPlaneX;
        var startPlaneY;

        $canvas.on('touchstart', function (e) {
            var plane = self.plane;
            startTouchX = e.touches[0].clientX;
            startTouchY = e.touches[0].clientY;
//            console.log('touchstart', startTouchX, startTouchY);
            startPlaneX = plane.x;
            startPlaneY = plane.y;
        });

        $canvas.on('touchmove', function (e) {
            var plane = self.plane;
//            拖住飞机才可移动，去掉if则拖动屏幕任意位置即可移动
//            if (startTouchX >= startPlaneX && 
//                    startTouchX <= startPlaneX + plane.width &&
//                    startTouchY >= startPlaneY &&
//                    startTouchY <= startPlaneY + plane.height) {
                var newTouchX = e.touches[0].clientX;
                var newTouchY = e.touches[0].clientY;
                //console.log('touchmove',newTouchX,newTouchY);

                var newPlaneX = startPlaneX + newTouchX - startTouchX;
                var newPlaneY = startPlaneY + newTouchY - startTouchY;

                if (newPlaneX < planeMinX) {
                    newPlaneX = planeMinX;
                }
                if (newPlaneX > planeMaxX) {
                    newPlaneX = planeMaxX;
                }
                if (newPlaneY < planeMinY) {
                    newPlaneY = planeMinY;
                }
                if (newPlaneY > planeMaxY) {
                    newPlaneY = planeMaxY;
                }
                self.plane.setPosition(newPlaneX, newPlaneY);
    //            console.log('touchmove', startTouchX, startTouchY);
                // console.log('touchmove',newTouchX,newTouchY);
                // console.log('touchmove',newPlaneX,newPlaneY);    
//            }
            e.preventDefault();
        });
    },
    /**
     * 生成怪兽
     */
    createEnemy: function (enemyType) {
        var enemies = this.enemies;
        var opts = this.opts;
        var images = this.images || {};
        var enemySize = opts.enemySmallSize;
        var enemySpeed = opts.enemySpeed;
        var enemyIcon = resourceHelper.getImage('enemySmallIcon');
        var enemyBoomIcon = resourceHelper.getImage('enemySmallBoomIcon');


        var enemyLive = 1;

        // 大型敌机参数
        if (enemyType === 'big') {
            enemySize = opts.enemyBigSize;
            enemyIcon = resourceHelper.getImage('enemyBigIcon');
            enemyBoomIcon = resourceHelper.getImage('enemyBigBoomIcon');
            enemySpeed = opts.enemySpeed * 0.6;
            enemyLive = 10;
        }

        // 综合元素的参数
        var initOpt = {
            x: Math.floor(Math.random() * (canvasWidth - enemySize.width)),
            y: -enemySize.height,
            enemyType: enemyType,
            live: enemyLive,
            width: enemySize.width,
            height: enemySize.height,
            speed: enemySpeed,
            icon: enemyIcon,
            boomIcon: enemyBoomIcon
        }

        // 怪兽的数量不大于最大值则新增
        if (enemies.length < opts.enemyMaxNum) {
            enemies.push(new Enemy(initOpt));
        }

        //console.log(enemies);
    },
    end: function () {
        $body.attr('data-status', 'end');
        $("#username").text(username);
        $("#score").text(this.score);
        $.ajax({
            type: "POST",
            url: "update?username=" + username + "&score=" + this.score,
//            url: "update",
            async: false,
            error: function (request) {
                alert("Connection error");
            },
            success: function (data) {
                //接收后台返回的结果 
                console.log(data);
                $("#record").text(data);
            }
        });
//        alert('GAME END. Hit ' + hitCount + 'enemies.');
    },
    draw: function () {
        this.enemies.forEach(function (enemy) {
            enemy.draw();
        });
        this.plane.draw();
    }
};

/**
 * 页面主入口
 */
function init() {
    // 加载图片资源，加载完成才能交互
    resourceHelper.load(CONFIG.resources, function (resources) {
        // 加载完成
        GAME.init();
        GAME.bindTouchAction();
        bindEvent();
    });

}

init();

