import Ember from 'ember';
import config from 'bsrs-ember/config/environment';

var PREFIX = config.APP.NAMESPACE;

var extractPhoneNumbers = function(phoneNumbers, store) {
    return phoneNumbers.map((phoneNumber) => {
        var phone_number_model = store.find('phonenumber', phoneNumber),
            number = phone_number_model.get('number'),
            type = phone_number_model.get('type');
        return {id: phoneNumber, number: number, type: type};
    });
};

var extractAddresses = function(addresses, store) {
    return addresses.map((address) => {
        var address_model = store.find('address', address),
            type = address_model.get('type'),
            addressLoc = address_model.get('address'),
            city = address_model.get('city'),
            state = address_model.get('state'),
            postal_code = address_model.get('postal_code'),
            country = address_model.get('country');
        return {id: address, type:type, address: addressLoc, city: city, state: state, postal_code: postal_code, country: country};
    });
};

var create_people_with_relationships = function(response, store, id) {
    Ember.run(() => {
        var phone_number_ids = [],
            address_ids = [];
            // phone_number_type_ids = [];
            // address_type_ids = [];
        response.phone_numbers.forEach((phone_number) => {
            store.push("phone-number-type", phone_number.type);
            phone_number.type = phone_number.type.id;
            phone_number.person_id = id;
            store.push("phonenumber", phone_number);
            phone_number_ids.push(phone_number.id);
        });
        response.phone_numbers = phone_number_ids;
        response.addresses.forEach((address) => {
            store.push("address-type", address.type);
            // store.push("state", address.state);
            // store.push("country", address.country);
            address.type = address.type.id;
            address.person_id = id;
            store.push("address", address);
            address_ids.push(address.id);
        });
        response.addresses = address_ids;
        store.push("person", response);
    });
};

var create_people_with_nested = function(model, store) {
    var phoneNumbers = extractPhoneNumbers(model.get('phone_numbers'), store);
    var addresses = extractAddresses(model.get('addresses'), store);
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
        'addresses': addresses,
        'emails': model.get('emails')
    };
};

export default Ember.Object.extend({
    save: function(model) {
        var endpoint = PREFIX + '/admin/people/' + model.get('id') + '/';
        var store = this.get('store');
        var payload = create_people_with_nested(model, store);
        return $.ajax({
            url: endpoint,
            data: payload,
            dataType: 'json',
            contentType: 'application/json',
            method: 'PUT'
        });
    },
    find() {
        var store = this.get('store');
        $.ajax({
            url: PREFIX + '/admin/people/'
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
        var endpoint = PREFIX + '/admin/people/' + id + '/';
        var store = this.get('store');
        $.ajax({
            url: endpoint
        }).then((response) => {
            create_people_with_relationships(response, store, id);
        });
        return store.find("person", id);
    }
});
