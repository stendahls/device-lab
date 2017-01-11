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
  var dimensions = [
    'ga:deviceCategory',
    'ga:operatingSystem',
    'ga:operatingSystemVersion',
    'ga:mobileDeviceModel',
    'ga:screenResolution'
  ];

  var init = function() {
    localStorageTrue = testForLocalStorage();
    gaRequest = {
      path: '/v4/reports:batchGet',
      root: 'https://analyticsreporting.googleapis.com/',
      method: 'POST',
      body: {
        reportRequests: gaConfig.reportRequests
      }
    };
    
    readDefaults();
    
    registerEvents();
    
    // set the overall amount
    gaRequest.body.reportRequests.push({
      dateRanges: [
        {
          startDate: '7daysAgo',
          endDate: 'today'
        }
      ],
      metrics: [
        {expression: 'ga:sessions'},
        {expression: 'ga:transactionRevenue'}
      ]
    });
    
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
  
  var readDefaults = function() {
    
    console.log('**** readDefaults ****');
    
    var inputs = document.querySelectorAll('[data-js-input]');
    for(var i = 0; i<inputs.length; i++) {
      var input = inputs[i];
      var inputName = input.name;
      var InputValue = storageGet('lab:' + inputName);
      if (InputValue && InputValue.length) {
        input.value = InputValue;
      }
    }
  };
  
  var registerEvents = function() {
    
    console.log('**** registerEvents ****');
    
    var inputSet = function() {
      console.log('SETTTING CHANGED: ' + inputValue);
      var inputName = this.name;
      var inputValue = this.value.trim();
      if (inputValue && inputValue.length) {
        storageSet('lab:' + inputName,inputValue);
      } else {
        storageRemove('lab:' + inputName);
      }
      if (this.getAttribute('data-js-input-runreports')) {
        queryLab();
      }
    };
    
    var inputsText = document.querySelectorAll('input[data-js-input]');
    var inputsSelect = document.querySelectorAll('select[data-js-input]');
    for(var i = 0; i<inputsText.length; i++) {
      var input = inputsText[i];
      input.addEventListener('blur',inputSet);
    }
    for(i = 0; i<inputsSelect.length; i++) {
      var select = inputsSelect[i];
      select.addEventListener('change',inputSet);
    }
  };

  var setDateRange = function () {
    var dateNow = new Date();
    var dateYr = dateNow.getYear();
    var dateWk = dateNow.getWeek();
    
    var reportStartDate = null;
    var reportEndDate = null;
    
    configNoStorage = false;
    configSuffix = '';
    
    reportStartDate = new Date(dateNow.setDate(dateNow.getDate() - 7));
    reportEndDate = dateNow;
    configStart = '7daysAgo';
    configEnd = 'today';
    configSuffix = '7d';
    configNoStorage = true;
        
    configYr = reportStartDate.toISOString().slice(0,4) || dateYr;
    configWk = reportStartDate.getWeek() || dateWk;
    for(var i=0; i<gaRequest.body.reportRequests.length; i++) {
      gaRequest.body.reportRequests[i].dateRanges = [{
        startDate: configStart,
        endDate: configEnd
      }];
    }
  };


  // Query the API and print the results to the page.
  var queryLab = function () {
    //display.killAll();
    console.log('**** RUN ALL ****');
    
    setDateRange(); 
    
    queryLabLoop().then(function() {
      
      console.log('**** RADAR: ****');
      //console.log(radar);
    });

  };


  // query all the reports sequentially
  var queryLabLoop = function () {
    
    return new Promise(function(resolve, reject) {
      
      var queryLabCycle = function (reportIndex) {
        
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
            queryLabCycle(reportIndex);
          } else {
            resolve(true);
          }
        });
        
      };
      queryLabCycle();
      
    });
    
  };
  
  var setFilters = function() {
    
    var outputDimensions = [];
    var outputFilters = [];
    var inputs = document.querySelectorAll('[data-js-input-runreports]');
    for(var i = 0; i<inputs.length; i++) {
      var input = inputs[i];
      var inputName = input.name;
      var inputType = 'EXACT';
      var inputTypeName = '[name="' + inputName.replace('ga','tp') + '"]';
      var inputTypeEl = document.querySelector(inputTypeName);
      if (inputTypeEl) {
        inputType = document.querySelector('[name="' + inputName.replace('ga','tp') + '"]').value || 'EXACT';
      }
      var inputValue = input.value.trim();
      if (inputValue.length) {
        
        outputDimensions.push({'name':inputName});
        outputFilters.push(
          {"filters": 
            [{
              "dimensionName": inputName,
              "operator": inputType,
              "expressions": inputValue.split('|')
            }]
          });
      }
    }
    return {
      'dimensions': outputDimensions,
      'dimensionFilters': outputFilters
    };
  };
    
  // Query the API and print the results to the page.
  var queryReports = function (reportNode) {

    var localStorageKey = storageKey(reportNode.abbr);
    
    return new Promise(function(resolve, reject) {
      
      // if in local storage, use that
      //if (localStorageTrue && storageGet(localStorageKey) !== null && !configNoStorage) {
      //  // check the datestamp on the data to make sure it's up to date info (ie, it was collected after the week end)
      //  if (2 > 1 /* FIX THIS! */) {
      //    console.log('**** run '  + reportNode.name + ': ' + reportNode.view + ' from local storage ****');
      //    var response = JSON.parse(storageGet(localStorageKey));
      //    processData(response,reportNode);
      //    resolve(true);
      //    return;
      //  }
      //} else {
      //  document.querySelector('[data-js-control-manual]').style.display = 'none';
      //}
      
      // else retrieve via web and store in local storage
      
      console.log('**** run '  + reportNode.name + ': ' + reportNode.view + ' from online ****');
      
      // set filters:
      var filters = setFilters();
      gaRequest.body.reportRequests[0].dimensions = filters.dimensions;
      gaRequest.body.reportRequests[0].dimensionFilterClauses = filters.dimensionFilters;
      
      for(var i=0; i<gaRequest.body.reportRequests.length; i++) {
        gaRequest.body.reportRequests[i].viewId = reportNode.view;
      }
      console.warn(gaRequest);
      gapi.client.request(gaRequest).then(
        
        function(response) {
          
          queryResponse(response,reportNode);
          resolve(true);
        }, console.error.bind(console));
      
    });
    
  };

  var queryResponse = function (response,reportNode) {
    
    var resultTitle = document.querySelector('[data-js-result-title]');
    var resultUA    = document.querySelector('[data-js-result-ua]');
    var resultPerc  = document.querySelector('[data-js-result-percentage]');
    var resultAct   = document.querySelector('[data-js-result-actual]');
    resultTitle.innerText = '';
    resultUA.innerText = '';
    resultPerc.innerText = '';
    resultAct.innerText = '';
    
    if (typeof response.result.reports === 'undefined' || typeof response.result.reports[0].data.rows === 'undefined') {
      resultTitle.innerText = 'error. no results?';
      return;
    }
    
    var segment     = response.result.reports[0].data.rows[0].metrics[0].values[0];
    var total       = response.result.reports[1].data.rows[0].metrics[0].values[0];
    var percOfTotal = (segment/total)* 100;
    if (percOfTotal > 9) {
      percOfTotal   = Math.round(percOfTotal);
    } else {
      percOfTotal   = percOfTotal.toFixed(1);
    }
    resultTitle.innerText = document.querySelector('[name="title"]').value;
    resultUA.innerText = window.navigator.userAgent;
    resultPerc.innerText = percOfTotal + '%';
    resultAct.innerText = segment + '/' + total;
      
    //processData(response,reportNode);
    //// save the response to local storage
    //if (localStorageTrue && !configNoStorage) {
    //  var localStorageKey = storageKey(reportNode.abbr);
    //  storageSet(localStorageKey,JSON.stringify(response));
    //}
  };
  
  var storageKey = function(abbr) {
    var newKey = abbr + '-y' + configYr + '-w' + configWk + (configSuffix ? '-' + configSuffix : '');
    return newKey;
  };

  return {
    init: init(),
    queryLab: queryLab
  };
  
}();