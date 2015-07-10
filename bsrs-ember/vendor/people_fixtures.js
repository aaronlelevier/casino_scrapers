var generatePerson = function(i) {
    return {
        "id": i,
        "username": "akrier",
        "first_name": "Andy",
        "middleinitial":"J",
        "last_name": "Krier",
        "title": "RVP",
        "emp_number": "5063",
        "auth_amount": "50000.0000",
        "status_name": 1, 
        "role_name": 1 
    }
}//generatePerson

/* important keys */ 
var role = {
        "id": 2,
        "name": "admin.role.system_administrator",
        "locationlevel": 1,
        "roletype": "location"
    };
var status = {
        "id": 1,
        "name": "person.status.active"
    };
var phone_numbers = [
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
    }]; /* END important keys */

var addresses = [
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
  ];

var PEOPLE_FACTORY = {
    list: function() {
        var response = [];
        for (var i=0; i < 5; i++) { 
            response.push(generatePerson(i));
        }
        return {"results": response};
    },
    detail: function() {
        var person = generatePerson();
        person['role'] = role;
        person['status'] = status;
        person["acceptassign"]= false;
        person["phone_numbers"]= phone_numbers;
        person["addresses"]= addresses;
        person["emails"]= []
        return person;
    }
};//People_Factory


if (typeof window === 'undefined') {
    module.exports = PEOPLE_FACTORY; 
} else {
    define('bsrs-ember/vendor/people_fixtures', ['exports'], function (exports) {
        'use strict';
        return PEOPLE_FACTORY;
    });
}

