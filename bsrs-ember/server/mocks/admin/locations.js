var LOCATION_FIXTURES = require('../../../vendor/location_fixtures.js');

module.exports = function(app) {
  var express = require('express');
  var adminLocationLevelsRouter = express.Router();

  adminLocationLevelsRouter.get('/', function(req, res) {
    res.send(LOCATION_FIXTURES.list());
  });

  adminLocationLevelsRouter.post('/', function(req, res) {
    res.status(201);
    res.send(req.body);
  });

  adminLocationLevelsRouter.get('/:id', function(req, res) {
    res.send(LOCATION_FIXTURES.detail());
  });

  adminLocationLevelsRouter.put('/:id', function(req, res) {
    res.send({
      'admin/locations': {
        id: req.params.id
      }
    });
  });

  adminLocationLevelsRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  app.use('/api/admin/locations', adminLocationLevelsRouter);
};
