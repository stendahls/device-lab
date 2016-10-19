var maxBrowserVersion = {};

var processDataBrowserAll = function(radar, viewConfigNode) {
  var knownBrowsers = [];
  for(var i=0; i<browsersConfig.length; i++) {
    radar = processDataBrowserSingle(radar, browsersConfig[i],viewConfigNode);
    knownBrowsers.push(browsersConfig[i].gaName);
  }
  radar = processDataBrowserOthers(radar, knownBrowsers,viewConfigNode);
  return radar;
};

// process all data looking for one browser type (eg Chrome), specified in the config node. the viewConfigNode is the config info about this view we're currently in (eg 777555 - Tingstad.se)
var processDataBrowserSingle = function(radar, browserConfigNode,viewConfigNode) {
  
  var viewName            = viewConfigNode.abbr;
  var gaBrowserName       = browserConfigNode.gaName;
  //console.log('processing ' + gaBrowserName);
  var dataLength          = data.rows.length;
  var dataDeviceType      = null;
  var dataBrowser         = null;
  var dataBrowserVersion  = null;
  var dataSessions        = null;
  var dataRevenue         = null;
  for(var i=0; i<dataLength; i++) {
    
    dataBrowser           = data.rows[i].dimensions[1];
    
    // if the browser in this row of data matches what the config says is the ga name for the browser we're lookign for
    if (dataBrowser === gaBrowserName) {
      
      dataDeviceType        = data.rows[i].dimensions[0];
      dataBrowserVersion    = data.rows[i].dimensions[2];
      dataBrowserMajor      = dataBrowserVersion.split('.')[0];
      dataBrowserMajor2     = browserVersionTranslate(gaBrowserName,dataBrowserMajor); // do some normalisation on bad browser versions
      dataValue1            = data.rows[i].metrics[0].values[0];
      dataValue2            = data.rows[i].metrics[0].values[1];
      dataValue1a           = (dataValue1.toLowerCase().indexOf('e') > 1 ? Math.round(Number(dataValue1)) : parseInt(dataValue1) ); // deal with string->number, scientific notation
      dataValue2a           = parseFloat((dataValue2.toLowerCase().indexOf('e') > 1 ? Number(dataValue2) : parseFloat(dataValue2) ).toFixed(2)); // deal with string->number, scientific notation and decimals
      
      // create new nodes as required
      if (typeof radar[viewName][dataDeviceType] === 'undefined') {
        radar[viewName][dataDeviceType] = {};
      }
      if (typeof radar[viewName][dataDeviceType][gaBrowserName] === 'undefined') {
        radar[viewName][dataDeviceType][gaBrowserName] = {};
      }
      if (typeof radar[viewName][dataDeviceType][gaBrowserName][dataBrowserMajor2] === 'undefined') {
        radar[viewName][dataDeviceType][gaBrowserName][dataBrowserMajor2] = {'TOTAL':[0,0]};
      }
      radar[viewName][dataDeviceType][gaBrowserName][dataBrowserMajor2].TOTAL[0] += dataValue1a;
      radar[viewName][dataDeviceType][gaBrowserName][dataBrowserMajor2].TOTAL[1] += dataValue2a;
      
      // TOTAL for overall
      if (typeof radar[viewName].TOTAL === 'undefined') {
        radar[viewName].TOTAL = [0,0];
      }
      radar[viewName].TOTAL[0] += dataValue1a;
      radar[viewName].TOTAL[1] += dataValue2a;
    
      // TOTAL for device type 
      if (typeof radar[viewName][dataDeviceType].TOTAL === 'undefined') {
        radar[viewName][dataDeviceType].TOTAL = [0,0];
      }
      radar[viewName][dataDeviceType].TOTAL[0] += dataValue1a;
      radar[viewName][dataDeviceType].TOTAL[1] += dataValue2a;
    
      // TOTALS for this browser type
      if (typeof radar[viewName][dataDeviceType][gaBrowserName].TOTAL === 'undefined') {
        radar[viewName][dataDeviceType][gaBrowserName].TOTAL = [0,0];
      }
      radar[viewName][dataDeviceType][gaBrowserName].TOTAL[0] += dataValue1a;
      radar[viewName][dataDeviceType][gaBrowserName].TOTAL[1] += dataValue2a;
    
      // MAX browser version (eg "54" If Chrome 54 is the latest version found)
      if (typeof radar[viewName][dataDeviceType][gaBrowserName].MAX === 'undefined') {
        radar[viewName][dataDeviceType][gaBrowserName].MAX = 0;
      }
      if (radar[viewName][dataDeviceType][gaBrowserName].MAX < parseInt(dataBrowserMajor2)) {
          radar[viewName][dataDeviceType][gaBrowserName].MAX = parseInt(dataBrowserMajor2);
      }
      
    }
  }
  
  // now we've run through all the data and found everything related to this browser, we can do some other operations on the data we've collected about this browser.
  
  // run through the radar to record the GLOBAL max versions of this browser (to use in the whoami calculations, eg what age-band is the browser you're currently using?)
  for (var loopDeviceType in radar[viewName]) {
    // create new nodes as required
    if (typeof maxBrowserVersion[loopDeviceType] === 'undefined') {
      maxBrowserVersion[loopDeviceType] = {};
    }
    if (typeof maxBrowserVersion[loopDeviceType][gaBrowserName] === 'undefined') {
      maxBrowserVersion[loopDeviceType][gaBrowserName] = 0;
    }
    // update the max if it's bigger than what we currently know of
    if (
      radar[viewName][loopDeviceType][gaBrowserName] && 
      radar[viewName][loopDeviceType][gaBrowserName].MAX && parseInt(radar[viewName][loopDeviceType][gaBrowserName].MAX) > parseInt(maxBrowserVersion[loopDeviceType][gaBrowserName])
    ) {
      maxBrowserVersion[loopDeviceType][gaBrowserName] = parseInt(radar[viewName][loopDeviceType][gaBrowserName].MAX);
    }
  }
  
  // run through the radar to determine the age-band of each browser and segment them into a temporary object ageBandTemp
  var ageBandTemp = {};
  // loop the list of devices
  for (loopDeviceType in radar[viewName]) {
    // if this browser is part of this device group
    if (typeof radar[viewName][loopDeviceType][gaBrowserName] !== 'undefined') {
      var browserVersions = radar[viewName][loopDeviceType][gaBrowserName];
      // loop through all versions found of this browser
      for (var loopBrowserVersion in browserVersions) {
        if (!Number.isInteger(parseInt(loopBrowserVersion))) {
          continue;
        } 
        var ageBand = browserAgeCalc(gaBrowserName,loopBrowserVersion,browserVersions.MAX);
        // if the ageband isn't false (eg "Old", "Latest", etc), move it to a new category
        if (ageBand) {
          // create new nodes as required
          if (typeof ageBandTemp[loopDeviceType] === 'undefined') {
            ageBandTemp[loopDeviceType] = [];
          }
          if (typeof ageBandTemp[loopDeviceType][gaBrowserName] === 'undefined') {
            ageBandTemp[loopDeviceType][gaBrowserName] = [];
          }
          if (typeof ageBandTemp[loopDeviceType][gaBrowserName][ageBand] === 'undefined') {
            ageBandTemp[loopDeviceType][gaBrowserName][ageBand] = {
              'TOTAL':[0,0]
            };
          }
          // add total
          ageBandTemp[loopDeviceType][gaBrowserName][ageBand].TOTAL[0] += browserVersions[loopBrowserVersion].TOTAL[0];
          ageBandTemp[loopDeviceType][gaBrowserName][ageBand].TOTAL[1] += browserVersions[loopBrowserVersion].TOTAL[1];
          // copy the (now segmented) browser version into a seperate area
          ageBandTemp[loopDeviceType][gaBrowserName][ageBand][loopBrowserVersion] = browserVersions[loopBrowserVersion];
          // delete the original row, as it's now been segmented into an age-band, totalled up and moved.
          delete(browserVersions[loopBrowserVersion]);
        }
        //console.log('++ ' + loopDeviceType + ' ' + gaBrowserName + ' ' + loopBrowserVersion + '/' + maxBrowserMajor + ' (' + ageBand + ')')
      }
    }
  }
  // now we've go all the new ag-bands in a temporary object, enter them back into the radar
  for(loopDeviceType in ageBandTemp) {
    if (typeof ageBandTemp[loopDeviceType][gaBrowserName] !== 'undefined') {
      for(var loopAgeBand in ageBandTemp[loopDeviceType][gaBrowserName]) {
        radar[viewName][loopDeviceType][gaBrowserName][loopAgeBand] = ageBandTemp[loopDeviceType][gaBrowserName][loopAgeBand];
      }
    }
  }
  
  return radar;
  
};

// once we have processed data for all browsers, look for any other browsers (eg YA, coc coc, Opera Mini)
var processDataBrowserOthers = function(radar, knownBrowsers,viewConfigNode) {
  
  //console.log('processing unknown browsers');
  
  var viewName            = viewConfigNode.abbr;
  var dataLength          = data.rows.length;
  var dataDeviceType      = null;
  var dataBrowser         = null;
  var dataBrowserVersion  = null;
  var dataSessions        = null;
  var dataRevenue         = null;
  for(var i=0; i<dataLength; i++) {
    dataDeviceType        = data.rows[i].dimensions[0];
    dataBrowser           = data.rows[i].dimensions[1];
    dataBrowserVersion    = data.rows[i].dimensions[2];
    dataBrowserMajor      = dataBrowserVersion.split('.')[0];
    dataValue1            = data.rows[i].metrics[0].values[0];
    dataValue2            = data.rows[i].metrics[0].values[1];
    dataValue1a           = (dataValue1.toLowerCase().indexOf('e') > 1 ? Math.round(Number(dataValue1)) : parseInt(dataValue1) );
    dataValue2a           = (dataValue2.toLowerCase().indexOf('e') > 1 ? Number(dataValue2) : parseFloat(dataValue2) );
    if (knownBrowsers.indexOf(dataBrowser) < 0) {
      
      // create new nodes as required
      if (typeof radar[viewName][dataDeviceType] === 'undefined') {
        radar[viewName][dataDeviceType] = {};
      }
      if (typeof radar[viewName][dataDeviceType].OTHER === 'undefined') {
        radar[viewName][dataDeviceType].OTHER = {};
      }
      if (typeof radar[viewName][dataDeviceType].OTHER[dataBrowser] === 'undefined') {
        radar[viewName][dataDeviceType].OTHER[dataBrowser] = {'TOTAL':[0,0]};
      }
      radar[viewName][dataDeviceType].OTHER[dataBrowser].TOTAL[0] += dataValue1a;
      radar[viewName][dataDeviceType].OTHER[dataBrowser].TOTAL[1] += dataValue2a;
      
      // TOTAL for overall
      if (typeof radar[viewName].TOTAL === 'undefined') {
        radar[viewName].TOTAL = [0,0];
      }
      radar[viewName].TOTAL[0] += dataValue1a;
      radar[viewName].TOTAL[1] += dataValue2a;
      
      // TOTAL for device type 
      if (typeof radar[viewName][dataDeviceType].TOTAL === 'undefined') {
        radar[viewName][dataDeviceType].TOTAL = [0,0];
      }
      radar[viewName][dataDeviceType].TOTAL[0] += dataValue1a;
      radar[viewName][dataDeviceType].TOTAL[1] += dataValue2a;
    
      // TOTAL browser type
      if (typeof radar[viewName][dataDeviceType].OTHER.TOTAL === 'undefined') {
        radar[viewName][dataDeviceType].OTHER.TOTAL = [0,0];
      }
      radar[viewName][dataDeviceType].OTHER.TOTAL[0] += dataValue1a;
      radar[viewName][dataDeviceType].OTHER.TOTAL[1] += dataValue2a;
      
    }
  }
  
  return radar;
  
};