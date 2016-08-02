var ASSIGNMENT_FIXTURES = require('../../../vendor/assignment_fixtures.js');

module.exports = function(app) {
  var express = require('express');
  var adminAssignmentsRouter = express.Router();

  adminAssignmentsRouter.get('/', function(req, res) {
    var page = req.query.page || 1;
    var sort = req.query.ordering ? req.query.ordering.trim() : '';
    var search = req.query.search ? req.query.search.trim() : '';
    var page_size = req.query.page_size ? req.query.page_size.trim() : '';
    if(search && search.length > 0) {
        var term = decodeURIComponent(search);
        res.send(ASSIGNMENT_FIXTURES.searched(term, sort, page));
    } else if(sort && sort.length > 0) {
        res.send(ASSIGNMENT_FIXTURES.sorted(sort, page));
    } else if(page_size && page_size.length > 0) {
        res.send(ASSIGNMENT_FIXTURES.paginated(page_size));
    } else if(parseInt(page) > 1) {
        res.send(ASSIGNMENT_FIXTURES.list_two());
    } else {
        res.send(ASSIGNMENT_FIXTURES.list());
    }
  });

  adminAssignmentsRouter.get('/available_filters/', function(req, res) {
    res.send(ASSIGNMENT_FIXTURES.list_pfilters());
  });

  adminAssignmentsRouter.post('/', function(req, res) {
    res.status(201);
    res.send(req.body);
  });

  adminAssignmentsRouter.get('/:id', function(req, res) {
    res.send(ASSIGNMENT_FIXTURES.detail());
  });

  adminAssignmentsRouter.put('/:id', function(req, res) {
    res.send(ASSIGNMENT_FIXTURES.put(req.params.id));
  });

  adminAssignmentsRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  app.use('/api/admin/assignments', adminAssignmentsRouter);
};
