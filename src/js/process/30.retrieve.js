var retrieve = function() {
  "use strict";
  
  var configStart = null;
  var configEnd = null;
  var configYr = null;
  var configWk = null;

  var init = function() {
    setDateRange();
  };

  var setDateRange = function () {
    var dateInput = document.querySelector('[data-js-control-time]');
    var dateOptionSelected = dateInput.options[dateInput.selectedIndex];
    var dateVal = dateOptionSelected.value;
    var dateNow = new Date();
    var dateYr = dateNow.getYear();
    var dateWk = dateNow.getWeek();
    
    var reportStartDate = null;
    var reportEndDate = null;
    
    switch (dateVal) {
      case 'week':
        reportStartDate = getMonday(dateNow);
        reportEndDate = dateNow;
        break;
      case '7days':
        configStart = '7daysAgo';
        configEnd = 'today';
      case 'today':
        configStart = 'yesterday';
        configEnd = 'today';
        break;
      default:
        reportStartDate = getMonday(dateNow);
        reportStartDate = new Date(reportStartDate.setDate(reportStartDate.getDate() - 7));
        reportEndDate = getMonday(dateNow);
        break;
    }
    configStart = reportStartDate.toISOString().slice(0,10);
    configEnd = reportEndDate.toISOString().slice(0,10);
    configYr = reportStartDate.toISOString().slice(0,4) || dateYr;
    configWk = reportStartDate.getWeek() || dateWk;
    console.warn(configStart)
    console.warn(configEnd)
    console.warn(configYr)
    console.warn(configWk)
    gaConfig.reportRequests.dateRanges = [
      {
        startDate: configStart,
        endDate: configEnd
      }
    ];
  };

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
    
    setDateRange();
    
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

    var localStorageKey = reportNode.abbr+ '-y' + configYr + '-w' + configWk;
    
    return new Promise(function(resolve, reject) {

      // if in local storage, use that
      if (localStorageTrue && storageGet(localStorageKey) !== null) {
        // check the datestamp on the data to make sure it's up to date info (ie, it was collected after the week end)
        if (2 > 1 /* FIX THIS! */) {
          console.log('**** run '  + reportNode.name + ': ' + reportNode.view + ' from local storage ****');
          var response = JSON.parse(storageGet(localStorageKey));
          processData(response,reportNode);
          resolve(true);
          return;
        }
      }
      
      // else retrieve via web and store in local storage
      console.log('**** run '  + reportNode.name + ': ' + reportNode.view + ' from online ****');
      gaRequest.body.reportRequests[0].viewId = reportNode.view;
      gapi.client.request(gaRequest).then(
        function(response) {
          queryResponse(response,reportNode);
          resolve(true);
        }, console.error.bind(console));
      
    });
    
  }

  function queryResponse(response,reportNode) {
    processData(response,reportNode);
      
    // save the response to local storage
    if (localStorageTrue) {
      var localStorageKey = reportNode.abbr + '-y' + configYr + '-w' + configWk;
      storageSet(localStorageKey,JSON.stringify(response));
    }
  }

  
  return {
    init: init(),
    queryAllReports: queryAllReports
  };
  
}();