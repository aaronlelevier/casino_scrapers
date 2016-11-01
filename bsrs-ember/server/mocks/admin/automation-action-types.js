var AUTOMATION_FIXTURES = require('../../../vendor/automation_fixtures.js');

module.exports = function(app) {
  var express = require('express');
  var adminAutomationsRouter = express.Router();

  adminAutomationsRouter.get('/', function(req, res) {
    res.send(AUTOMATION_FIXTURES.action_search_power_select());
  });

  app.use('/api/admin/automation-action-types', adminAutomationsRouter);
};
