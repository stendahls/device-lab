var error = function() {
  
  var init = function() {
    registerEvents();
  }
  
  var registerEvents = function() {
  }
  
  var send = function(obj) {
    console.log('xx');
    openCurtain();
  }
  
  return {
    init: init,
    send: send
  }
  
}();