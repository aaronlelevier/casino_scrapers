var PEOPLE_FIXTURES = require('../../../vendor/people_fixtures.js');
var USERS = {"count":3,"next":null,"previous":null,"results":[
  {"id":3,"username":"akrier","first_name":"Andrew","middleinitial":"M","last_name":"Krier","title":"Grand Poobah","emp_number":"5043","role_name":"admin.role.system_administrator","auth_amount":"1000.0000","status_name":"person.status.active"},
  {"id":4,"username":"tkrier","first_name":"Tom","middleinitial":"J","last_name":"Krier","title":"Starship Overlord","emp_number":"5026","role_name":"admin.role.hosting_administrator","auth_amount":"266532.0000","status_name":"person.status.active"},
  {"id":2,"username":"snewcomer","first_name":"Scotty","middleinitial":"","last_name":"Newcomer","title":"Darth Vader","emp_number":"5037","role_name":"admin.role.hosting_administrator","auth_amount":"0.0000","status_name":"person.status.active"}]}

var PEOPLE = [{
  "id":4,
  "username":"tkrier",
  "first_name":"Thomas",
  "middleinitial":"J",
  "last_name":"Krier",
  "title":"Mob Boss",
  "emp_number":"5026",
  "role":{
    "id":1,
    "name":"admin.role.hosting_administrator",
    "locationlevel":1,
    "roletype":"location"
  },
  "auth_amount":"266532.0000",
  "status":{
    "id":1,
    "name":"person.status.active"
  },
  "acceptassign":false,
  "phone_numbers":[
    {
      "id":3,
      "number":"858-715-5026",
      "type":{
        "id":1,
        "name":"admin.phonenumbertype.office"
      }
    },
    {
      "id":4,
      "number":"858-715-5056",
      "type":{
        "id":2,
        "name":"admin.phonenumbertype.mobile"
      }
    }],
  "addresses":[
    {
      "type": {
        "id": 1,
        "name": "admin.adresstype.office"
      },
      "address": "9325 Sky Park Ct.\nSuite 120",
      "city": "San Diego",
      "state": {
        "id": 1,
        "name": "California"
      },
      "postal_code": "92123",
      "country": {
        "id": 1,
        "name": "United States of America"
      }
    }
  ],
  "emails":[]
},

{
  "id":3,
  "username":"akrier",
  "first_name":"Andy",
  "middleinitial":"J",
  "last_name":"Krier",
  "title":"Mr. Rodgers",
  "emp_number":"5027",
  "role":{
    "id":1,
    "name":"admin.role.hosting_administrator",
    "locationlevel":1,
    "roletype":"location"
  },
  "auth_amount":"266532.0000",
  "status":{
    "id":1,
    "name":"person.status.active"
  },
  "acceptassign":false,
  "phone_numbers":[
    {
      "id":3,
      "number":"858-715-5026",
      "type":{
        "id":1,
        "name":"admin.phonenumbertype.office"
      }
    },
    {
      "id":4,
      "number":"858-715-5056",
      "type":{
        "id":2,
        "name":"admin.phonenumbertype.mobile"
      }
    }],
  "addresses":[],
  "emails":[]
},
{
  "id":2,
  "username":"snewcomer",
  "first_name":"Scott",
  "middleinitial":"N",
  "last_name":"Newcomer",
  "title":"Mickey Mouse's Right Hand Hand",
  "emp_number":"5026",
  "role":{
    "id":1,
    "name":"admin.role.hosting_administrator",
    "locationlevel":1,
    "roletype":"location"
  },
  "auth_amount":"266532.0000",
  "status":{
    "id":1,
    "name":"person.status.active"
  },
  "acceptassign":false,
  "phone_numbers":[
    {
      "id":3,
      "number":"858-715-5026",
      "type":{
        "id":1,
        "name":"admin.phonenumbertype.office"
      }
    },
    {
      "id":4,
      "number":"858-715-5056",
      "type":{
        "id":2,
        "name":"admin.phonenumbertype.mobile"
      }
    }],
  "addresses":[],
  "emails":[]
}];

module.exports = function(app) {
  var express = require('express');
  var adminPersonsRouter = express.Router();

  adminPersonsRouter.get('/', function(req, res) {
    res.send(USERS);
  });

  adminPersonsRouter.post('/', function(req, res) {
    res.status(201).end();
  });

  adminPersonsRouter.get('/:id', function(req, res) {
    var response = PEOPLE;
    var found = response.filter(function(person){
       return person.id == req.params.id;
    })[0];
    res.send(found);
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

  app.use('/bsrs_deva/admin/people/', adminPersonsRouter);
};
