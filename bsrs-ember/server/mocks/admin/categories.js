var CATEGORY_FIXTURES = require('../../../vendor/category_fixtures.js');

module.exports = function(app) {
  var express = require('express');
  var adminCategoriesRouter = express.Router();

  adminCategoriesRouter.get('/parents/', function(req, res) {
    res.send(CATEGORY_FIXTURES.list());
  });

  adminCategoriesRouter.get('/', function(req, res) {
    var page = req.query.page || 1;
    var sort = req.query.ordering ? req.query.ordering.trim() : '';
    var search = req.query.search ? req.query.search.trim() : '';
    var page_size = req.query.page_size ? req.query.page_size.trim() : '';
    if(search && search.length > 0) {
      var term = decodeURIComponent(search);
      res.send(CATEGORY_FIXTURES.searched(term, sort, page));
    } else if(sort && sort.length > 0) {
      res.send(CATEGORY_FIXTURES.sorted(sort, page));
    } else if(page_size && page_size.length > 0) {
      res.send(CATEGORY_FIXTURES.paginated(page_size));
    } else if(parseInt(page) > 1) {
      res.send(CATEGORY_FIXTURES.list_two());
    }else{
      res.send(CATEGORY_FIXTURES.list());
    }
  });

  adminCategoriesRouter.post('/', function(req, res) {
    res.status(201);
    res.send(req.body);
  });

  adminCategoriesRouter.get('/:id', function(req, res) {
    res.send(CATEGORY_FIXTURES.detail(req.params.id));
  });

  adminCategoriesRouter.put('/:id', function(req, res) {
    res.send(CATEGORY_FIXTURES.put(req.params.id));
  });

  adminCategoriesRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  app.use('/api/admin/categories/', adminCategoriesRouter);
};
