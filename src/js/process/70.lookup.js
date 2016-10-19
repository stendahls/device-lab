
var slides = [];

var lookmeUp = function(whoiam) {
  
  for (var key in radar) {
    
    var viewId = key;
    var viewNode = lookUpView(viewId);
    
    //console.error(key + ' : ' + whoiam.device.category + ' : ' + whoiam.browser.name);
    
    // sessions
    slides.push({
      'device'  : whoiam.device.category,
      'browser' : whoiam.browser.name,
      'metric'  : 'sessions',
      'view'    : viewNode,
      'total'   : radar[viewId].TOTAL[0],
      'category': radar[viewId][whoiam.device.category].TOTAL[0],
      'value'   : (radar[viewId][whoiam.device.category][whoiam.browser.name] ? radar[viewId][whoiam.device.category][whoiam.browser.name].TOTAL[0] : 0 )
    });
    
    // revenue
    if (radar[viewId][1] > 0) {
      slides.push({
        'device'  : whoiam.device.category,
        'browser' : whoiam.browser.name,
        'metric'  : 'revenue',
        'view'    : viewNode,
        'total'   : radar[viewId].TOTAL[1],
        'category': radar[viewId][whoiam.device.category].TOTAL[1],
        'value'   : (radar[viewId][whoiam.device.category][whoiam.browser.name].TOTAL[1] ? radar[viewId][whoiam.device.category][whoiam.browser.name].TOTAL[1] : 0 )
      });
    }
    
  }
  
  console.log('**** SLIDES: ****');
  console.log(slides);
  
  
  console.log('**** VIEWS: ****');
  display.buildAll();
  
};