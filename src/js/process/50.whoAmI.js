var whoAmI = function() {

  var unknownDevice = function() {
    if ($.ua.os.name === 'Mac OS') {
      return 'Apple Mac';
    } else if ($.ua.os.name === 'Windows') {
      return 'PC';
    } else if ($.ua.os.name === 'Chrome') {
      return 'Chromebook';
    } else {
      return 'Unknown';
    }
  };
  
  var deviceType = $.ua.device.type || 'desktop';
  var browserName = $.ua.browser.name;
  var browserNameNormalize = browserNameTranslate(browserName);
  var browserVersion = parseInt($.ua.browser.version.split('.')[0], 10);
  var browserVersionNormalize = browserVersionTranslate(browserName,browserVersion);
  
  console.log('**** MAX BROWSER VERSIONS: ****');
  console.log(maxBrowserVersion)

  var whoiam = {
    'device' : {
      'category': deviceType,
      'vendor' : $.ua.device.vendor || unknownDevice(),
      'model' : $.ua.device.model
    },
    'platform' : {
      'name' : $.ua.os.name,
      'version' : $.ua.os.version
    },
    'browser' : {
      'name': browserNameNormalize,
      'version': browserVersion,
      'major': browserVersionNormalize,
      'ageBand': browserAgeCalc(browserNameNormalize,browserVersionNormalize,maxBrowserVersion[deviceType][browserNameNormalize]),
      'engine': $.ua.engine.name
    },
    'screen': {},
    'id': false,
    'name': false
  };

  var knownScreenSizes = {
    '320x480' : 'iPhone4',
    '320x568' : 'iPhone5',
    '375x667' : 'iPhone6',
    '414x736' : 'iPhone6+',
    '736x414' : 'iPhone6+ - horizontal',
    '360x640' : 'Most Android mobiles',
    '768x1024' : 'iPad - portrait',
    '1024x768' : 'iPad - landscape',
    '1366x768' : 'Many smaller PC laptops',
  };

  whoiam.screen.width = screen.width;
  whoiam.screen.height = screen.height;
  whoiam.screen.name = false;
  if (knownScreenSizes[whoiam.screen.width + 'x' + whoiam.screen.height]) {
    whoiam.screen.name = knownScreenSizes[whoiam.screen.width + 'x' + whoiam.screen.height];
  }
  whoiam.screenId = whoiam.screen.width + 'x' + whoiam.screen.height;


  console.log('**** WHOAMI: ****');
  console.log(whoiam);
  
  lookmeUp(whoiam);
}


