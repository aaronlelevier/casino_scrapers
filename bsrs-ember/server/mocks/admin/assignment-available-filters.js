var ASSIGNMENT_FIXTURES = require('../../../vendor/assignment_fixtures.js');

module.exports = function(app) {
  var express = require('express');
  var adminAssignmentsRouter = express.Router();

  adminAssignmentsRouter.get('/', function(req, res) {
    res.send(ASSIGNMENT_FIXTURES.list_pfilters());
  });

  app.use('/api/admin/assignments-available-filters', adminAssignmentsRouter);
};
