var _ = require("underscore");

module.exports = function(config) {
  var levels = {},
    configLevel = 0;
  _.each(config.levels,function(featureLevel,percentage) {
    levels[featureLevel] = { min:configLevel, max: configLevel+percentage };
    configLevel += percentage;
  });
  if( configLevel < 100 && config.defaultLevel ) {
    levels[config.defaultLevel] = { min:configLevel, max: 100 };
  }
  return function() {
    var featureRandom = Math.random(),
      retVal;
    _.each(levels,function(featureLevel,featureBoundry) {
      if(featureBoundry.min <= featureRandom && 
        featureRandom <= featureBoundry.max ) {
        
        retVal = featureLevel;
      }
    });
    return retVal;
  };
};