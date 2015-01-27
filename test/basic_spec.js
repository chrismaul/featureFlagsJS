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
        basic: [
          {
            value:"yes",
            level:101
          }
        ]
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
        basic:[
          {
            value:"one",
            level:50
          },
          {
            value:"two",
            level:50
          }
        ]
      };
      server = featureServer(config);
  
      async.waterfall(
        [
          server.start,
          function(next) {
            getFeaturesCount(100, "basic", next);
          },
          function(features,next) {
            expect(features.one).to.be.within(30,60);
            expect(features.two).to.be.within(30,60);
            next();
          }
        ], done
      );
    });
  });
  
  describe("matchUser",function() {
    it("should match the user", function(done){
  
      config = {
        basic: [
          {
            match:{
              type:"user",
              users:"testUser"
            },
            value:"yes",
            level:101
          },
          {
            value:"no",
            level:101
          }
        ]
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
    
    it("should not match the user", function(done){
  
      config = {
        basic: [
          {
            match:{
              type:"user",
              users:"badUser"
            },
            value:"yes",
            level:101
          },
          {
            value:"no",
            level:101
          }
        ]
      };
      server = featureServer(config);
      async.waterfall(
        [
          server.start,
          function(next) {
            server.getFeatures(next);
          },
          function(features,next) {
            expect(features.basic).to.be.equal("no");
            next();
          }
        ], done
      );
    });
  });
  describe("override",function() {
    it("should be able to override the feature", function(done){
      config = {
        basic: [
          {
            value:"no",
            level:101
          }
        ]
      };
      server = featureServer(config);
      async.waterfall(
        [
          server.start,
          function(next) {
            server.getFeatures("?feature-basic=yes",next);
          },
          function(features,next) {
            expect(features.basic).to.be.equal("no");
            next();
          }
        ], done
      );
    });
    
  });
  
});