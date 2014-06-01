var simpleFeatureConfig = require("./lib/simple-feature-config"),
  _ = require("underscore");

module.exports = function(config) {
  var featureConfig,
    featureData = {},
    api = {},
    moduleMap = {};

  moduleMap.level = "./lib/feature-level.js";
  moduleMap.split = "./lib/feature-split.js";

  function setFeatureData(features) {
    _.each(features, function(featureValue,featureKey) {
      var featureGenerator,
        featureModule;
      
      featureModule = featureValue.type;
      if(moduleMap[featureModule]) {
        featureModule = moduleMap[featureModule];
      }
      
      featureGenerator = require(featureModule);
      featureData[featureKey] = featureGenerator(featureValue.config);
    });
  
  }
  
  Object.defineProperty(api,"featureData", { 
    set : setFeatureData,
    get : function() { return featureData; }
  });
  
  if ( ! config ) {
    return { 
      isEnabled: function() { return true; },
      featureLevel: function() { return "default"; }
    };
  }
  if ( config.setFeatureGenerator instanceof Function ) {
    featureConfig = config;
  } else {
    featureConfig = simpleFeatureConfig(config);
  }
  featureConfig.setFeatureGenerator(api);
  
  api.cookiesOptions = {};
  
  /**
   * This middleware needs to be added
   */
  api.middleware = function(request, response, next) {
    // only uses unsigned cookies when this flag is set to false
    
    var features = {},
      featuresApi = {};
    
    if(request.signedCookies && request.signedCookies.features) {
      features = request.signedCookies.features;
    } else if(request.cookies.features) {
      features = request.cookies.features;
    }
    
    _.each( featureData, function(featureValue,featureKey) {
      if ( ! features[featureKey] ) {
        features[featureKey] = featureValue(request);
      }
    });
    
    response.cookie("features", features, api.cookiesOptions);
    
    featuresApi.data = features;
    featuresApi.featureLevel = function(featureName) {
      return features[featureName];
    };
    
    featuresApi.isEnabled = function (featureName, checkLevel) {
      var featureLevel = featuresApi.featureLevel(featureName),
        retVal = false;
      if( typeof(featureLevel) === "number" && 
        typeof(checkLevel) === "number ") {
        retVal = checkLevel <= featureLevel;
      } else {
        retVal = checkLevel == featureLevel;
      }
      return retVal;
    };
    request.features = featuresApi;

    if(next) {
      next();
    }
  };
  
  return api;
}