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
  var flkty = {};
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
      if (this.hasAttribute('data-js-input-runreports')) {
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

  var killAll = function() {
    return new Promise(function(resolve, reject) {
      
      console.log('KILLALL');
      var results = document.querySelector('[data-js-results]');
      results.classList.remove('flickity-enabled');
      results.classList.remove('is-draggable');
      if (typeof flkty.destroy === 'undefined') {
        resolve(true);
        return;
      }
      flkty.destroy();
      results.innerHTML = '';
      
      resolve(true);
    });
  };


  // Query the API and print the results to the page.
  var queryLab = function () {
    
    killAll().then(function() {
      
      console.log('**** RUN ALL ****');
      
      setDateRange(); 
      
      queryLabLoop().then(function() {
        
        console.log('**** COMPLETE: ****');
        
        flkty = new Flickity( '.main-carousel', {
          prevNextButtons: false
        });
      });
      
    });

  };


  // query all the reports sequentially
  var queryLabLoop = function () {
    
    return new Promise(function(resolve, reject) {
      
      var queryLabCycle = function (reportIndex) {
        
        reportIndex = reportIndex || 0;
        var reportNode = gaConfig.views[reportIndex];
        queryReports(reportNode).then(function() {
          
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
    var inputs = document.querySelectorAll('[data-js-input-postarg]');
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
        
        var expressions = inputValue.split('|');
        if (inputType === 'REGEXP') {
          expressions = [inputValue];
        }
        
        outputDimensions.push({'name':inputName});
        outputFilters.push(
          {"filters": 
            [{
              "dimensionName": inputName,
              "operator": inputType,
              "expressions": expressions
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
          
          console.log(response);
          
          var toDisplay = queryResponse(response,reportNode);
          display(toDisplay);
          resolve(true);
          
        }, console.error.bind(console));
      
    });
    
  };

  var queryResponse = function (response,reportNode) {
    
    var output = {};
    output.color = reportNode.colors['2'];
    output.titleClient = reportNode.name;
    output.titleDevice = document.querySelector('[name="title"]').value;
    output.ua = window.navigator.userAgent;
    
    if (typeof response.result.reports === 'undefined') {
      output.hero = '&#10071;';
    } else if (typeof response.result.reports[0].data.totals === 'undefined' || response.result.reports[0].data.totals[0].values[0] === '0') {
      output.figures = '0/' + response.result.reports[1].data.totals[0].values[0];
      output.hero = '--';
    } else {
      var segment     = parseInt(response.result.reports[0].data.totals[0].values[0]);
      var total       = parseInt(response.result.reports[1].data.totals[0].values[0]);
      var percOfTotal = (segment/total)* 100;
      if (percOfTotal > 9) {
        percOfTotal   = Math.round(percOfTotal);
      } else {
        percOfTotal   = percOfTotal.toFixed(1);
      }
      output.hero = percOfTotal + '%';
      output.figures = segment + '/' + total;
    }
      
    return output;
  };
  
  var display = function(input) {
    
    var slideTitleDevice = document.querySelector('.result__device');
    slideTitleDevice.innerText = input.titleDevice;
    var slideSubUA = document.querySelector('.result__device__ua');
    slideSubUA.innerText = input.ua;
    
    var slideOuter = document.createElement('div');
    slideOuter.classList.add('result');
    slideOuter.classList.add('carousel-cell');
    slideOuter.style.color = input.color;
    var slideTitleClient = document.createElement('span');
    slideTitleClient.classList.add('result__client');
    slideTitleClient.innerText = input.titleClient;
    var slideSubFigures = document.createElement('p');
    slideSubFigures.classList.add('result__figures');
    slideSubFigures.innerText = input.figures;
    var slideTotal = document.createElement('p');
    slideTotal.classList.add('result__total');
    slideTotal.innerHTML = input.hero;
    
    slideOuter.appendChild(slideTitleClient);
    slideOuter.appendChild(slideSubFigures);
    slideOuter.appendChild(slideTotal);
    document.querySelector('[data-js-results]').appendChild(slideOuter);
    
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