module.exports = function(config) {
  var api = {};
  api.setFeatureGenerator = function(featureConfig) {
    featureConfig.featureData = config;
  }
  return api;
};