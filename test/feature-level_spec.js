var featureServer = require("./feature-server"),
  expect = require("chai").expect,
  async = require("async");
describe("Feature Level",function() {
  var config,
    server;
  afterEach(function(done) {
    if(server) {
      server.stop(done);
    } else {
      done();
    }
  });
  beforeEach(function() {
    config = {};
  });
  
  function getFeaturesCount(max, flag, done) {
    var featuresCount = {},
      count = 0;
      
    async.whilst(
      function() { return count < max; },
      function(callback) {
        async.waterfall(
          [
            function(next) {
              server.getFeatures(next);
            },
            function(features,next) {
              if(!featuresCount[features[flag]]) {
                featuresCount[features[flag]] = 0;
              }
              featuresCount[features[flag]]++;
              next();
            }
          ], callback
        );
        count ++;
      },
      function(error) {
        done(error,featuresCount);
      }
    );
    
  }
  describe("level", function() {
    it("should work with basic level config", function(done){
      config = {
        basic: {
          type: "level",
          config: {
            level: "yes"
          }
        }
      };
      server = featureServer(config);
      async.waterfall(
        [
          server.start,
          function(next) {
            server.getFeatures(next);
          },
          function(features,next) {
            expect(features.basic).to.be.equal("yes");
            next();
          }
        ], done
      );
    });
  });
  
  describe("split",function() {
    it("should work with basic level config", function(done){
  
      config = {
        basic: {
          type: "split",
          config: {
            levels:{
              one:50,
              two:50
            }
          }
        }
      };
      server = featureServer(config);
  
      async.waterfall(
        [
          server.start,
          function(next) {
            getFeaturesCount(50, "basic", next);
          },
          function(features,next) {
            expect(features.one).to.be.within(20,30);
            expect(features.two).to.be.within(20,30);
            next();
          }
        ], done
      );
    });
  });
  
});