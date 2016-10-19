var drawSVG = function (viewId,totalAmount,maxAmount,config) {
  
  if (totalAmount < 1) {
    return;
  }
  
  var svgNS             = 'http://www.w3.org/2000/svg';
  var strokeWidthActive = viewConfig.strokeWidthActive;
  var svgSize           = viewConfig.svgSize;
  var minSize           = viewConfig.minSize;
  var radius            = viewConfig.radius;
  var radiusWithStroke  = radius - strokeWidthActive/2;
  var size = ( (0.99 * Math.sqrt(totalAmount))/Math.sqrt(maxAmount)).toFixed(3); // 0.99x so that we always detect a transitionend as we transform to 1x
  if (size < minSize) {
    size = minSize;
  }
  
  
  var svg = document.createElementNS(svgNS, 'svg');
  svg.id = viewId;
  svg.classList.add('radar');
  svg.setAttribute('xmlns',svgNS);
  svg.setAttribute('data-js-radar','');
  svg.setAttribute('data-js-radar-size',size);
  svg.setAttribute('viewBox','0 0 ' + svgSize + ' ' + svgSize);
  svg.setAttribute('width',svgSize);
  svg.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');
  
  var defs = document.createElementNS(svgNS, 'defs');
  defs.setAttributeNS(null,'data-js-radar-defs','');
  svg.appendChild(defs);
  
  // create the device group
  
  var grpDevicesArcs = document.createElementNS(svgNS, 'g');
  grpDevicesArcs.setAttributeNS(null,'data-js-radar-g-device-arcs','');
  grpDevicesArcs.setAttributeNS(null,'style','transform: scale(' + size + ');transform-origin: ' + radius + 'px ' + radius + 'px 0px;');
  grpDevicesArcs.classList.add('radar__grp__arcs');
  
  var grpDevicesCircle = document.createElementNS(svgNS, 'circle');
  grpDevicesCircle.setAttributeNS(null,'cx',radius);
  grpDevicesCircle.setAttributeNS(null,'cy',radius);
  grpDevicesCircle.setAttributeNS(null,'r',radiusWithStroke);
  grpDevicesCircle.classList.add('radar__grp__circle');
  
  var grpDevices = document.createElementNS(svgNS, 'g');
  grpDevices.setAttributeNS(null,'data-js-radar-g-device','');
  grpDevices.classList.add('radar__grp');
  grpDevices.classList.add('radar__grp--device');
  
  grpDevicesArcs.appendChild(grpDevicesCircle);
  grpDevices.appendChild(grpDevicesArcs);
  svg.appendChild(grpDevices);
  
  // create the browsers group
  
  var grpBrowsersArcs = document.createElementNS(svgNS, 'g');
  grpBrowsersArcs.setAttributeNS(null,'data-js-radar-g-browser-arcs','');
  grpBrowsersArcs.setAttributeNS(null,'style','transform: scale(' + size + ');transform-origin: ' + radius + 'px ' + radius + 'px 0px;');
  grpBrowsersArcs.classList.add('radar__grp__arcs');
  
  var grpBrowsersCircle = document.createElementNS(svgNS, 'circle');
  grpBrowsersCircle.setAttributeNS(null,'cx',radius);
  grpBrowsersCircle.setAttributeNS(null,'cy',radius);
  grpBrowsersCircle.setAttributeNS(null,'r',radiusWithStroke);
  grpBrowsersCircle.classList.add('radar__grp__circle');
  
  var grpBrowsers = document.createElementNS(svgNS, 'g');
  grpBrowsers.setAttributeNS(null,'data-js-radar-g-browser','');
  grpBrowsers.classList.add('radar__grp');
  grpBrowsers.classList.add('radar__grp--browser');
  
  grpBrowsersArcs.appendChild(grpBrowsersCircle);
  grpBrowsers.appendChild(grpBrowsersArcs);
  svg.appendChild(grpBrowsers);
  
  // create the age group
  
  var grpAgesArcs = document.createElementNS(svgNS, 'g');
  grpAgesArcs.setAttributeNS(null,'data-js-radar-g-age-arcs','');
  grpAgesArcs.setAttributeNS(null,'style','transform: scale(' + size + ');transform-origin: ' + radius + 'px ' + radius + 'px 0px;');
  grpAgesArcs.classList.add('radar__grp__arcs');
  
  var grpAgesCircle = document.createElementNS(svgNS, 'circle');
  grpAgesCircle.setAttributeNS(null,'cx',radius);
  grpAgesCircle.setAttributeNS(null,'cy',radius);
  grpAgesCircle.setAttributeNS(null,'r',radiusWithStroke);
  grpAgesCircle.classList.add('radar__grp__circle');
  
  var grpAges = document.createElementNS(svgNS, 'g');
  grpAges.setAttributeNS(null,'data-js-radar-g-age','');
  grpAges.classList.add('radar__grp');
  grpAges.classList.add('radar__grp--age');
  
  grpAgesArcs.appendChild(grpAgesCircle);
  grpAges.appendChild(grpAgesArcs);
  svg.appendChild(grpAges);
  
  // create the versions group
  
  var grpVersionsArcs = document.createElementNS(svgNS, 'g');
  grpVersionsArcs.setAttributeNS(null,'data-js-radar-g-version-arcs','');
  grpVersionsArcs.setAttributeNS(null,'style','transform: scale(' + size + ');transform-origin: ' + radius + 'px ' + radius + 'px 0px;');
  grpVersionsArcs.classList.add('radar__grp__arcs');
  
  var grpVersionsCircle = document.createElementNS(svgNS, 'circle');
  grpVersionsCircle.setAttributeNS(null,'cx',radius);
  grpVersionsCircle.setAttributeNS(null,'cy',radius);
  grpVersionsCircle.setAttributeNS(null,'r',radiusWithStroke);
  grpVersionsCircle.classList.add('radar__grp__circle');
  
  var grpVersions = document.createElementNS(svgNS, 'g');
  grpVersions.setAttributeNS(null,'data-js-radar-g-version','');
  grpVersions.classList.add('radar__grp');
  grpVersions.classList.add('radar__grp--version');
  
  grpVersionsArcs.appendChild(grpVersionsCircle);
  grpVersions.appendChild(grpVersionsArcs);
  svg.appendChild(grpVersions);
  
  return svg;
  
};

var drawSVGArc = function (config) {
  
  return new Promise(function(resolve, reject) {
    
    var svgNS             = 'http://www.w3.org/2000/svg';
    var viewId            = config.viewId;
    var arcThisMode       = config.arcThisMode;
    var arcNextMode       = config.arcNextMode;
    var arcSelector       = config.arcSelector;
    
    var timeStart         = 0;
    var timeCurrent       = timeStart;
    var timeIncrement     = config.timeIncrement || 10;
    var timeDuration      = config.timeDuration || 500;
    
    var pie               = document.getElementById(viewId);
    var scaled            = pie.querySelector('[data-js-radar-g-' + arcThisMode + '-arcs]');
    var defs              = pie.querySelector('[data-js-radar-defs]');
    var color             = config.color || 'white';
    var strokeWidth       = viewConfig.strokeWidth;
    var strokeWidthActive = viewConfig.strokeWidthActive;
    var angleStart        = config.angleStart || 0;
    var angleArc          = config.angleArc || 360;
    var angleStep         = config.angleStep || 10;
    var angle             = angleStart;
    var radius            = viewConfig.radius;
    var radiusWithStroke  = radius - strokeWidthActive/2;
    
    var labelSize         = viewConfig.labelFontSize;
    var labelTitle        = config.labelTitle || arcSelector;
    var labelValTotal     = config.labelValTotal || null;
    var labelValTotalPerc = config.labelValTotalPerc || null;
    var labelValDevicePerc= config.labelValDevicePerc || null;
    
    
    var arcGrp = document.createElementNS(svgNS, 'g');
    arcGrp.setAttributeNS(null,'data-js-radar-arc-grp','');
    arcGrp.setAttributeNS(null,'data-js-radar-arc-grp-' + arcThisMode,'');
    arcGrp.classList.add('radar__arc__grp');
    
    // create the path
    var arc = document.createElementNS(svgNS, 'path');
    arc.setAttributeNS(null,'fill','none');
    arc.setAttributeNS(null,'data-js-arc-thismode' , arcThisMode);
    arc.setAttributeNS(null,'data-js-arc-nextmode' , arcNextMode);
    arc.setAttributeNS(null,'data-js-arc-segment' , arcSelector);
    arc.setAttributeNS(null,'data-js-arc-angle-start' , angleStart);
    arc.setAttributeNS(null,'data-js-arc-angle-arc' , angleArc);
    arc.setAttributeNS(null,'d','');
    arc.setAttributeNS(null,'stroke',color);
    arc.setAttributeNS(null,'stroke-width',strokeWidth);
    arc.classList.add('radar__arc');
    arc.id = 'radar-arc-' + arcThisMode + '-' + arcSelector.replace(/ /g,'-');
    arcGrp.appendChild(arc);
    
    // create a path for the text in defs
    var radians = (angleStart/180) * Math.PI;
    var radiusWithText = radiusWithStroke - labelSize/2.5;
    var xStart = radius + Math.cos(radians) * radiusWithText;
    var yStart = radius + Math.sin(radians) * radiusWithText;
    var xEnd = radius + Math.cos(radians - 0.02) * radiusWithText;
    var yEnd = radius + Math.sin(radians - 0.02) * radiusWithText;
    var arcDef = document.createElementNS(svgNS, 'path');
    arcDef.setAttributeNS(null,'data-js-radar-arcdef-' + arcThisMode,'');
    arcDef.id = 'radar-' + viewId + '-arcdef-' + arcThisMode + '-' + arcSelector.replace(/ /g,'-');
    arcDef.setAttribute("d", "M " + xStart.toFixed(3) + labelSize + " " + yStart.toFixed(3) + " A " + radiusWithText + " " + radiusWithText + " " + angleStart + " 1 1 "+ xEnd.toFixed(3) + " " + yEnd.toFixed(3));
    defs.appendChild(arcDef);
    
    // create the text
    var label = document.createElementNS(svgNS, 'text');
    label.setAttributeNS(null,"x",1);     
    label.setAttributeNS(null,"y",0); 
    label.setAttributeNS(null,"font-size",labelSize);
    label.classList.add('radar__arc__txt');
    var labelPath = document.createElementNS(svgNS, 'textPath');
    labelPath.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href','#' + arcDef.id);  
    var textNode = document.createTextNode(labelTitle.toUpperCase());
    labelPath.appendChild(textNode);
    label.appendChild(labelPath);
    arcGrp.appendChild(label);
    
    if (arcThisMode==='device' && scaled.firstChild.nextSibling) {
      scaled.insertBefore(arcGrp, scaled.firstChild.nextSibling);
    } else {
      scaled.appendChild(arcGrp);
    }
    
    
    // draw one frame of the arc
    var i = 0;
    var drawArcFrame = function () {
      var radians = null;
      var x = null;
      var y = null;
      var d = null;
      var e = arc.getAttribute("d");
      // on first beat, we just move to the correct position
      if (i === 0) {
        radians = (angleStart/180) * Math.PI;
        x = radius + Math.cos(radians) * radiusWithStroke;
        y = radius + Math.sin(radians) * radiusWithStroke;
        d = e + "\n M " + x.toFixed(3) + " " + y.toFixed(3);
      // if we've finished the entire arc, exit
      } else if (angle >= (angleStart + angleArc) && i !== 0) {
        resolve(angle);
        return;
      // draw a frame of the arc
      } else {
        timeCurrent += timeIncrement;
        // if the final position is not a multiple of the angleStep
        if (angle + angleStep > angleStart + angleArc) {
          angle = angleStart + angleArc;  
        // add angleStep
        } else {
          //angle = Math.easeInCubic(timeCurrent, angleStart, angleStart + angleArc, timeDuration);
          angle += angleStep;
        }
        // calc final stroke position
        radians= (angle/180) * Math.PI;
        x = radius + Math.cos(radians) * radiusWithStroke;
        y = radius + Math.sin(radians) * radiusWithStroke;
        // decide between straight line and arc
        d = e + "\n A " + radius + " " + radius + " 0 0 1 "+ x.toFixed(3) + " " + y.toFixed(3); // arc
      } 
      // draw it
      arc.setAttribute("d", d);
      i++;
      window.requestAnimationFrame(function(){
        drawArcFrame();
      });
    };
    // convert to requestAnimationFrame soon:
    drawArcFrame();
  });
};

var drawSVGText = function (viewIndex,type,value) {
  
  var svgNS     = 'http://www.w3.org/2000/svg';
  var view      = gaConfig.views[viewIndex];
  var viewId    = view.abbr;
  var radius    = viewConfig.radius;
  var pie       = document.getElementById(viewId);
  var grp       = pie.querySelector('[data-js-radar-g-device]');
  
  // switch
  var x = 0;
  var y = 0;
  var align = 'middle';
  var cssClass = '';
  var dataType = '';
  var text = '';
  switch (type) {
    case 'title':
      x = radius;
      y = radius;
      text = view.name;
      break;
    case 'value':
      x = radius;
      y = radius + 25;
      text = value.toLocaleString(viewConfig.locale);
      break;
  }
  
  // create the path to the arc
  var txtBox = document.createElementNS(svgNS, 'text');
  txtBox.setAttributeNS(null,'x',x);
  txtBox.setAttributeNS(null,'y',y);
  txtBox.setAttributeNS(null,'text-anchor',align);
  txtBox.setAttributeNS(null,'data-js-radar-txt-' + type,'');
  txtBox.classList.add('radar__txt__' + type);
  txtBox.textContent = text;
  grp.appendChild(txtBox);
  
};