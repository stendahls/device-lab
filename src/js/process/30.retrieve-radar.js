var retrieve = function() {
  "use strict";
  
  var configStart = null;
  var configEnd = null;
  var configYr = null;
  var configWk = null;
  var configSuffix = null;
  var configNoStorage = false;
  var localStorageTrue = false;
  var gaRequest = {};

  var init = function() {
    
    // clear everything
    localStorage.clear();
    
    localStorageTrue = testForLocalStorage();
    gaRequest = {
      path: '/v4/reports:batchGet',
      root: 'https://analyticsreporting.googleapis.com/',
      method: 'POST',
      body: {
        reportRequests: gaConfig.reportRequests
      }
    };
    setDateRange();
    // check to see if any local storage is available
    var testAbbr = gaConfig.views[0].abbr;
    var localStorageKey = storageKey(testAbbr);
    if (!localStorageTrue || storageGet(localStorageKey) === null) {
      document.querySelector('[data-js-control-manual]').style.display = 'none';
      if (typeof(gapi) === 'undefined') {
        document.querySelector('[data-js-control-none]').style.display = 'block';
      }
    }
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
    
    configNoStorage = false;
    configSuffix = '';
    
    // week so far (monday 00:00 to right now)
    if (dateVal === 'week') {
        reportStartDate = getMonday(dateNow);
        reportEndDate = dateNow;
        configStart = reportStartDate.toISOString().slice(0,10);
        configEnd = reportEndDate.toISOString().slice(0,10);
        configNoStorage = true;
    // the last 7 days up to right now
    } else if (dateVal === '7days') {
        reportStartDate = new Date(dateNow.setDate(dateNow.getDate() - 7));
        reportEndDate = dateNow;
        configStart = '7daysAgo';
        configEnd = 'today';
        configSuffix = '7d';
        configNoStorage = true;
    // today only up to right now
    } else if (dateVal === 'today') {
        reportStartDate = dateNow;
        reportEndDate = dateNow;
        configStart = 'yesterday';
        configEnd = 'today';
        configSuffix = 'd' + dateNow.toISOString().slice(5,10);
        configNoStorage = true;
    // if we're looking at a full week an amount of months ago
    } else if (dateVal.substring(0,1) === '-') {
        var monthsAgo = parseInt(dateVal.substring(1));
        reportStartDate = new Date(dateNow.setDate(dateNow.getDate() - (30 * monthsAgo) ));
        reportStartDate = getMonday(reportStartDate);
        configStart = reportStartDate.toISOString().slice(0,10);
        reportEndDate = new Date();
        reportEndDate = new Date(reportStartDate.setDate(reportStartDate.getDate() + 7));
        configEnd = reportEndDate.toISOString().slice(0,10);
    // default - the most recent full week of data
    } else {
        reportStartDate = getMonday(dateNow);
        reportStartDate = new Date(reportStartDate.setDate(reportStartDate.getDate() - 7));
        configStart = reportStartDate.toISOString().slice(0,10);
        reportEndDate = getMonday(dateNow);
        configEnd = reportEndDate.toISOString().slice(0,10);
    }
    configYr = reportStartDate.toISOString().slice(0,4) || dateYr;
    configWk = reportStartDate.getWeek() || dateWk;
    gaRequest.body.reportRequests[0].dateRanges = [{
      startDate: configStart,
      endDate: configEnd
    }];
  };


  // Query the API and print the results to the page.
  var queryAllReports = function () {
    display.killAll();
    console.log('**** RUN ALL ****');
    
    setDateRange();
    
    ballpit.start(); 
    
    queryAllReportsLoop().then(function() {
      
      console.log('**** RADAR: ****');
      console.log(radar);
      
      whoAmI();
    });

  };


  // query all the reports sequentially
  var queryAllReportsLoop = function () {
    
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
    
  };
    
  // Query the API and print the results to the page.
  var queryReports = function (reportNode) {

    var localStorageKey = storageKey(reportNode.abbr);
    
    return new Promise(function(resolve, reject) {

      // if in local storage, use that
      if (localStorageTrue && storageGet(localStorageKey) !== null && !configNoStorage) {
        // check the datestamp on the data to make sure it's up to date info (ie, it was collected after the week end)
        if (2 > 1 /* FIX THIS! */) {
          console.log('**** run '  + reportNode.name + ': ' + reportNode.view + ' from local storage ****');
          var response = JSON.parse(storageGet(localStorageKey));
          processData(response,reportNode);
          resolve(true);
          return;
        }
      } else {
        document.querySelector('[data-js-control-manual]').style.display = 'none';
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
    
  };

  var queryResponse = function (response,reportNode) {
    processData(response,reportNode);
    // save the response to local storage
    if (localStorageTrue && !configNoStorage) {
      var localStorageKey = storageKey(reportNode.abbr);
      storageSet(localStorageKey,JSON.stringify(response));
    }
  };
  
  var storageKey = function(abbr) {
    var newKey = abbr + '-y' + configYr + '-w' + configWk + (configSuffix ? '-' + configSuffix : '');
    return newKey;
  };

  return {
    init: init(),
    queryAllReports: queryAllReports
  };
  
}();