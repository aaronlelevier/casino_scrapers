import Ember from 'ember';
import injectDeserializer from 'bsrs-ember/utilities/deserializer';

const { run } = Ember;

var extract_status = (model, store) => {
    const status = store.find('status', model.status);
    let existing_people = status.get('people') || [];
    existing_people = existing_people.indexOf(model.id) > -1 ? existing_people : existing_people.concat(model.id);
    store.push('status', {id: status.get('id'), people: existing_people});
    model.status_fk = status.get('id');
    delete model.status;
};

var extract_emails = function(model, store) {
    let email_fks = [];
    let emails = model.emails || [];
    emails.forEach((email) => {
        email_fks.push(email.id);
        email.model_fk = model.id;
        store.push('email', email);
    });
    delete model.emails;
    return email_fks;
};

var extract_phone_numbers = function(model, store) {
    let phone_number_fks = [];
    let phone_numbers = model.phone_numbers || [];
    phone_numbers.forEach((phone_number) => {
        phone_number_fks.push(phone_number.id);
        phone_number.model_fk = model.id;
        store.push('phonenumber', phone_number);
    });
    delete model.phone_numbers;
    return phone_number_fks;
};

var extract_addresses = function(model, store) {
    let address_fks = [];
    let addresses = model.addresses || [];
    addresses.forEach((address) => {
        address_fks.push(address.id);
        address.model_fk = model.id;
        // store.push('address-type', address.type);
        // address.type = address.type.id;
        store.push('address', address);
    });
    delete model.addresses;
    return address_fks;
};

var extract_role_location_level = function(model, store) {
    let role = store.find('role', model.role);
    if (role.get('id')) {
        let location_level = role.get('location_level');
        let location_level_pk = location_level.get('id');
        if(location_level_pk) {
            let role_pk = model.role;
            let location_level = store.find('location-level', location_level_pk);
            let existing_roles = location_level.get('roles') || [];
            if (existing_roles.indexOf(role_pk) === -1) {
                store.push('location-level', {id: location_level.get('id'), roles: existing_roles.concat(role_pk)});
                // location_level.set('roles', existing_roles.concat([role_pk]));
            }
            location_level.save();
            store.push('role', {id: role.get('id'), location_level_fk: location_level_pk});
            // role.set('location_level_fk', location_level_pk);
        }
        return location_level_pk;
    }
};

var extract_role = function(model, store) {
    let role_pk = model.role;
    let role = store.find('role', model.role);
    let location_level_fk = extract_role_location_level(model, store);
    let existing_people = role.get('people') || [];
    if (role.get('content') && existing_people.indexOf(model.id) === -1) {
        store.push('role', {id: role.get('id'), people: existing_people.concat(model.id)});
    }
    delete model.role;
    return [role_pk, location_level_fk];
};

var extract_person_location = function(model, store, location_level_fk, location_deserializer) {
    if (typeof model.locations !== 'undefined') {
        let server_locations_sum = [];
        let prevented_duplicate_m2m = [];
        let all_person_locations = store.find('person-location');
        let locations = model.locations || [];
        locations.forEach((location_json) => {
            let person_locations = all_person_locations.filter((m2m) => {
                return m2m.get('location_pk') === location_json.id && m2m.get('person_pk') === model.id;
            });
            if(person_locations.length === 0) {
                const pk = Ember.uuid();
                server_locations_sum.push(pk);
                location_deserializer.deserialize(location_json, location_json.id);
                run(() => {
                    store.push('person-location', {id: pk, person_pk: model.id, location_pk: location_json.id});
                });
            }else{
                prevented_duplicate_m2m.push(person_locations[0].get('id'));
            }
        });
        server_locations_sum.push(...prevented_duplicate_m2m);
        let m2m_to_remove = all_person_locations.filter(function(m2m) {
            return Ember.$.inArray(m2m.get('id'), server_locations_sum) < 0 && m2m.get('person_pk') === model.id;
        });
        m2m_to_remove.forEach(function(m2m) {
            run(() => {
                store.push('person-location', {id: m2m.get('id'), removed: true});
            });
        });
        delete model.locations;
        model.person_location_fks = server_locations_sum;
    }
};

var extract_locale = (model, store) => {
    const locale_id = model.locale || store.find('person', model.id).get('locale_fk');
    const locale = store.find('locale', locale_id);
    let existing_people = locale.get('people') || [];
    existing_people = existing_people.indexOf(model.id) > -1 ? existing_people : existing_people.concat(model.id);
    store.push('locale', {id: locale.get('id'), people: existing_people});
    model.locale_fk = locale.get('id');
    delete model.locale;
};

var PersonDeserializer = Ember.Object.extend({
    LocationDeserializer: injectDeserializer('location'),
    deserialize(response, options) {
        let location_deserializer = this.get('LocationDeserializer');
        if (typeof options === 'undefined') {
            return this.deserialize_list(response);
        } else {
            this.deserialize_single(response, options, location_deserializer);
        }
    },
    deserialize_single(model, id, location_deserializer) {
        let store = this.get('store');
        const person_check = store.find('person', id);
        let location_level_fk;
        if (!person_check.get('id') || person_check.get('isNotDirtyOrRelatedNotDirty')) {
            model.email_fks = extract_emails(model, store);
            model.phone_number_fks = extract_phone_numbers(model, store);
            model.address_fks = extract_addresses(model, store);
            [model.role_fk, location_level_fk] = extract_role(model, store);
            extract_person_location(model, store, location_level_fk, location_deserializer);
            extract_locale(model, store);
            extract_status(model, store);
            model.detail = true;
            const person = store.push('person', model);
            person.save();
        }
    },
    deserialize_list(response) {
        let store = this.get('store');
        let return_array = Ember.A();
        response.results.forEach((model) => {
            const person_check = store.find('person', model.id);
            if (!person_check.get('id') || person_check.get('isNotDirtyOrRelatedNotDirty')) {
                [model.role_fk] = extract_role(model, store);
                extract_status(model, store);
                model.grid = true;
                let person = store.push('person', model);
                person.save();
                return_array.pushObject(person);
            }else{
                return_array.pushObject(person_check);
            }
        });
        return return_array;
    }
});

export default PersonDeserializer;
