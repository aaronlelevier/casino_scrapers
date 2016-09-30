var TENANT_FIXTURES = require('../../vendor/tenant_fixtures.js');

module.exports = function(app) {
  var express = require('express');
  var adminTenantsRouter = express.Router();

  adminTenantsRouter.get('/', function(req, res) {
    var page = req.query.page || 1;
    var sort = req.query.ordering ? req.query.ordering.trim() : '';
    var search = req.query.search ? req.query.search.trim() : '';
    var page_size = req.query.page_size ? req.query.page_size.trim() : '';
    if(search && search.length > 0) {
        var term = decodeURIComponent(search);
        res.send(TENANT_FIXTURES.searched(term, sort, page));
    } else if(sort && sort.length > 0) {
        res.send(TENANT_FIXTURES.sorted(sort, page));
    } else if(page_size && page_size.length > 0) {
        res.send(TENANT_FIXTURES.paginated(page_size));
    } else if(parseInt(page) > 1) {
        res.send(TENANT_FIXTURES.list_two());
    }else{
        res.send(TENANT_FIXTURES.list());
    }
  });

  adminTenantsRouter.post('/', function(req, res) {
    res.status(201);
    res.send(req.body);
  });

  adminTenantsRouter.get('/:id', function(req, res) {
    res.send(TENANT_FIXTURES.detail(req.params.id));
  });

  adminTenantsRouter.put('/:id', function(req, res) {
    res.send(TENANT_FIXTURES.put(req.params.id));
  });

  adminTenantsRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  app.use('/api/admin/tenants', adminTenantsRouter);
};