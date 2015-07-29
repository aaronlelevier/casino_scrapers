function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

var ROLE_FIXTURES = require('../../../vendor/role_fixtures.js');

module.exports = function(app) {
  var express = require('express');
  var adminRolesRouter = express.Router();

  adminRolesRouter.get('/', function(req, res) {
    res.send(ROLE_FIXTURES.list());
  });

  adminRolesRouter.post('/', function(req, res) {
    var actualPayload = req.body;
    actualPayload.id = randomInt(0, 99999);
    res.status(201);
    res.send(actualPayload);
  });

  adminRolesRouter.get('/:id', function(req, res) {
      res.send(ROLE_FIXTURES.detail(req.params.id));
  });

  adminRolesRouter.put('/:id', function(req, res) {
    res.send({
      'admin/roles': {
        id: req.params.id
      }
    });
  });

  adminRolesRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  app.use('/api/admin/roles/', adminRolesRouter);
};
