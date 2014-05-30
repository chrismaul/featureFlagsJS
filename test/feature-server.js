var express = require("express"),
  doppio = require("doppio"),
  request = require("request"),
  featureFlagJS = require("../index");
  
module.exports = function(config) {
  var app = express(),
    featureFlag,
    server;
    
  featureFlag = featureFlagJS(config);
  app.configure( function() {
      app.use(express.bodyParser());
      app.use(express.methodOverride());
      app.use(app.router);
      app.use(express.cookieParser());
  });
  app.use(function(req,res,next){
    featureFlag.setFeatures(req,res);
    next();
  })
  app.use("/",function(req,res) {
    res.send(req.features.data);
  });
  
  server = doppio(app);
  server.getFeatures = function(done) {
    request.get(server.url(),function(error,request,body){
      done(error,JSON.parse(body));
    });
  };
  return server;
};