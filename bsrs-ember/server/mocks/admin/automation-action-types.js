var automation_FIXTURES = require('../../../vendor/automation_fixtures.js');

module.exports = function(app) {
  var express = require('express');
  var adminautomationsRouter = express.Router();

  adminautomationsRouter.get('/', function(req, res) {
    res.send(automation_FIXTURES.action_search_power_select());
  });

  app.use('/api/admin/automation-action-types', adminautomationsRouter);
};
