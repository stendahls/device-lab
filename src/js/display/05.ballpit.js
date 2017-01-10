var ballpit = function() {
  "use strict";
  
  var radius = viewConfig.radius;
  var step = 3;
  var go = false;
  var balls = {};
  var pitDims = [];
  var pitBox = {};
  var initialAngles = [30,60,120,150,210,240,300,330,30,60,120,150,210,240,300,330];
  
  var init = function() {
    getPitSize();
    window.addEventListener('resize',getPitSize);
    ticker();
    registerEvents();
  };
  
  var currentMode = function() {
    var allClasses = document.querySelector('[data-js-container]').classList;
    var modeClasses = [];
    allClasses = Array.prototype.slice.call(allClasses, 0);
    modeClasses = allClasses.map(function(cssClass){
      return (cssClass.indexOf('mode') >= 0 ? cssClass : false );
    });
    return modeClasses.join('').replace(/false/g,'').replace('mode--','');
  };

  var registerEvents = function() {
    
    document.querySelector('[data-js-container]').addEventListener('mouseout', function(e){
      if (currentMode() !== 'all') {
        return;
      }
      var target = e.target.closest('[data-js-radar-g-device-arcs]') || e.target.matches('[data-js-radar-txt-title]') || e.target.matches('[data-js-radar-txt-value]');
      if (target) {
        var radar = e.target.closest('[data-js-radar]');
        var index = radar.id;
        balls[index].go = true;
        balls[index].DOM.style.zIndex = 1;
      }
    });
    document.querySelector('[data-js-container]').addEventListener('mouseover', function(e){
      if (currentMode() !== 'all') {
        return;
      }
      var target = e.target.closest('[data-js-radar-g-device-arcs]') || e.target.matches('[data-js-radar-txt-title]') || e.target.matches('[data-js-radar-txt-value]');
      if (target) {
        var radar = e.target.closest('[data-js-radar]');
        var index = radar.id;
        balls[index].go = false;
        balls[index].DOM.style.zIndex = 10;
      }
    });
    
  };

  var start = function() {
    if (!go) {
      setTimeout(function() {
        go = true;
        for (var index in balls) {
          balls[index].go = true;
        }
        document.querySelector('[data-js-container]').classList.add('ballpit--run');
      },500);
    }
  };

  var stop = function() {
    if (go) {
      go = false;
      document.querySelector('[data-js-container]').classList.remove('ballpit--run');
      
    }
  };

  var addBall = function(index) {
    var r = getBallSize(index);
    balls[index] = {
      'DOM': document.querySelector('#' + index),
      'go': true,
      'pos': {
        'x': 0,
        'y': 0
      },
      'angle': (360/gaConfig.views.length) * Object.keys(balls).length,
      'r': getBallSize(index),
      'box': {
        'top': 0 - r,
        'right': r,
        'bottom': r,
        'left': 0 - r
      }
    };
    
  };
  
  var getPitSize = function() {
    var width  = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    pitDims = [
      width,
      height
    ];
    pitBox = {
      'top':    (0 - pitDims[1]/2 + step),
      'right':  (pitDims[0]/2 - step),
      'bottom': (pitDims[1]/2 - step),
      'left':   (0 - pitDims[0]/2 + step),
    };
  };
  
  var getBallSize = function(index) {
    var ball = document.querySelector('#' + index);
    if (!ball) {
      return;
    }
    var size = ball.getAttribute('data-js-radar-size');
    return size * radius;
  };
  
  var detectPitCollision = function(index) {
    var ballBox = balls[index].box;
    //console.log('ball:' + ballBox.right + ' | box:' + pitBox.right);
    if (ballBox.top <= pitBox.top) {
      //console.warn('TOP!!');
      return 'top';
    } else if (ballBox.left <= pitBox.left) {
      //console.warn('LEFT!!');
      return 'left';
    } else if (ballBox.right >= pitBox.right) {
      //console.warn('RIGHT!!');
      return 'right';
    } else if (ballBox.bottom >= pitBox.bottom) {
      //console.warn('BOTTOM!!');
      return 'bottom';
    }
    //console.log(ballBox.bottom + ' : ' + pitBox.bottom)
    return false;
  };
  
  var detectBallCollision = function(index) {
    return false;
  };
  
  var setNewAngle = function(index,collisionSide) {
    var currentAngle = balls[index].angle;
    var newAngle = currentAngle;
    switch(collisionSide) {
      case 'top':
        if (currentAngle > 270) {
          newAngle = (360 - currentAngle) + 180;
        } else if (currentAngle < 90) {
          newAngle = 360 - (currentAngle - 0) - 180;
        }
        break;
      case 'right':
        if (currentAngle > 0 && currentAngle < 90) {
          newAngle = (90 - currentAngle) - 90;
        } else if (currentAngle < 180 && currentAngle > 90) {
          newAngle = (currentAngle - 90) + 180;
        }
        break;
      case 'bottom':
        if (currentAngle < 180 && currentAngle < 180) {
          newAngle = 180 + (180 - currentAngle) + 180;
        } else if (currentAngle < 270 && currentAngle > 180) {
          newAngle = 180 - (currentAngle - 180) + 180;
        }
        break;
      case 'left':
        if (currentAngle < 270 && currentAngle > 180) {
          newAngle = 270 + (270 - currentAngle) - 180;
        } else if (currentAngle < 360 && currentAngle > 270) {
          newAngle = 270 - (currentAngle - 270) - 180;
        }
        break;
    }
    // fix bad angles outside of 0˚ - 360˚
    if (newAngle > 360) {
      newAngle = newAngle - 360;
    } else if (newAngle < 0) {
      newAngle = newAngle + 360;
    }
    balls[index].angle =  newAngle;
  };
  
  var moveCalc = function(index) {
    var ball = balls[index];
    var angle = parseInt(ball.angle);
    var oldAngle = angle;
    if (ball.go) {
      var collisionSide = detectPitCollision(index) || detectBallCollision(index);
      if (collisionSide) {
        setNewAngle(index,collisionSide);
        angle = parseInt(ball.angle);
      }
      
      var movedX = 0;
      var movedY = 0;
      if (angle < 90) {
        movedX = Math.sin(angle * (Math.PI / 180)) * step;
      } else if (angle < 180) {
        movedX = Math.cos((angle - 90) * (Math.PI / 180)) * step;
      } else if (angle < 270) {
        movedX = 0 - (Math.sin((angle - 180) * (Math.PI / 180)) * step);
      } else {
        movedX = 0 - (Math.cos((angle - 270) * (Math.PI / 180)) * step);
      }
      movedY = Math.sqrt(Math.pow(parseInt(step),2) -  Math.pow(parseFloat(Math.abs(movedX)),2));
      if (angle < 90 || angle > 270) {
        movedY = 0 - movedY;
      }
      balls[index].pos.x = (parseFloat(ball.pos.x) + parseFloat(movedX)).toFixed(1);
      balls[index].pos.y = (parseFloat(ball.pos.y) + parseFloat(movedY)).toFixed(1);
      balls[index].box = {
        'top':    parseFloat(balls[index].pos.y) - parseFloat(balls[index].r),
        'right':  parseFloat(balls[index].pos.x) + parseFloat(balls[index].r),
        'bottom': parseFloat(balls[index].pos.y) + parseFloat(balls[index].r),
        'left':   parseFloat(balls[index].pos.x) - parseFloat(balls[index].r)
      };
      moveTransform(index);
    }
  };
  
  var moveTransform = function(index) {
    var ball = balls[index];
    if (ball.go) {
      var ballDOM = ball.DOM;
      if (!ballDOM) {
        return;
      }
      //console.log('translate(' + balls[index].pos.x + 'px, ' + balls[index].pos.y + 'px)')
      ballDOM.style.transform = 'translate(' + balls[index].pos.x + 'px, ' + balls[index].pos.y + 'px)';
    }
  };
  
  var ticker = function() {
    var ball = null;
    var tick = function() {
      if (go) {
        for (var index in balls) {
          moveCalc(index);
        }
      }
      window.requestAnimationFrame(function(){
        tick();
      });
    };
    tick();
  };
  
  var killBalls = function() {
    balls = {};
  };
  
  return {
    init: init(),
    killBalls: killBalls,
    addBall: addBall,
    start: start,
    stop: stop
  };
  
}();