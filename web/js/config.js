/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/**
 * 游戏相关配置
 * @type {Object}
 */
var CONFIG = {
  planeSize: {
    width: 60,
    height: 45
  }, 
  planeType: 'bluePlaneIcon', // 默认是蓝色
  bulletSize: {
    width: 20,
    height: 20
  },
  enemySpeed: 4, // 默认敌人移动距离
  enemyMaxNum: 5, // 敌人最大梳理
  enemySmallSize: {
    width: 54,
    height: 40
  },
  enemyBigSize: {
    width: 130,
    height: 100
  },
  bulletSpeed: 10, // 默认子弹的移动速度
  resources: {
    images: [
      { src: './img/plane_1.png',
        name: 'bluePlaneIcon'
      },
      { src: './img/plane_2.png',
        name: 'pinkPlaneIcon'
      },
      { src: './img/fire.png',
        name: 'fireIcon'
      },
      { src: './img/enemy_big.png',
        name: 'enemyBigIcon'
      },
      { src: './img/enemy_small.png',
        name: 'enemySmallIcon'
      },
      { src: './img/boom_big.png',
        name: 'enemyBigBoomIcon'
      },
      { src: './img/boom_small.png',
        name: 'enemySmallBoomIcon'
      },
      { src: './img/bg_1.jpg',
        name: 'bg1'
      },
      { src: './img/bg_2.jpg',
        name: 'bg2'
      },
      { src: './img/bg_3.jpg',
        name: 'bg3'
      },
      { src: './img/bg_4.jpg',
        name: 'bg4'
      }
    ],
  }
};

