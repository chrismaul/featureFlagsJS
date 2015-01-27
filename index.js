var _ = require("underscore");

module.exports = function(config) {
  
  function matchUser(match,request) {
    if(!_.isArray(match.users)) {
      match.users = [match.users];
    }
    if(_.contains(match.users,request.user)) {
      return true;
    } else {
      return false;
    }
  }
  
  function selectFeature(feature,request) {
    var matchLevel = [];
    var currentLevel = 0;
    var retVal = false;
    feature.forEach(function(featureLevel){
      if(featureLevel.level === 0) {
        return;
      }
      var level = featureLevel.level;
      if(featureLevel.match) {
        var match = false;
        if(featureLevel.match.type === "user" ) {
          match = matchUser(featureLevel.match,request);
        } else {
          try {
            match = require(featureLevel.match.type)(featureLevel.match,
            request);
          } catch(error) {
            
          }
        }
        if(!match) {
          level = -1;
        }
        if(match && level > 100) {
          retVal = featureLevel.value;
        }
      }
      if(level > 100 && !retVal) {
        retVal = featureLevel.value;
      } else if(level > -1) {
        matchLevel.push({
          min:currentLevel,
          max:currentLevel+level,
          value:featureLevel.value
        });
        currentLevel+=level;
      }
    });
    if(!retVal) {
      
      var luckyNumber = _.random(0,currentLevel);
      matchLevel.forEach(function(match){
        if(match.min < luckyNumber && luckyNumber <= match.max) {
          retVal = match.value;
        }
      });
    }
    return retVal;
  }
  
  function middleware(request,response,next) {
    var features = {};
    if(request.cookies.features) {
      features = request.cookies.features;
    }
    Object.keys(features).forEach(function(name) {
      if(!api.featuresConfig[name]) {
        delete features[name];
      }
    });
    
    Object.keys(api.featuresConfig).forEach(function(name) {
      if(!features[name]) {
        features[name] = selectFeature(api.featuresConfig[name],request);
      }
      if(request.query["feature-"+name]) {
        features[name]=request.query["feature-"+name];
      }
    });
    request.features = features;
    function isEnabled(name,value) {
      var retVal = false;
      if(value === undefined) {
        if(features[name]) {
          retVal = true;
        }
      } else if(features[name] === value) { 
        retVal = true;
      }
      return retVal;
    }
    function atLeast(name,value) {
      var retVal = false;
      if( typeof(value) === "number" && 
          typeof(features[name]) === "number") {
          retVal = features[name] <= value;
      } else {
        retVal = features.isEnabled(name,value);
      }
      return retVal;
    }
    response.cookie("features", features);
    Object.defineProperty(features,"isEnabled",{
      value:isEnabled
    });
    Object.defineProperty(features,"atLeast",{
      value:atLeast
    });
    
    next();
  }
  
  var api = middleware;
  
  api.featuresConfig = config;
  
  return api;
};