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
            store.push('phonenumber', phone_number);
        });
        response.addresses.forEach((address) => {
            store.push('address-type', address.type);
            address.type = address.type.id;
            store.push('address', address);
        });
        response.role.people = [id];
        var role = store.push('role', response.role);
        role.save();
        //discuss dirty attr for prop not included in the list
        //meaning ... if the user is dirty NOW what should do?
        delete response.phone_numbers;
        delete response.addresses;
        delete response.role;
        var originalPerson = store.push('person', response);
        originalPerson.save();
    },
    deserialize_list(response) {
        var store = this.get('store');
        response.results.forEach((model) => {
            //var role = store.find('role', model.role); //assuming role is FK
            //var related = role.get('people') || [];
            //var all_people = related.contact([model.id]);
            //model.role.people = all_people
            //store.push('role', model.role);
            //delete model.role;
            
            model.role.people = [model.id];
            var role = store.push('role', model.role);
            role.save();
            delete model.role;
            this.get('store').push('person', model);
        });
    }
});

export default PersonDeserializer;
