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
  app.user = "testUser";
  app.use(bodyParser());
  app.use(cookieParser());
  app.use(function(request,response,next) {
    request.user = app.user;
    next();
  });
  
  app.use(featureFlag);
  
  app.use("/",function(req,res) {
    res.send(req.features);
  });
  
  server = doppio(app, { autostart: false });
  server.getFeatures = function(done) {
    var uri = server.url();
    if(arguments.length === 2) {
      uri += done;
      done = arguments[1];
    }
    request.get(server.url(),function(error,request,body){
      if(!error) {
        try {
          body = JSON.parse(body);
        } catch(error) {
          console.log(body);
        }
      }
      done(error,body);
    });
  };
  return server;
};