var TICKET_FIXTURES = require('../../vendor/ticket_fixtures.js');
var TICKET_ACTIVITY_FIXTURES = require('../../vendor/ticket_activity_fixtures.js');

module.exports = function(app) {
  var express = require('express');
  var adminTicketsRouter = express.Router();

  adminTicketsRouter.get('/', function(req, res) {
    var page = req.query.page || 1;
    var sort = req.query.ordering ? req.query.ordering.trim() : '';
    var search = req.query.search ? req.query.search.trim() : '';
    var page_size = req.query.page_size ? req.query.page_size.trim() : '';
    if(search && search.length > 0) {
        var term = decodeURIComponent(search);
        res.send(TICKET_FIXTURES.searched(term, sort, page));
    } else if(sort && sort.length > 0) {
        res.send(TICKET_FIXTURES.sorted(sort, page));
    } else if(page_size && page_size.length > 0) {
        res.send(TICKET_FIXTURES.paginated(page_size));
    } else if(parseInt(page) > 1) {
        res.send(TICKET_FIXTURES.list_two(page));
    }else{
        res.send(TICKET_FIXTURES.list());
    }
  });

  adminTicketsRouter.post('/', function(req, res) {
    res.status(201);
    res.send(req.body);
  });

  adminTicketsRouter.get('/:id', function(req, res) {
    res.send(TICKET_FIXTURES.detail(req.params.id));
  });

  adminTicketsRouter.get('/index/:id', function(req, res) {
    res.send(TICKET_FIXTURES.detail(req.params.id));
  });

  adminTicketsRouter.get('/:id/activity', function(req, res) {
    res.send(TICKET_ACTIVITY_FIXTURES.assignee_only());
  });

  adminTicketsRouter.put('/:id', function(req, res) {
    res.send(TICKET_FIXTURES.put(req.params.id));
  });

  adminTicketsRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  app.use('/api/tickets/', adminTicketsRouter);
};
