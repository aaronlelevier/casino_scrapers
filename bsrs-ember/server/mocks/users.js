var USERS = [
  {
            "id": 11,
            "username": "lcooley",
            "first_name": "Lynne",
            "last_name": "Cooley",
            "is_active": true,
            "title": "RVP",
            "emp_number": "5063",
            "role": 10,
            "role_name": "user.role.regional_manager",
            "auth_amount": "50000.0000"
        },
        {
            "id": 8,
            "username": "bdolljr",
            "first_name": "William",
            "last_name": "Doll",
            "is_active": true,
            "title": "District Manager - So Calif",
            "emp_number": "5024",
            "role": 9,
            "role_name": "user.role.district_manager",
            "auth_amount": "1024.5000"
        },
        {
            "id": 10,
            "username": "shasselmann",
            "first_name": "Susan",
            "last_name": "Hasselmann",
            "is_active": true,
            "title": "Project Manager",
            "emp_number": "5021",
            "role": 11,
            "role_name": "user.role.project_manager",
            "auth_amount": "1000.0000"
        },
        {
            "id": 7,
            "username": "akrier",
            "first_name": "Andrew",
            "last_name": "Krier",
            "is_active": true,
            "title": "Secretary of State",
            "emp_number": "6998",
            "role": 5,
            "role_name": "user.role.system_administrator",
            "auth_amount": "1250.0000"
        },
        {
            "id": 1,
            "username": "tkrier",
            "first_name": "Thomas",
            "last_name": "Krier",
            "is_active": true,
            "title": "Dude",
            "emp_number": "5026",
            "role": 5,
            "role_name": "user.role.system_administrator",
            "auth_amount": "11000000.0000"
        },
        {
            "id": 9,
            "username": "aobrien",
            "first_name": "Angela",
            "last_name": "O'Brien",
            "is_active": true,
            "title": "General Manager",
            "emp_number": "5569",
            "role": 2,
            "role_name": "user.role.store_manager",
            "auth_amount": "10.0000"
        }
]

module.exports = function(app) {
  var express = require('express');
  var usersRouter = express.Router();

  usersRouter.get('/', function(req, res) {
    res.send({
      'users': USERS
    });
  });

  usersRouter.post('/', function(req, res) {
    res.status(201).end();
  });

  usersRouter.get('/:id', function(req, res) {
    res.send({
      'users': {
        id: req.params.id
      }
    });
  });

  usersRouter.put('/:id', function(req, res) {
    res.send({
      'users': {
        id: req.params.id
      }
    });
  });

  usersRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  app.use('/api/people', usersRouter);
};
