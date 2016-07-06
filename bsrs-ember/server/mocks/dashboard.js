var SETTINGS_FIXTURES = require('../../vendor/defaults/tenant.js');

module.exports = function(app) {

  var express = require('express');
  var dashboardRouter = express.Router();

  dashboardRouter.get('/', function(req, res) {
    res.send({settings: {dashboard_text: SETTINGS_FIXTURES.dashboard_text}});
  });

  app.use('/api/dashboard/', dashboardRouter);

};
