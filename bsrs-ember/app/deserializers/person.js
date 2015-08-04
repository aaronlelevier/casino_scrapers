import Ember from 'ember';

var PersonDeserializer = Ember.Object.extend({
    deserialize(response, options) {
        if (typeof options === 'undefined') {
            this.deserialize_list(response);
        } else {
            this.deserialize_single(response, options);
        }
    },
    deserialize_single(response, id) {
        var store = this.get('store');
        response.phone_numbers.forEach((phone_number) => {
            phone_number.person_id = id;
            store.push('phonenumber', phone_number);
        });
        response.addresses.forEach((address) => {
            store.push('address-type', address.type);
            address.type = address.type.id;
            address.person_id = id;
            store.push('address', address);
        });
        //discuss dirty attr for prop not included in the list
        //meaning ... if the user is dirty NOW what should do?
        delete response.phone_numbers;
        delete response.addresses;
        var originalPerson = store.push('person', response);
        originalPerson.save();
    },
    deserialize_list(response) {
        response.results.forEach((model) => {
            this.get('store').push('person', model);
        });
    }
});

export default PersonDeserializer;
