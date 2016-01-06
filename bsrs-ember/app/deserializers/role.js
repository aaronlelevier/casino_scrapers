import Ember from 'ember';
import inject from 'bsrs-ember/utilities/uuid';
import injectDeserializer from 'bsrs-ember/utilities/deserializer';

let extract_category = (model, store, role_existing, uuid, category_deserializer) => {
    let server_sum_category_fks = [];
    let prevented_duplicate_m2m = [];
    let all_join_models = store.find('role-category', {role_fk: model.id});
    let categories = model.categories || [];
    let all_filtered_models = [];
    categories.forEach((category_json) => {
        let filtered_model = all_join_models.filter((m2m) => {
            return m2m.get('category_fk') === category_json.id;
        });
        if (filtered_model.length === 0) {
            category_deserializer.deserialize(category_json, category_json.id);
            let pk = uuid.v4();
            server_sum_category_fks.push(pk);  
            store.push('role-category', {id: pk, role_fk: model.id, category_fk: category_json.id});
        } else {
            prevented_duplicate_m2m.push(filtered_model[0].get('id'));
        }
        all_filtered_models.concat(filtered_model);
    });
    server_sum_category_fks.push(...prevented_duplicate_m2m);
    //check for join models not returned from server with categories
    all_filtered_models.forEach((join_model) => {
        if (Ember.$.inArray(join_model.get('id'), server_sum_category_fks) === -1) {
            store.push('role-category', {id: join_model.get('id'), removed: true});
        }
    });
    //check for join models not returned from server with no categories
    all_join_models.forEach((join_model) => {
        if (Ember.$.inArray(join_model.get('id'), server_sum_category_fks) === -1) {
            store.push('role-category', {id: join_model.get('id'), removed: true});
        }
    });
    delete model.categories;
    return server_sum_category_fks;
};

let extract_location_level = (model, store) => {
    let location_level_pk;
    let fk = model.location_level || model.location_level_fk;//
    if (fk) {
        location_level_pk = fk;//
    } else {
        let role = store.find('role', model.id);
        if (role.get('location_level')) {
            store.push('role', {id: role.get('id'), location_level_fk: undefined});
            // role.set('location_level_fk', undefined);
            let location_level = role.get('location_level');
            let role_array = location_level.get('roles');
            let mutated_array = role_array.filter((role) => {
                return role !== model.id;
            });
            store.push('location-level', {id: location_level.get('id'), roles: mutated_array});
            // location_level.set('roles', mutated_array);
            location_level.save();
        }
        return undefined;
    }
    if(location_level_pk) {
        let location_level = store.find('location-level', fk);//
        let existing_roles = location_level.get('roles') || [];
        if (location_level.get('content') && existing_roles.indexOf(model.id) === -1) {
            store.push('location-level', {id: location_level.get('id'), roles: existing_roles.concat(model.id)});
            // location_level.set('roles', existing_roles.concat([model.id]));
            location_level.save();
        }
        delete model.location_level;
        model.location_level_fk = location_level_pk;
    }
    return location_level_pk;
};

var RoleDeserializer = Ember.Object.extend({
    uuid: inject('uuid'),
    CategoryDeserializer: injectDeserializer('category'),
    deserialize(response, options) {
        let category_deserializer = this.get('CategoryDeserializer');
        if (typeof options === 'undefined') {
            this.deserialize_list(response);
        } else {
            this.deserialize_single(response, options, category_deserializer);
        }
    },
    deserialize_single(response, id, category_deserializer) {
        let uuid = this.get('uuid');
        let store = this.get('store');
        let role_existing = store.find('role', id);
        if (!role_existing.get('id') || role_existing.get('isNotDirtyOrRelatedNotDirty')) {
            response.location_level_fk = extract_location_level(response, store);
            response.role_category_fks = extract_category(response, store, role_existing, uuid, category_deserializer);
            let originalRole = store.push('role', response);
            originalRole.save();
        }
    },
    deserialize_list(response) {
        response.results.forEach((model) => {
            let store = this.get('store');
            let role_check = store.find('role', model.id);
            if (!role_check.get('id') || role_check.get('isNotDirtyOrRelatedNotDirty')) {
                model.location_level_fk = extract_location_level(model, store);
                let originalRole = this.get('store').push('role', model);
                originalRole.save();
            }
        });
    }
});

export default RoleDeserializer;
