
var columns       = [];
var data          = [];
var radar         = {};

var processData = function(response,reportNode) {

  var viewName = reportNode.abbr;
  columns = response.result.reports[0].columnHeader;
  data    = response.result.reports[0].data;
  radar[viewName] = {};
  
  radar = processDataBrowserAll(radar, reportNode);
  
  return radar;
  
};