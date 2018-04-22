/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/**
 * 父类：element对象
 */
var Element = function (opts) {
  var opts = opts || {};
  // 设置坐标和尺寸
  this.x = opts.x;
  this.y = opts.y;
  this.width = opts.width;
  this.height = opts.height;
  this.speed = opts.speed;
};
// 子弹对象原型
Element.prototype = {
  /**
   * 原型方法 move 
   */
  move: function(x, y) {
    var addX = x || 0;
    var addY = y || 0;
    this.x += x;
    this.y += y;
  },
  /**
   * 实际没什么用，主要为了理解面向对象的概念
   */
  draw: function() {

  }
};

