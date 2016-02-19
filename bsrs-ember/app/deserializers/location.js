import Ember from 'ember';
import { belongs_to_extract, belongs_to_extract_contacts } from 'bsrs-components/repository/belongs-to';

const { run } = Ember;

var extract_location_level = (model, store) => {
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
            response.email_fks = belongs_to_extract_contacts(response, store, 'email', 'emails');
            response.phone_number_fks = belongs_to_extract_contacts(response, store, 'phonenumber', 'phone_numbers');
            response.address_fks = belongs_to_extract_contacts(response, store, 'address', 'addresses');
            response.location_level_fk = extract_location_level(response, store);
            response.location_children_fks = extract_children(response, store, location_deserializer);
            response.location_parents_fks = extract_parents(response, store, location_deserializer);
            response.detail = true;
            location = store.push('location', response);
            location.save();
            belongs_to_extract(response.status_fk, store, location, 'status', 'location', 'locations');
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
            belongs_to_extract(status_json, store, location, 'status', 'location', 'locations');
            return_array.push(location);
        });
        return return_array;
    }
});

export default LocationDeserializer;
