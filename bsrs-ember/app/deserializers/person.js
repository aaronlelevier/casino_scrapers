import Ember from 'ember';
import inject from 'bsrs-ember/utilities/uuid';

var extract_phone_numbers = function(model, store) {
    let phone_number_fks = [];
    model.phone_numbers.forEach((phone_number) => {
        phone_number_fks.push(phone_number.id);
        phone_number.person_fk = model.id;
        store.push('phonenumber', phone_number);
    });
    delete model.phone_numbers;
    return phone_number_fks;
};

var extract_addresses = function(model, store) {
    let address_fks = [];
    model.addresses.forEach((address) => {
        address_fks.push(address.id);
        address.person_fk = model.id;
        // store.push('address-type', address.type);
        // address.type = address.type.id;
        store.push('address', address);
    });
    delete model.addresses;
    return address_fks;
};

var extract_role_location_level = function(model, store) {
    let role = store.find('role', model.role);
    let location_level = role.get('location_level');
    let location_level_pk = location_level.get('id');
    if(location_level_pk) {
        let role_pk = model.role;
        let location_level = store.find('location-level', location_level_pk);
        let existing_roles = location_level.get('roles') || [];
        if (existing_roles.indexOf(role_pk) === -1) {
            location_level.set('roles', existing_roles.concat([role_pk]));
        }
        location_level.save();
        role.set('location_level_fk', location_level_pk);
    }
};

var extract_role = function(model, store) {
    let role_pk = model.role;
    let role = store.find('role', model.role);
    extract_role_location_level(model, store);
    //var role = store.push('role', model.role);
    let existing_people = role.get('people') || [];
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

var extract_locale = function(model, store) {
    if(model.locale){
        let locale_pk = model.locale;
        let locale = store.find('locale', model.locale);
        model.locale = locale.get('locale');
        return locale_pk;
    }else{
        return '';
    }
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
        model.phone_number_fks = extract_phone_numbers(model, store);
        model.address_fks = extract_addresses(model, store);
        model.role_fk = extract_role(model, store);
        model.person_location_fks = extract_person_location(model, store, uuid);
        model.locale_fk = extract_locale(model, store);
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
