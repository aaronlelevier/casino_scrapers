var DTD_FIXTURES = require('../../vendor/dtd_fixtures.js');

module.exports = function(app) {
  var express = require('express');
  var adminDTDSRouter = express.Router();

  adminDTDSRouter.get('/', function(req, res) {
    var page = req.query.page || 1;
    var sort = req.query.ordering ? req.query.ordering.trim() : '';
    var search = req.query.search ? req.query.search.trim() : '';
    var page_size = req.query.page_size ? req.query.page_size.trim() : '';
    if(search && search.length > 0) {
        var term = decodeURIComponent(search);
        res.send(DTD_FIXTURES.searched(term, sort, page));
    } else if(sort && sort.length > 0) {
        res.send(DTD_FIXTURES.sorted(sort, page));
    } else if(page_size && page_size.length > 0) {
        res.send(DTD_FIXTURES.paginated(page_size));
    } else if(parseInt(page) > 1) {
        res.send(DTD_FIXTURES.list_two());
    }else{
        res.send(DTD_FIXTURES.list());
    }
  });

  adminDTDSRouter.post('/', function(req, res) {
    res.status(201);
    res.send(req.body);
  });

  adminDTDSRouter.get('/:id', function(req, res) {
    res.send(DTD_FIXTURES.detail(req.params.id));
  });

  adminDTDSRouter.put('/:id', function(req, res) {
    res.send(DTD_FIXTURES.put(req.params.id));
  });

  adminDTDSRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  app.use('/api/dtds/', adminDTDSRouter);
};
