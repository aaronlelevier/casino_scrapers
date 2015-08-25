import Ember from 'ember';
import inject from 'bsrs-ember/utilities/uuid';

var extract_role = function(model, store) {
    var role_pk = model.role.id;
    var role = store.push('role', model.role);
    var existing_people = role.get('people') || [];
    role.set('people', existing_people.concat([model.id]));
    role.save();
    delete model.role;
    return role_pk;
};

var extract_person_location = function(model, store, uuid) {
    let newly_added_m2m = [];
    let person_location_fks = [];
    let prevented_duplicate_m2m = [];
    let all_person_locations = store.find('person-location');
    model.locations.forEach((location_json) => {
        let person_locations = all_person_locations.filter((m2m) => {
            return m2m.get('location_pk') === location_json.id && m2m.get('person_pk') === model.id;
        });
        if(person_locations.length === 0) {
            let pk = uuid.v4();
            newly_added_m2m.push(pk);
            store.push('location', location_json);
            store.push('person-location', {id: pk, person_pk: model.id, location_pk: location_json.id});
        }else{
            prevented_duplicate_m2m.push(person_locations[0].get('id'));
        }
    });

    let server_locations_sum = newly_added_m2m.concat(prevented_duplicate_m2m);
    let m2m_to_remove = all_person_locations.filter(function(m2m) {
        return Ember.$.inArray(m2m.get('id'), server_locations_sum) < 0;
    });

    m2m_to_remove.forEach(function(m2m) {
        store.push('person-location', {id: m2m.get('id'), removed: true, person_pk: m2m.get('person_pk'), location_pk: m2m.get('location_pk')});
    });

    delete model.locations;
    return server_locations_sum;
};

var PersonDeserializer = Ember.Object.extend({
    uuid: inject('uuid'),
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
        model.role_fk = extract_role(model, store);
        //discuss dirty attr for prop not included in the list
        //meaning ... if the user is dirty NOW what should do?
        delete model.phone_numbers;
        delete model.addresses;
        var originalPerson = store.push('person', model);
        originalPerson.save();
    },
    deserialize_list(response) {
        let uuid = this.get('uuid');
        let store = this.get('store');
        response.results.forEach((model) => {
            model.role_fk = extract_role(model, store);
            model.person_location_fks = extract_person_location(model, store, uuid);

            var person = store.push('person', model);
            person.save();
            person.saveRelated();
        });
    }
});

export default PersonDeserializer;
