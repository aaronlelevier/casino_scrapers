import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'bsrs-ember/mixins/promise';

var PREFIX = config.APP.NAMESPACE;

var extractPhoneNumbers = (phoneNumbers, store) => {
    return phoneNumbers.map((phoneNumber) => {
        var phone_number_model = store.find('phonenumber', phoneNumber),
            number = phone_number_model.get('number'),
            type = phone_number_model.get('type');
        return {id: phoneNumber, number: number, type: type};
    });
};

var extractAddresses = (addresses, store) => {
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

var create_people_with_relationships = (response, store, id) => {
    var phone_number_ids = [],
        address_ids = [];
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
    //discuss dirty attr for prop not included in the list
    //meaning ... if the user is dirty NOW what should do?
    var originalPerson = store.push("person", response);
    originalPerson.save();
};

var create_people_with_nested = (model, store) => {
    var phoneNumbers = extractPhoneNumbers(model.get('phone_numbers'), store);
    var addresses = extractAddresses(model.get('addresses'), store);
    return {data: {
        'id': model.get('id'),
        'username': model.get('username'),
        'first_name': model.get('first_name'),
        'last_name': model.get('last_name'),
        'title': model.get('title'),
        'emp_number': model.get('emp_number'),
        'auth_amount': model.get('auth_amount'),
        'status': model.get('status').id,
        'role': model.get('role').id,
        'phone_numbers': phoneNumbers,
        'addresses': addresses,
        'acceptassign': model.get('acceptassign'),
        'emails': model.get('emails')
    }};
};

export default Ember.Object.extend({
    save(model) {
        var store = this.get('store');
        var payload;
        if (model.get('id')) {
            payload = create_people_with_nested(model, store);
            return PromiseMixin.xhr(PREFIX + '/admin/people/' + model.get('id') + '/', 'PUT', payload).then((response) => {
                model.save();
                model.savePhoneNumbers();
            });
        } else {
            payload = {data: {
                "username":model.get('username'),
                "password":model.get('password'),
                "first_name":model.get('first_name'),
                "last_name":model.get('last_name'),
                "email":model.get('email'),
                "role":1,
                "status":1,
                "location":"",
                "phone_numbers":[],
                "addresses":[],
            }};
            //payload = {data: {username: model.get('username'), password: model.get('password'), email: model.get('email'), role: parseInt(model.get('role'))}}; 
            return PromiseMixin.xhr(PREFIX + '/admin/people/', 'POST', payload).then((response) => {
                store.push('person', response);
            });
        }
    },
    find() {
        var store = this.get('store');
        PromiseMixin.xhr(PREFIX + '/admin/people/', 'GET').then((response) => {
            response.results.forEach((model) => {
                store.push("person", model);
            });
        });
        return store.find("person");
    },
    findById(id) {
        var store = this.get('store');
        PromiseMixin.xhr(PREFIX + '/admin/people/' + id + '/', 'GET').then((response) => {
            create_people_with_relationships(response, store, id);
        });
        return store.find("person", id);
    }
});
