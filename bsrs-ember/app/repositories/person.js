import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'bsrs-ember/mixins/promise';

var PREFIX = config.APP.NAMESPACE;

var extractPhoneNumbers = (person_pk, store) => {
    var phone_numbers = store.find('phonenumber', {person_id: person_pk});
    return phone_numbers.map((phone_number) => {
        var id = phone_number.get('id');
        var number = phone_number.get('number');
        var type = phone_number.get('type');
        return {id: id, number: number, type: type};
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
    var address_ids = [];
    response.phone_numbers.forEach((phone_number) => {
        store.push('phone-number-type', phone_number.type);
        phone_number.type = phone_number.type.id;
        phone_number.person_id = id;
        store.push('phonenumber', phone_number);
    });
    response.addresses.forEach((address) => {
        store.push('address-type', address.type);
        // store.push('state', address.state);
        // store.push('country', address.country);
        address.type = address.type.id;
        address.person_id = id;
        store.push('address', address);
        address_ids.push(address.id);
    });
    response.addresses = address_ids;
    //discuss dirty attr for prop not included in the list
    //meaning ... if the user is dirty NOW what should do?
    delete response.phone_numbers;
    var originalPerson = store.push('person', response);
    originalPerson.save();
};

var create_people_with_nested = (model, store) => {
    var phoneNumbers = extractPhoneNumbers(model.get('id'), store);
    var addresses = extractAddresses(model.get('addresses'), store);
    return {data: {
        'id': model.get('id'),
        'username': model.get('username'),
        'first_name': model.get('first_name'),
        'middle_initial': model.get('middle_initial'),
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
        if (model.get('id')) {
            return this.update(model);
        } else {
            return this.insert(model);
        }
    },
    insert(model) {
        return PromiseMixin.xhr(PREFIX + '/admin/people/', 'POST', {data: model.serialize()}).then((response) => {
            model.set('id', response.id);
            model.save();
            model.savePhoneNumbers();
        });
    },
    update(model) {
        var store = this.get('store');
        var payload = create_people_with_nested(model, store);
        return PromiseMixin.xhr(PREFIX + '/admin/people/' + model.get('id') + '/', 'PUT', payload).then((response) => {
            model.save();
            model.savePhoneNumbers();
        });
    },
    find() {
        var store = this.get('store');
        PromiseMixin.xhr(PREFIX + '/admin/people/', 'GET').then((response) => {
            response.results.forEach((model) => {
                store.push('person', model);
            });
        });
        return store.find('person');
    },
    findById(id) {
        var store = this.get('store');
        PromiseMixin.xhr(PREFIX + '/admin/people/' + id + '/', 'GET').then((response) => {
            create_people_with_relationships(response, store, id);
        });
        return store.find('person', id);
    }
});
