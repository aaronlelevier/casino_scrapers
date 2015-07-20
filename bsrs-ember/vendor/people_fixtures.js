var generatePerson = function(i) {
    return {
        'id': i,
        'username': 'akrier',
        'first_name': 'Andy',
        //TODO: edit middle name in form? 'middle_initial':'J',
        'last_name': 'Krier',
        'title': 'RVP',
        'emp_number': '5063',
        'auth_amount': '50000.0000',
        'status': {
            'id': 1,
            'name': 'admin.person.status.active'
        },
        'role': {
            'id': 2,
            'name': 'admin.role.system_administrator',
        }
    }
}//generatePerson

/* important keys */
var phone_numbers_fixture_put = [{id: 3, number: '858-715-5026', type: 2}, {id: 4, number: '858-715-5056', type: 2}];
var addresses_fixture_put = [{id: 1, type: 1, address: 'Sky Park', city: 'San Diego', state: 5, postal_code: '92123', country: 1},
    {id: 2, type: 2, address: '123 PB', city: 'San Diego', state: 5, postal_code: '92100', country: 1}];
var phone_number_types = [];
var phone_numbers_fixture_get = [
{
    'id':3,
    'number':'858-715-5026',
    'type':{
        'id':1,
        'name':'admin.phonenumbertype.office'
    }
},
{
    'id':4,
    'number':'858-715-5056',
    'type':{
        'id':2,
        'name':'admin.phonenumbertype.mobile'
    }
}];

var addresses_fixture_get = [
{
    'id': 1,
    'type': {
        'id': 1,
        'name': 'admin.address_type.office'
    },
    'address': 'Sky Park',
    'city': 'San Diego',
    'state': 5,
    'postal_code': '92123',
    'country': 1
},
{
    'id': 2,
    'type': {
        'id': 2,
        'name': 'admin.address_type.shipping'
    },
    'address': '123 PB',
    'city': 'San Diego',
    'state': 5,
    'postal_code': '92100',
    'country': 1
}
];
 /* END important keys */

var PEOPLE_FACTORY = {
    list: function() {
        var response = [];
        for (var i=1; i <= 5; i++) {
            response.push(generatePerson(i));
        }
        return {'count':3,'next':null,'previous':null,'results': response};
    },
    detail: function(i) {
        var person = generatePerson(i);
        person.acceptassign = false;
        person.phone_numbers = phone_numbers_fixture_get;
        person.addresses = addresses_fixture_get;
        person.emails = []
        return person;
    },
    put: function(i, username, first_name, last_name, title, emp_number, auth_amount, phone_numbers, addresses) {
        var response = generatePerson(i, 'PUT');
        response.role = response.role.id;
        response.status = response.status.id;
        response.title = title || response.title;
        response.username = username || response.username;
        response.first_name = first_name || response.first_name;
        response.last_name = last_name || response.last_name;
        response.emp_number = emp_number || response.emp_number;
        response.auth_amount = auth_amount || response.auth_amount;
        response.phone_numbers= phone_numbers || phone_numbers_fixture_put;
        response.addresses= addresses || addresses_fixture_put;
        response.acceptassign= false;
        response.emails= [];
        return response;
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
