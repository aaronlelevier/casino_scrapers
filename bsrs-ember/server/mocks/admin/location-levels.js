var LOCATION_LEVEL_FIXTURES = require('../../../vendor/location-level_fixtures.js');

module.exports = function(app) {
  var express = require('express');
  var adminLocationLevelsRouter = express.Router();

  adminLocationLevelsRouter.get('/', function(req, res) {
    var page = req.query.page || 1;
    var sort = req.query.ordering ? req.query.ordering.trim() : '';
    var search = req.query.search ? req.query.search.trim() : '';
    var page_size = req.query.page_size ? req.query.page_size.trim() : '';
    if(search && search.length > 0) {
        var term = decodeURIComponent(search);
        res.send(LOCATION_LEVEL_FIXTURES.searched(term, sort, page));
    } else if(sort && sort.length > 0) {
        res.send(LOCATION_LEVEL_FIXTURES.sorted(sort, page));
    } else if(page_size && page_size.length > 0) {
        res.send(LOCATION_LEVEL_FIXTURES.paginated(page_size));
    } else if(parseInt(page) > 1) {
        res.send(LOCATION_LEVEL_FIXTURES.list_two());
    }else{
        res.send(LOCATION_LEVEL_FIXTURES.list());
    }
  });

  adminLocationLevelsRouter.post('/', function(req, res) {
    res.status(201);
    res.send(req.body);
  });

  adminLocationLevelsRouter.get('/:id', function(req, res) {
    res.send(LOCATION_LEVEL_FIXTURES.detail());
  });

  adminLocationLevelsRouter.put('/:id', function(req, res) {
    res.send(LOCATION_LEVEL_FIXTURES.put(req.params.id));
  });

  adminLocationLevelsRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  app.use('/api/admin/location-levels', adminLocationLevelsRouter);
};
