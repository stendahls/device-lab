// translate silly browser versions into more usable ones. EG, Safari 537 is actually Safari 6.0
var browserVersionTranslate = function(browserName,dataBrowserMajor) {
  
  // "(not set)" is sometimes used where no info is collected by GA, eg with in-app iOS Safari
  if (dataBrowserMajor === '(not set)') {
    return 0;
  }
  
  var browserConfigNode = null;
  for(var i=0; i<browsersConfig.length; i++) {
    if (browsersConfig[i].gaName === browserName) {
      browserConfigNode = browsersConfig[i];
      break;
    }
  }
  
  if (!browserConfigNode) {
    return dataBrowserMajor;
  }
  
  if (typeof browserConfigNode.translate === 'undefined') {
    // if the major version is massive, it's assumed to be an edge case that could mess up the max value. Kind of discard it as a version "0". Prime example, some older versions of Chrome on iOS report as "Chrome v537".
    if ( parseInt(dataBrowserMajor) > 200 ) {
      return 0;
    } else {
      return dataBrowserMajor;
    }
  } else {
    var translations = browserConfigNode.translate;
    for(i=0; i<translations.length; i++) {
      switch (translations[i].type) {
        case "MoreEqualTo":
          if (parseInt(dataBrowserMajor) >= parseInt(translations[i].src)) {
            return translations[i].version;
          }
      }
    }
    return dataBrowserMajor;
  }
  
};

var browserAgeCalc = function(browserName,dataBrowserMajor,maxBrowserMajor) {
  
  var consideredOld = null;
  var browserConfigNode = null;
  for(var i=0; i<browsersConfig.length; i++) {
    if (browsersConfig[i].gaName === browserName) {
      browserConfigNode = browsersConfig[i];
      break;
    }
  }
  
  if (!browserConfigNode) {
    return false;
  }
  
  if (typeof browserConfigNode.age === 'undefined') {
    return false;
  } else {
    // "major version" browsers can have an optional "age", the number of versions under the max that are considered "not old"
    if (browserConfigNode.type === 'majorVersion' && typeof browserConfigNode.age !== 'undefined') {
      consideredOld = maxBrowserMajor - parseInt(browserConfigNode.age);
      if (dataBrowserMajor <= consideredOld) {
        return 'Old';
      }
    // evergreen browsers can have multiple age levels, eg "Latest", "Medium" & "Old"
    } else if (browserConfigNode.type === 'evergreen') {
      for(i=0; i<browserConfigNode.age.length; i++) {
        ageLowest = maxBrowserMajor - parseInt(browserConfigNode.age[i].last);
        if (dataBrowserMajor >= ageLowest) {
          return browserConfigNode.age[i].name;
        }
      }
      // if no ages match, this version is considered old
      return 'Old';
    }
  }
  return false;
};

// normalize some User agent browser names to be the same as GA browser names.
var browserNameTranslate = function(browserName) {
  
  for(var i=0; i<browsersConfig.length; i++) {
    if (Array.isArray(browsersConfig[i].uaName)) {
      for(var k=0; k<browsersConfig[i].uaName.length; k++) {
        if (browsersConfig[i].uaName[k] === browserName) {
          return browsersConfig[i].gaName;
        }
      }
    } else {
      if (browsersConfig[i].uaName === browserName) {
        return browsersConfig[i].gaName;
      }
    }
  }
  return browserName;
  
};

var lookUpView = function(viewId) {
  
  for(var i=0; i<gaConfig.views.length; i++) {
    if (gaConfig.views[i].abbr === viewId) {
      return gaConfig.views[i];
    }
  }
  
};

// matches polyfill
this.Element && function(ElementPrototype) {
    ElementPrototype.matches = ElementPrototype.matches ||
    ElementPrototype.matchesSelector ||
    ElementPrototype.webkitMatchesSelector ||
    ElementPrototype.msMatchesSelector ||
    function(selector) {
        var node = this, nodes = (node.parentNode || node.document).querySelectorAll(selector), i = -1;
        while (nodes[++i] && nodes[i] != node);
        return !!nodes[i];
    };
}(Element.prototype);

// closest polyfill
this.Element && function(ElementPrototype) {
    ElementPrototype.closest = ElementPrototype.closest ||
    function(selector) {
        var el = this;
        while (el.matches && !el.matches(selector)) el = el.parentNode;
        return el.matches ? el : null;
    };
}(Element.prototype);


Date.prototype.getWeek = function(dowOffset) {
  /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */

  dowOffset = typeof(dowOffset) == 'int' ? dowOffset : 0; //default dowOffset to zero
  var newYear = new Date(this.getFullYear(),0,1);
  var day = newYear.getDay() - dowOffset; //the day of week the year begins on
  day = (day >= 0 ? day : day + 7);
  var daynum = Math.floor((this.getTime() - newYear.getTime() - 
  (this.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;
  var weeknum;
  //if the year starts before the middle of a week
  if(day < 4) {
      weeknum = Math.floor((daynum+day-1)/7) + 1;
      if(weeknum > 52) {
          nYear = new Date(this.getFullYear() + 1,0,1);
          nday = nYear.getDay() - dowOffset;
          nday = nday >= 0 ? nday : nday + 7;
          /*if the next year starts before the middle of
            the week, it is week #1 of that year*/
          weeknum = nday < 4 ? 1 : 53;
      }
  }
  else {
      weeknum = Math.floor((daynum+day-1)/7);
  }
  return weeknum;
};
function getDateOfISOWeek(w, y) {
  var simple = new Date(y, 0, 1 + (w - 1) * 7);
  var dow = simple.getDay();
  var ISOweekStart = simple;
  if (dow <= 4)
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return ISOweekStart;
}
function getMonday(d) {
  d = new Date(d);
  var day = d.getDay();
  var diff = d.getDate() - day + (day === 0 ? -6:1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}


/* stop the document level scrollign and bouncing at the end of scroll (locks the screen solid for iOS) */
(function stopBounce() {

  var xStart, 
      yStart = 0, 
      lockScroll = false; 

  document.addEventListener('touchstart', function(e) {
    if (e.target.closest('.control')) {
      return;
    }
    lockScroll = true;
    xStart = e.touches[0].screenX;
    yStart = e.touches[0].screenY;
  }); 

  document.addEventListener('touchmove', function(e) {
    if (lockScroll) {
      var xMovement = Math.abs(e.touches[0].screenX - xStart);
      var yMovement = Math.abs(e.touches[0].screenY - yStart);
      if((yMovement * 3) > xMovement) {
        e.preventDefault();
      }
    }
  });

  document.addEventListener('touchend', function(e) {
    lockScroll = false;
  });

  document.addEventListener('touchcancel', function(e) {
    lockScroll = false;
  });
  
})();