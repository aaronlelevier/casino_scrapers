var STATES = require('../../vendor/state_fixtures.js');

module.exports = function(app) {
  var express = require('express');
  var statesRouter = express.Router();

  statesRouter.get('/', function(req, res) {
    res.send(STATES);
  });

  app.use('/bsrs_deva/states/', statesRouter);
};
