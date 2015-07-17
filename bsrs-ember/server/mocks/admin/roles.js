var ROLES = {
  "count":3,
  "next":null,
  "previous":null,
  "results":[
    {
      "id":3,
      "name":"System Administrator"
    },
    {
      "id":4,
      "name":"Store Manager"
    },
    {
      "id":2,
      "name":"Contractor"
    }
  ]
};

module.exports = function(app) {
  var express = require('express');
  var adminRolesRouter = express.Router();

  adminRolesRouter.get('/', function(req, res) {
    res.send(ROLES);
  });

  adminRolesRouter.post('/', function(req, res) {
    res.status(201).end();
  });

  adminRolesRouter.get('/:id', function(req, res) {
    var response = ROLES;
    var found = response.results.filter(function(role){
       return role.id == req.params.id;
    })[0];
    res.send(found);
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
