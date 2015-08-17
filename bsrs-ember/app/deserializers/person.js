import Ember from 'ember';

var extract_role = function(model, store) {
    var role = store.push('role', model.role);
    var existing_people = role.get('people') || [];
    role.set('people', existing_people.concat([model.id]));
    role.save();
    delete model.role;
};

var PersonDeserializer = Ember.Object.extend({
    deserialize(response, options) {
        if (typeof options === 'undefined') {
            this.deserialize_list(response);
        } else {
            this.deserialize_single(response, options);
        }
    },
    deserialize_single(model, id) {
        var store = this.get('store');
        model.phone_numbers.forEach((phone_number) => {
            store.push('phonenumber', phone_number);
        });
        model.addresses.forEach((address) => {
            store.push('address-type', address.type);
            address.type = address.type.id;
            store.push('address', address);
        });
        extract_role(model, store);
        //discuss dirty attr for prop not included in the list
        //meaning ... if the user is dirty NOW what should do?
        delete model.phone_numbers;
        delete model.addresses;
        var originalPerson = store.push('person', model);
        originalPerson.save();
    },
    deserialize_list(response) {
        var store = this.get('store');
        response.results.forEach((model) => {
            extract_role(model, store);
            store.push('person', model);
        });
    }
});

export default PersonDeserializer;
