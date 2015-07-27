function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

var PEOPLE_FIXTURES = require('../../../vendor/people_fixtures.js');

module.exports = function(app) {
  var express = require('express');
  var adminPersonsRouter = express.Router();

  adminPersonsRouter.get('/', function(req, res) {
    res.send(PEOPLE_FIXTURES.list());
  });

  adminPersonsRouter.post('/', function(req, res) {
    var actualPayload = req.body;
    actualPayload.phone_numbers.forEach(function(phone_number) {
        phone_number.id = randomInt(0, 99999);
    });
    actualPayload.id = randomInt(0, 99999);
    res.status(201);
    res.send(actualPayload);
  });

  adminPersonsRouter.get('/:id', function(req, res) {
    res.send(PEOPLE_FIXTURES.detail(req.params.id));
  });

  adminPersonsRouter.put('/:id', function(req, res) {
    res.send({
      'admin/persons': {
        id: req.params.id
      }
    });
  });

  adminPersonsRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  app.use('/api/admin/people/', adminPersonsRouter);
};
