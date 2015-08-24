var CATEGORY_FIXTURES = require('../../../vendor/category_fixtures.js');

module.exports = function(app) {
  var express = require('express');
  var adminCategoriesRouter = express.Router();

  adminCategoriesRouter.get('/', function(req, res) {
    res.send(CATEGORY_FIXTURES.list());
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
