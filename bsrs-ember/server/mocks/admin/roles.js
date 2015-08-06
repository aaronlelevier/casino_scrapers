var ROLE_FIXTURES = require('../../../vendor/role_fixtures.js');

module.exports = function(app) {
  var express = require('express');
  var adminRolesRouter = express.Router();

  adminRolesRouter.get('/', function(req, res) {
    res.send(ROLE_FIXTURES.list());
  });

  adminRolesRouter.post('/', function(req, res) {
    res.status(201);
    res.send(req.body);
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
