import Ember from 'ember';
import inject from 'bsrs-ember/utilities/uuid';

var extract_phone_numbers = function(model, store) {
    model.phone_numbers.forEach((phone_number) => {
        store.push('phonenumber', phone_number);
    });
    delete model.phone_numbers;
};

var extract_addresses = function(model, store) {
    model.addresses.forEach((address) => {
        store.push('address-type', address.type);
        address.type = address.type.id;
        store.push('address', address);
    });
    delete model.addresses;
};

var extract_role_location_level = function(model, store) {
    let location_level_pk = model.role.location_level;
    if(location_level_pk) {
        let role_pk = model.role.id;
        let location_level = store.find('location-level', location_level_pk);
        let existing_roles = location_level.get('roles') || [];
        if (existing_roles.indexOf(role_pk) === -1) {
            location_level.set('roles', existing_roles.concat([role_pk]));
        }
        location_level.save();
        delete model.role.location_level;
        model.role.location_level_fk = location_level_pk;
    }
};

var extract_role = function(model, store) {
    var role_pk = model.role.id;
    extract_role_location_level(model, store);
    var role = store.push('role', model.role);
    var existing_people = role.get('people') || [];
    if (existing_people.indexOf(model.id) === -1) {
        role.set('people', existing_people.concat([model.id]));
    }
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
        store.push('person-location', {id: m2m.get('id'), removed: true});
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
        let uuid = this.get('uuid');
        let store = this.get('store');
        extract_phone_numbers(model, store);
        extract_addresses(model, store);
        model.role_fk = extract_role(model, store);
        model.person_location_fks = extract_person_location(model, store, uuid);
        let person = store.push('person', model);
        person.save();
    },
    deserialize_list(response) {
        let store = this.get('store');
        response.results.forEach((model) => {
            model.role_fk = extract_role(model, store);
            let person = store.push('person', model);
            person.save();
        });
    }
});

export default PersonDeserializer;
