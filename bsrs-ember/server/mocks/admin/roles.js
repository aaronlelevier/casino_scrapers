var ROLE_FIXTURES = require('../../../vendor/role_fixtures.js');

module.exports = function(app) {
  var express = require('express');
  var adminRolesRouter = express.Router();

  adminRolesRouter.get('/', function(req, res) {
    var page = req.query.page || 1;
    var sort = req.query.ordering ? req.query.ordering.trim() : '';
    var search = req.query.search ? req.query.search.trim() : '';
    if(search && search.length > 0) {
        var term = decodeURIComponent(search);
        res.send(ROLE_FIXTURES.searched(term, sort, page));
    } else if(sort && sort.length > 0) {
        res.send(ROLE_FIXTURES.sorted(sort, page));
    } else if(parseInt(page) > 1) {
        res.send(ROLE_FIXTURES.list_two());
    }else{
        res.send(ROLE_FIXTURES.list());
    }
  });

  adminRolesRouter.post('/', function(req, res) {
    res.status(201);
    res.send(req.body);
  });

  adminRolesRouter.get('/:id', function(req, res) {
      res.send(ROLE_FIXTURES.detail(req.params.id));
  });

  adminRolesRouter.put('/:id', function(req, res) {
    res.send(ROLE_FIXTURES.put(req.params.id));
  });

  adminRolesRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  app.use('/api/admin/roles/', adminRolesRouter);
};
