var display = function() {
  
  var duration = 1000;
  var increment = 10;
  var fontSize = 54;
  var valueKey = 0;
  var segmentPath = [];
  var devices = ['desktop','mobile','tablet'];
  var colors = {
    'desktop': [
      '#b56969',
      '#F58F8F',
      '#6E4040',
      '#A66161',
      '#6E2A27',
      '#B54641',
      '#F55E58',
      '#9B3C38',
      '#F57F90',
      '#6E3940'
    ],
    'mobile':[
      '#3fb0ac',
      '#56F0EB',
      '#369693',
      '#256966',
      '#1F9BB0',
      '#2AD4F0',
      '#1A8596',
      '#125C69',
      '#38B0AB',
      '#4DF0E9',
      '#216966'
    ],
    'tablet':[
      '#e6cf8b',
      '#FFE59A',
      '#CCB87C',
      '#9F8F60',
      '#E6D074',
      '#FFE79C',
      '#E6D77F',
      '#FFEE8C',
      '#9F9457',
      '#D7C976'
    ]
  };
  var maxAmount = 0;
  var levels = [
    'all',
    'device',
    'browser',
    'age',
    'version'
  ];
  
  var init = function() {
    registerEvents();
    document.querySelector('[data-js-container]').classList.add('mode--all');
  };
  
  var registerEvents = function() {
    // CLICK ON BACKGROUND
    document.querySelector('[data-js-background-click]').addEventListener('click', function(e) {
      back(e);
    });
    // CLICK ON RADAR
    document.querySelector('[data-js-container]').addEventListener('click', function(e){
      if (currentMode() !== 'all') {
        return;
      }
      var target = e.target;
      if (target.matches('[data-js-radar]') || target.closest('[data-js-radar]')) {
        e.stopPropagation();
        modeToggle(target.closest('[data-js-radar]'),'device',false);
      }
    });
    // CLICK ON ARC
    document.querySelector('[data-js-container]').addEventListener('click', function(e){
      if (currentMode() === 'all') {
        return;
      }
      var target = e.target.closest('[data-js-radar-arc-grp]');
      if (target) {
        e.stopPropagation();
        
        var pie = target.closest('[data-js-radar]');
        var viewId = pie.id;
        var arc = target.querySelector('[data-js-arc-thismode]');
        var thisMode = arc.getAttribute('data-js-arc-thismode');
        var nextMode = arc.getAttribute('data-js-arc-nextmode');
        var segment = arc.getAttribute('data-js-arc-segment');
        // end of the line?
        if (nextMode === 'undefined') {
          return;
        }
        // no further data?
        var radarChildren = radarFromPath(viewId,segmentPath); 
        radarChildren = radarChildren[segment];
        var radarChildrenKeys = Object.keys(radarChildren);
        if (!radarChildrenKeys.length || radarChildrenKeys.length === 1) {
          return;
        }
        // remove other active arcs
        if( pie.querySelector('[data-js-radar-g-' + thisMode + '-arcs] .radar__arc__grp--active')) {
            pie.querySelector('[data-js-radar-g-' + thisMode + '-arcs] .radar__arc__grp--active').classList.remove('radar__arc__grp--active');
        }
        target.classList.add('radar__arc__grp--active');
        // run the mode change
        modeToggle(pie,nextMode,segment)
        // then start the build of the next mode
        .then(function() {
          segmentPath.push(segment);
          buildAllArcs(pie.id,nextMode,segmentPath);
        });
      }
    });
  };
  
  var back = function(e) {
    var mode = currentMode();
    if (mode === 'device') {
      modeToggle(null,'all');
    } else if (mode === 'browser') {
      segmentPath.pop();
      modeToggle(null,'device').then(function() {
        killAllArcs(mode);
      });
    } else {
      segmentPath.pop();
      var nextMode = levels[levels.indexOf(mode) - 1] || 'all';
      modeToggle(null,nextMode,segmentPath).then(function() {
        killAllArcs(mode);
      });
    }
  };
  
  var radarFromPath = function(viewId,path) {
    var output = radar[viewId];
    for(var i=0; i<path.length; i++) {
      output = output[path[i]];
    }
    return output;
  };
  
  var buildPie = function(viewIndex) {
    
    var view = gaConfig.views[viewIndex];
    var viewId = view.abbr;
    var totalAmount = radar[viewId].TOTAL[valueKey];
    
    var svgEl = drawSVG(viewId,totalAmount,maxAmount);
    if (svgEl) {
      document.querySelector('[data-js-container]').appendChild(svgEl);
      buildAllArcs(viewId);
      buildPieText(viewIndex);
    }
    
  };
  
  var buildAllArcs = function(viewId,nextMode,path) {
    
    var pathLevel = nextMode || 'device';
    var prevLevel = levels[levels.indexOf(pathLevel)-1];
    var pathChildren = path || [];
    var device = ( pathChildren.length ? pathChildren[0] : null );
    var timeDuration = 500;
    var radarChildren = radarFromPath(viewId,pathChildren); 
    var totalAmount = radarChildren.TOTAL[valueKey];
    var angleAllStart = -90;
    var angleAllArc = 360;
    
    if (path !== undefined && path.length) {
      var triggerArc = document.querySelector('#' + viewId + ' #radar-arc-' + prevLevel + '-' + path[path.length - 1].replace(/ /g,'-'));
      if (triggerArc) {
        angleAllStart = parseFloat(triggerArc.getAttribute('data-js-arc-angle-start'));
        angleAllArc = parseFloat(triggerArc.getAttribute('data-js-arc-angle-arc'));
      }
    }
    
    // SORT
    var radarChildrenSorted = []; 
    var radarChildrenSortedOther = null;
    for(var key in radarChildren) {
      // if there's an "other" slice, reserve it for the end
      if (key === 'OTHER') {
        radarChildrenSortedOther = {
          'key': key,
          'TOTAL': radarChildren[key].TOTAL[valueKey]
        };
        continue;
      } else if (key !== 'TOTAL' && key !== 'MAX' && radarChildren[key].TOTAL[valueKey] > 0) {
        radarChildrenSorted.push({
          'key': key,
          'TOTAL': radarChildren[key].TOTAL[valueKey]
        });
      }
    }
    radarChildrenSorted.sort(function compare(a,b) {
      if (a.TOTAL < b.TOTAL)
        return 1;
      if (a.TOTAL > b.TOTAL)
        return -1;
      return 0;
    });
    // re-attach the "other" slice
    if (radarChildrenSortedOther) {
      radarChildrenSorted.push(radarChildrenSortedOther);
    }
    
    // loop through the sorted data
    var i = 0;
    var buildAllArcsLoop = function(degNew) {
      arc = radarChildrenSorted.shift();
      if(!arc) {
        return;
      }
      var angleArc = ( ( arc.TOTAL/totalAmount ) * angleAllArc );
      // if the angle is too small, continue
      if (angleArc < 1 && radarChildrenSorted.length) {
        buildAllArcsLoop(degNew);
      }
      var config = {
        'viewId'              : viewId,
        'arcThisMode'         : pathLevel,
        'arcNextMode'         : levels[levels.indexOf(pathLevel) + 1],
        'arcSelector'         : arc.key,
        'arcAmount'         : arc.TOTAL,
        'totalAmount'       : totalAmount,
        'angleStart'          : degNew || angleAllStart,
        'angleArc'            : angleArc,
        'timeStart'           : 0,
        'timeDuration'        : Math.round(arc.TOTAL/totalAmount * timeDuration),
        'color'               : ( !device ? colors[arc.key][0] : colors[device][i] ),
        'labelTitle'          : arc.key,
        'labelValTotal'       : arc.TOTAL,
        'labelValTotalPerc'   : radar[viewId].TOTAL,
        'labelValDevicePerc'  : ( device ? radar[viewId][device].TOTAL : null )
      };
      buildArc(config).then(function(val) {
        i++;
        if (radarChildrenSorted.length) {
          buildAllArcsLoop(val);
        }
      });
    };
    buildAllArcsLoop();
    
  };
  
  var buildArc = function(options) {
    
    return new Promise(function(resolve, reject) {
      
      if (options.angleArc < 1) {
        resolve(options.angleStart);
        return;
      }
      
      viewId            = options.viewId;
      level             = options.level;
      arcId             = options.arcId;
      arcThisMode       = options.arcThisMode;
      arcNextMode       = options.arcNextMode;
      arcSelector       = options.arcSelector;
      arcAmount       = options.arcAmount;
      totalAmount     = options.totalAmount;
      timeStart         = options.timeStart;
      timeDuration      = options.timeDuration;
      angleStart        = options.angleStart || 0;
      angleArc          = options.angleArc;
      color             = options.color || 'red';
      
      var config = {
        'viewId': viewId,
        'arcId': arcId,
        'arcThisMode': arcThisMode,
        'arcNextMode': arcNextMode,
        'arcSelector': arc.key,
        'arcSelector': arcSelector,
        'color': color,
        'angleStart': angleStart,
        'angleArc': angleArc,
        'timeStart': 0,
        'timeDuration': timeDuration
      };
      drawSVGArc(config).then(function(angle) {
        resolve(angle);
      });
    });
  };
  
  var buildPieText = function(viewIndex) {
    
    var view = gaConfig.views[viewIndex];
    var viewId = view.abbr;
    
    drawSVGText(viewIndex,'title');
    drawSVGText(viewIndex,'value',radar[viewId].TOTAL[valueKey]);
    
  };
  
  var buildAll = function() {
    
    console.log('build');
    
    // clear ballpit
    ballpit.killBalls();
    
    // start the ballpit animation timer
    ballpit.start(); 
    
    // find the type of value we're looking for
    getValueType();
    
    // find max amount
    calcMaxAmount();
    
    // create the SVG for each view
    for (i=0; i<gaConfig.views.length;i++) {
      buildPie(i);
      ballpit.addBall(gaConfig.views[i].abbr);
    }
    
  };
  
  var getValueType = function() {
    var controlValue = document.querySelector('[data-js-control-value]:checked');
    valueKey = controlValue.value;
  };
  
  var calcMaxAmount = function() {
    maxAmount = 0;
    for (var key in radar) {
      if (key === 'TOTAL') {
        continue;
      }
      if (radar[key].TOTAL[valueKey] > maxAmount) {
        maxAmount = radar[key].TOTAL[valueKey];
      }
    }
  };
  
  var killAll = function() {
    
    var svgs = document.querySelectorAll('[data-js-radar]');
    for (var i=0; i<svgs.length;i++) {
      svgs[i].parentNode.removeChild(svgs[i]);
    }
    
  };
  
  var killAllArcs = function(arcLevel) {
    
    var pie = document.querySelector('.radar--active');
    if (pie) {
      var arcGrps = pie.querySelectorAll('[data-js-radar-arc-grp-' + arcLevel + ']');
      for(var i=0; i<arcGrps.length; i++) {
        arcGrps[i].parentNode.removeChild(arcGrps[i]);
      }
      var arcDefs = pie.querySelectorAll('[data-js-radar-arcdef-' + arcLevel + ']');
      for(i=0; i<arcDefs.length; i++) {
        arcDefs[i].parentNode.removeChild(arcDefs[i]);
      }
    }
    
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
  
  var modeToggleTimer = null;
  var modeToggleClass = function(modeNew) {
    
    return new Promise(function(resolve, reject) {
      
      clearTimeout(modeToggleTimer);
      
      modeToggleTimer = setTimeout(function() {
        for (var i=0; i<levels.length; i++) {
          if (levels[i] === modeNew) {
            document.querySelector('[data-js-container]').classList.add('mode--' + levels[i]);
          } else {
            document.querySelector('[data-js-container]').classList.remove('mode--' + levels[i]);
          }
        }
        resolve(true);
      },50);
    });
    
  };
    
  var modeToggle = function(target,nextMode,segment) {
    
    var oldMode = currentMode();
    
    return new Promise(function(resolve, reject) {
    
      // LEAVING ALL
      if (oldMode === 'all' && nextMode !== 'all') {
        target.classList.add('radar--active');
        ballpit.stop();
        resolve(true);
      // ENTERING ALL
      } else if (nextMode === 'all') {
        var activeRadar = document.querySelector('.radar--active');
        if (activeRadar) {
          activeRadar.classList.remove('radar--active');
          ballpit.start();
        }
        resolve(true);
      // entering and leaving all other modes
      } else {
        var transformingElement = document.querySelector('[data-js-radar-g-' + oldMode + '-arcs]');
        if (transformingElement) {
          var radarTransition = function() {
            resolve(true);
            transformingElement.removeEventListener('transitionend',radarTransition);
          };
          transformingElement.addEventListener('transitionend',radarTransition);
        }
      }
      modeToggleClass(nextMode);
      
    });
    
  };
  
  return {
    init: init(),
    buildPie: buildPie,
    buildAll: buildAll,
    killAll: killAll,
    modeToggle: modeToggle
  };
  
}();