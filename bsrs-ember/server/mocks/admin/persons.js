var PEOPLE_FIXTURES = require('../../../vendor/people_fixtures.js');

module.exports = function(app) {
  var express = require('express');
  var adminPersonsRouter = express.Router();

  adminPersonsRouter.get('/person__icontains=a/', function(req, res) {
    res.send(PEOPLE_FIXTURES.list());
  });

  adminPersonsRouter.get('/sms-recipients', function(req, res) {
    res.send(PEOPLE_FIXTURES.sms_power_select());
  });
  adminPersonsRouter.get('/email-recipients', function(req, res) {
    res.send(PEOPLE_FIXTURES.sms_power_select());
  });

  adminPersonsRouter.get('/', function(req, res) {
    var page = req.query.page || 1;
    var sort = req.query.ordering ? req.query.ordering.trim() : '';
    var search = req.query.search ? req.query.search.trim() : '';
    var page_size = req.query.page_size ? req.query.page_size.trim() : '';
    if(search && search.length > 0) {
        var term = decodeURIComponent(search);
        res.send(PEOPLE_FIXTURES.searched(term, sort, page));
    } else if(sort && sort.length > 0) {
        res.send(PEOPLE_FIXTURES.sorted(sort, page));
    } else if(page_size && page_size.length > 0) {
        res.send(PEOPLE_FIXTURES.paginated(page_size));
    } else if(parseInt(page) > 1) {
        res.send(PEOPLE_FIXTURES.list_two());
    }else{
        res.send(PEOPLE_FIXTURES.list());
    }
  });

  adminPersonsRouter.post('/', function(req, res) {
    res.status(201);
    res.send(req.body);
  });

  adminPersonsRouter.get('/:id', function(req, res) {
    res.send(PEOPLE_FIXTURES.detail(req.params.id));
  });

  adminPersonsRouter.put('/:id', function(req, res) {
    res.send(PEOPLE_FIXTURES.put(req.params.id));
  });

  adminPersonsRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  app.use('/api/admin/people/', adminPersonsRouter);
};
