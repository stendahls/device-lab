

document.querySelector('[data-js-control-time]').addEventListener('change',function() {
  queryAllReports();
});

var setDateRange = function () {
  var dateInput = document.querySelector('[data-js-control-time]');
  var dateOptionSelected = dateInput.options[dateInput.selectedIndex];
  var dateVal = dateOptionSelected.value;
  var dateNow = new Date();
  var dateYr = dateNow.getYear();
  var dateWk = dateNow.getWeek();
  
  var configStart = null;
  var configEnd = null;
  
  console.warn(getMonday(dateNow).toISOString().substring(0, 10))
  
  switch (dateVal) {
    case 'week':
      var mon = getMonday(dateNow);
      var monDate = new Date(mon);
      var friDate = monDate.setDate(monDate.getDate() + 7);
      configStart = mon.slice(0,10);
      configEnd = friDate.toISOString().slice(0,10);
      break;
    case '7days':
      configStart = '7daysAgo';
      configEnd = 'today';
    case 'today':
      configStart = 'yesterday';
      configEnd = 'today';
      break;
    default:
      
  }
  console.log('****' + configStart);
  console.log('****' + configEnd);
  gaConfig.reportRequests.dateRanges = [
    {
      startDate: '7daysAgo',
      endDate: 'today'
    }
  ];
}();

var gaRequest = {
  path: '/v4/reports:batchGet',
  root: 'https://analyticsreporting.googleapis.com/',
  method: 'POST',
  body: {
    reportRequests: gaConfig.reportRequests
  }
};

var localStorageTrue = testForLocalStorage();


// Query the API and print the results to the page.
function queryAllReports() {
  display.killAll();
  console.log('**** RUN ALL ****');
  
  ballpit.start(); 
  
  queryAllReportsLoop().then(function() {
    
    console.log('**** RADAR: ****');
    console.log(radar);
    
    whoAmI();
  });

}


// query all the reports sequentially
function queryAllReportsLoop() {
  
  return new Promise(function(resolve, reject) {
    
    var queryAllReportsCycle = function (reportIndex) {
      
      reportIndex = reportIndex || 0;
      var reportNode = gaConfig.views[reportIndex];
      queryReports(reportNode).then(function() {
        
        
        /* CAN'T BUILD A BALL AS SOON AS THE DATA IS HERE - we need to know the maximum amounts before we start resizing */
        // build a ball and drop into the ballpit
        //console.log(reportIndex)
        //display.buildPie(reportIndex);
        //console.log(reportNode.abbr)
        //ballpit.addBall(reportNode.abbr);
        
        // run again?
        reportIndex++;
        if (reportIndex < gaConfig.views.length) {
          queryAllReportsCycle(reportIndex);
        } else {
          resolve(true);
        }
      });
      
    };
    queryAllReportsCycle();
    
  });
  
}
  
// Query the API and print the results to the page.
function queryReports(reportNode) {

  var dateNow = new Date();
  var dateWk = dateNow.getWeek();
  var localStorageKey = reportNode.abbr + '-w' + dateWk;
  
  return new Promise(function(resolve, reject) {

    // if in local storage, use that
    if (localStorageTrue && storageGet(localStorageKey) !== null) {
      console.log('**** run '  + reportNode.name + ': ' + reportNode.view + ' from local storage ****');
      var response = JSON.parse(storageGet(localStorageKey));
      processData(response,reportNode);
      resolve(true);
    // else retrieve via web and store in local storage
    } else {
      console.log('**** run '  + reportNode.name + ': ' + reportNode.view + ' from online ****');
      gaRequest.body.reportRequests[0].viewId = reportNode.view;
      gapi.client.request(gaRequest).then(
        function(response) {
          queryResponse(response,reportNode);
          resolve(true);
        }, console.error.bind(console));
    }
    
  });
  
}

function queryResponse(response,reportNode) {
  processData(response,reportNode);
  
  var dateNow = new Date();
  var dateWk = dateNow.getWeek();
    
  // save the response to local storage
  if (localStorageTrue) {
    var localStorageKey = reportNode.abbr + '-w' + dateWk;
    storageSet(localStorageKey,JSON.stringify(response));
  }
}