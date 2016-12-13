/*jshint node:true*/
var PERSON_CURRENT_DEFAULTS = require('../../vendor/defaults/person-current.js');
//var PEOPLE_FIXTURES = require('../../vendor/translation_fixtures.js');

module.exports = function(app) {
  var express = require('express');
  var sessionRouter = express.Router();

  sessionRouter.get('/', function(req, res) {
    res.send(PERSON_CURRENT_DEFAULTS);
  });

  app.use('/api/session', sessionRouter);
};
