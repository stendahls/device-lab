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

Math.easeInOutQuad = function (t, b, c, d) {
  t /= d/2;
  if (t < 1) {
    return c/2*t*t + b;
  }
  t--;
  return -c/2 * (t*(t-2) - 1) + b;
};

Math.easeInCubic = function(t, b, c, d) {
  var tc = (t/=d)*t*t;
  return b+c*(tc);
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


Date.prototype.getWeek = function() {
  var onejan = new Date(this.getFullYear(), 0, 1);
  return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
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