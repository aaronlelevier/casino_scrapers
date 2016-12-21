/*jshint node:true*/
var PERSON_CURRENT = require('../../vendor/defaults/person-current.js');

module.exports = function(app) {
  var express = require('express');
  var sessionRouter = express.Router();

  sessionRouter.get('/', function(req, res) {
    res.send(PERSON_CURRENT.defaults());
  });

  app.use('/api/session', sessionRouter);
};
