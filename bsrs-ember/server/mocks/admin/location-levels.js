var LOCATION_LEVEL_FIXTURES = require('../../../vendor/location_level_fixtures.js');

module.exports = function(app) {
  var express = require('express');
  var adminLocationLevelsRouter = express.Router();

  adminLocationLevelsRouter.get('/', function(req, res) {
    res.send();
  });

  adminLocationLevelsRouter.post('/', function(req, res) {
    res.status(201);
    res.send(req.body);
  });

  adminLocationLevelsRouter.get('/:id', function(req, res) {
    res.send();
  });

  adminLocationLevelsRouter.put('/:id', function(req, res) {
    res.send(LOCATION_LEVEL_FIXTURES.put(req.params.id));
  });

  adminLocationLevelsRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  app.use('/api/admin/location_levels', adminLocationLevelsRouter);
};
