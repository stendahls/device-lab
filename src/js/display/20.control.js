var control = function() {

  var init = function() {
    registerEvents();
  };
  
  var registerEvents = function() {
    var controlValues = document.querySelectorAll('[data-js-control-value]');
    for(var i=0; i<controlValues.length; i++) {
      controlValues[i].addEventListener('change',setValue);
    } 
  };
  
  var setValue = function() {
    if (this.checked) {
      display.modeToggle(null,'all');
      display.killAll();
      display.buildAll();
    }
  };
  
  return {
    init: init()
  };
  
}();