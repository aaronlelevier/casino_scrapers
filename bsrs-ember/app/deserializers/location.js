import Ember from 'ember';

const { run } = Ember;

var extract_emails = function(model, store) {
    let email_fks = [];
    let emails = model.emails || [];
    emails.forEach((email) => {
        email_fks.push(email.id);
        email.model_fk = model.id;
        run(() => {
            store.push('email', email);
        });
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
        run(() => {
            store.push('phonenumber', phone_number);
        });
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
        store.push('address', address);
    });
    delete model.addresses;
    return address_fks;
};

let extract_location_level = (model, store) => {
    let location_level_pk = model.location_level;
    let existing_location_level = store.find('location-level', location_level_pk);
    let locations = existing_location_level.get('locations') || [];
    store.push('location-level', {id: location_level_pk, locations: locations.concat(model.id).uniq()});
    //get old location level from location already in store if only a different location level than current
    let existing_location = store.find('location', model.id); 
    let old_location_level_fk = existing_location.get('location_level_fk');
    if (old_location_level_fk && old_location_level_fk !== existing_location_level.get('id')) {
        let old_location_level = store.find('location-level', old_location_level_fk);
        let locations = old_location_level.get('locations');
        if (locations.indexOf(model.id) > -1) { locations.removeObject(model.id); }
        run(() => {
            store.push('location-level', {id: old_location_level_fk, locations: locations});
        });
        old_location_level.save();
    }
    delete model.location_level;
    return location_level_pk;
};

var extract_location_status = function(status, store, location) {
    if (location.get('detail') && location.get('status.id') !== status) {
        location.change_status(status);
    }else{
        const status_list = store.find('location-status-list', status.id);
        const status_locations = status_list.get('locations') || [];
        const updated_status_locations = status_locations.concat(location.get('id')).uniq();
        store.push('location-status-list', {id: status.id, name: status.name, locations: updated_status_locations});
    }
};

var extract_parents = function(model, store, location_deserializer) {
    const parents = model.parents || [];
    let prevented_duplicate_m2m = [];
    const server_sum = [];
    const all_location_parents = store.find('location-parents');
    parents.forEach((parent) => {
        const location_parents = all_location_parents.filter((m2m) => {
            return m2m.get('parent_pk') === parent.id && m2m.get('location_pk') === model.id;
        });
        if(location_parents.length === 0) {
            const pk = Ember.uuid();
            server_sum.push(pk);
            const parent_llevel_pk = extract_location_level(parent, store);
            Ember.set(parent, 'location_level_fk', parent_llevel_pk);
            run(() => {
                parent.status_fk = parent.status;
                delete parent.status;
                store.push('location', parent);
                store.push('location-parents', {id: pk, location_pk: model.id, parent_pk: parent.id});
            });
        }else{
            prevented_duplicate_m2m.push(location_parents[0].get('id'));
        }
    });
    server_sum.push(...prevented_duplicate_m2m);
    let m2m_to_remove = all_location_parents.filter((m2m) => {
        return Ember.$.inArray(m2m.get('id'), server_sum) < 0 && m2m.get('location_pk') === model.id;
    });
    m2m_to_remove.forEach((m2m) => {
        run(() => {
            store.push('location-parents', {id: m2m.get('id'), removed: true});
        });
    });
    delete model.parents;
    return server_sum;
};

var extract_children = function(model, store, location_deserializer) {
    const children = model.children || [];
    let prevented_duplicate_m2m = [];
    const server_sum = [];
    const all_location_children = store.find('location-children');
    children.forEach((child) => {
        const location_children = all_location_children.filter((m2m) => {
            return m2m.get('child_pk') === child.id && m2m.get('location_pk') === model.id;
        });
        if(location_children.length === 0) {
            const pk = Ember.uuid();
            server_sum.push(pk);
            const child_llevel_pk = extract_location_level(child, store);
            Ember.set(child, 'location_level_fk', child_llevel_pk);
            run(() => {
                //TODO: test this
                child.status_fk = child.status;
                delete child.status;
                store.push('location', child);
                store.push('location-children', {id: pk, location_pk: model.id, child_pk: child.id});
            });
        }else{
            prevented_duplicate_m2m.push(location_children[0].get('id'));
        }
    });
    server_sum.push(...prevented_duplicate_m2m);
    let m2m_to_remove = all_location_children.filter((m2m) => {
        return Ember.$.inArray(m2m.get('id'), server_sum) < 0 && m2m.get('location_pk') === model.id;
    });
    m2m_to_remove.forEach((m2m) => {
        run(() => {
            store.push('location-children', {id: m2m.get('id'), removed: true});
        });
    });
    delete model.children;
    return server_sum;
};

var LocationDeserializer = Ember.Object.extend({
    deserialize(response, options) {
        if (typeof options === 'undefined') {
            return this.deserialize_list(response);
        } else {
            return this.deserialize_single(response, options);
        }
    },
    deserialize_single(response, id) {
        const store = this.get('store');
        const existing = store.find('location', id);
        const location_deserializer = this;
        let location = existing;
        if (!existing.get('id') || existing.get('isNotDirtyOrRelatedNotDirty')) {
            response.email_fks = extract_emails(response, store);
            response.phone_number_fks = extract_phone_numbers(response, store);
            response.address_fks = extract_addresses(response, store);
            response.location_level_fk = extract_location_level(response, store);
            response.location_children_fks = extract_children(response, store, location_deserializer);
            response.location_parents_fks = extract_parents(response, store, location_deserializer);
            response.detail = true;
            location = store.push('location', response);
            location.save();
            extract_location_status(response.status_fk, store, location);
        }
        return location;
    },
    deserialize_list(response) {
        const store = this.get('store');
        let return_array = [];
        response.results.forEach((model) => {
            model.location_level_fk = extract_location_level(model, store);
            const status_json = model.status;
            delete model.status;
            const location = store.push('location-list', model);
            extract_location_status(status_json, store, location);
            return_array.push(location);
        });
        return return_array;
    }
});

export default LocationDeserializer;
