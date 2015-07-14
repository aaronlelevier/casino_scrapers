import Ember from 'ember';
import config from 'bsrs-ember/config/environment'; 

var API_HOST = config.APP.API_HOST;
var NAMESPACE = config.APP.NAMESPACE;

var extractPhoneNumbers = function(phoneNumbers, store) {
    return phoneNumbers.map((phoneNumber) => {
        var phone_number_model = store.find('phonenumber', phoneNumber);
        var number = phone_number_model.get('number');
        var type = phone_number_model.get('type');
        return {id: phoneNumber, number: number, type: type};
    });
};

var create_people_with_relationships = function(response, store, id) {
    Ember.run(function() {
        var phone_number_ids = [];
        var phone_number_type_ids = [];
        response.phone_numbers.forEach((phone_number) => {
            store.push("phonenumber-type", phone_number.type);
            phone_number.type = phone_number.type.id;
            phone_number.person_id = id;
            store.push("phonenumber", phone_number);
            phone_number_ids.push(phone_number.id);
        });
        response.phone_numbers = phone_number_ids;
        store.push("person", response);
    });
};

var extractPerson = function(model, store) {
    var phoneNumbers = extractPhoneNumbers(model.get('phone_numbers'), store);
    return {
        'id': model.get('id'),
        'username': model.get('username'),
        'first_name': model.get('first_name'),
        'last_name': model.get('last_name'),
        'title': model.get('title'),
        'emp_number': model.get('emp_number'),
        'auth_amount': model.get('auth_amount'),
        'status': model.get('status'),
        'role': model.get('role'),
        'acceptassign': model.get('acceptassign'),
        'phone_numbers': phoneNumbers,
        'addresses': model.get('addresses'),
        'emails': model.get('emails')
    };
};

export default Ember.Object.extend({
    save: function(model) {
        var prefix = API_HOST + '/' + NAMESPACE;
        var endpoint = prefix + '/admin/people/' + model.get('id') + '/';
        var store = this.get('store');
        var payload = extractPerson(model, store);
        return $.ajax({
            url: endpoint,
            data: payload,
            method: 'PUT'
        });
    },
    find: function() {
        var prefix = API_HOST + '/' + NAMESPACE;
        var store = this.get('store');
        $.ajax({
            url: prefix + '/admin/people/'
        }).then((response) => {
            Ember.run(() => {
                response.results.forEach((model) => {
                    store.push("person", model);
                });
            });
        });
        return store.find("person");
    },
    findById: function(id) {
        var prefix = API_HOST + '/' + NAMESPACE;
        var endpoint = prefix + '/admin/people/' + id + '/';
        var store = this.get('store');
        $.ajax({
            url: endpoint
        }).then((response) => {
            create_people_with_relationships(response, store, id);
        });
        return store.find("person", id);
    }
});
