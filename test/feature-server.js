var express = require("express"),
  doppio = require("doppio"),
  request = require("request"),
  bodyParser = require("body-parser"),
  cookieParser = require("cookie-parser"),
  featureFlagJS = require("../index");
  
module.exports = function(config) {
  var app = express(),
    featureFlag,
    server;
    
  featureFlag = featureFlagJS(config);
  app.use(bodyParser());
  app.use(cookieParser());
  app.use( featureFlag.middleware );
  
  app.use("/",function(req,res) {
    res.send(req.features.data);
  });
  
  server = doppio(app, { autostart: false });
  server.getFeatures = function(done) {
    request.get(server.url(),function(error,request,body){
      if(!error) {
        body = JSON.parse(body);
      }
      done(error,body);
    });
  };
  return server;
};