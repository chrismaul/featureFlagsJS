var featureServer = require("./feature-server"),
  expect = require("chai").expect,
  async = require("async");
describe("Feature Level",function() {
  var config,
    server;
  afterEach(function(done) {
    if(server) {
      server.stop(done);
    }
  });
  beforeEach(function() {
    config = {};
  });
  
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
        }
      ], done
    );
  });
});