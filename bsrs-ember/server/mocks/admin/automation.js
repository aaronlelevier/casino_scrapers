var automation_FIXTURES = require('../../../vendor/automation_fixtures.js');

module.exports = function(app) {
  var express = require('express');
  var adminautomationsRouter = express.Router();

  adminautomationsRouter.get('/', function(req, res) {
    var page = req.query.page || 1;
    var sort = req.query.ordering ? req.query.ordering.trim() : '';
    var search = req.query.search ? req.query.search.trim() : '';
    var page_size = req.query.page_size ? req.query.page_size.trim() : '';
    if(search && search.length > 0) {
      var term = decodeURIComponent(search);
      res.send(automation_FIXTURES.searched(term, sort, page));
    } else if(sort && sort.length > 0) {
      res.send(automation_FIXTURES.sorted(sort, page));
    } else if(page_size && page_size.length > 0) {
      res.send(automation_FIXTURES.paginated(page_size));
    } else if(parseInt(page) > 1) {
      res.send(automation_FIXTURES.list_two());
    } else {
      res.send(automation_FIXTURES.list());
    }
  });

  adminautomationsRouter.get('/available_filters/', function(req, res) {
    res.send(automation_FIXTURES.list_pfilters());
  });

  adminautomationsRouter.post('/', function(req, res) {
    res.status(201);
    res.send(req.body);
  });

  adminautomationsRouter.get('/:id', function(req, res) {
    res.send(automation_FIXTURES.detail(req.params.id));
  });

  adminautomationsRouter.put('/:id', function(req, res) {
    res.send(automation_FIXTURES.put(req.params.id));
  });

  adminautomationsRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  app.use('/api/admin/automations', adminautomationsRouter);
};
