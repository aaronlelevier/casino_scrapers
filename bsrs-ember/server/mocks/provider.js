var PROVIDER_FIXTURES = require('../../vendor/provider_fixtures.js');

module.exports = function(app) {
  var express = require('express');
  var adminProvidersRouter = express.Router();

  adminProvidersRouter.get('/', function(req, res) {
    res.send(PROVIDER_FIXTURES.list());
  });

  adminProvidersRouter.get('/:id', function(req, res) {
    res.send(PROVIDER_FIXTURES.generate(req.params.id));
  });

  app.use('/api/providers', adminProvidersRouter);
};
