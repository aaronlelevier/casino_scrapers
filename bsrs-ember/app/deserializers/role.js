import Ember from 'ember';

let extract_category = (model, store, role_existing) => {
    let category_fks = [];
    let categories = model.categories;
    //add
    if (categories) {
        categories.forEach((category) => {
            category_fks.push(category.id);
            let category_pushed = store.push('category', category);
            category_pushed.save();
        });
    }
    //remove
    // if (role_existing.get('id')) {
    //     let category_fks_existing = role_existing.get('category_fks'); 
    //     let model_categories_id = model.categories.map((cat) => {
    //         return cat.id;
    //     });
    //     category_fks_existing.forEach((fk, indx) => {
    //         if (Ember.$.inArray(fk, model_categories_id) === -1) {
    //             category_fks_existing.splice(indx, 1);
    //         }
    //     });
    //     role_existing.save();
    // }
    delete model.categories;
    return category_fks;
};

let extract_location_level = (model, store) => {
    let location_level_pk;
    if (model.location_level) {
        location_level_pk = model.location_level;
    } else {
        let role = store.find('role', model.id);
        if (role.get('location_level')) {
            role.set('location_level_fk', undefined);
            let location_level = role.get('location_level');
            let role_array = location_level.get('roles');
            let mutated_array = role_array.filter((role) => {
                return role !== model.id;
            });
            location_level.set('roles', mutated_array);
            location_level.save();
        }
        return undefined;
    }
    if(location_level_pk) {
        let location_level = store.find('location-level', model.location_level);
        let existing_roles = location_level.get('roles') || [];
        if (location_level.get('content') && existing_roles.indexOf(model.id) === -1) {
            location_level.set('roles', existing_roles.concat([model.id]));
            location_level.save();
        }
        delete model.location_level;
        model.location_level_fk = location_level_pk;
    }
    return location_level_pk;
};

var RoleDeserializer = Ember.Object.extend({
    deserialize(response, options) {
        if (typeof options === 'undefined') {
            this.deserialize_list(response);
        } else {
            this.deserialize_single(response, options);
        }
    },
    deserialize_single(response, id) {
        let store = this.get('store');
        let role_existing = store.find('role', id);
        if (!role_existing.get('id') || role_existing.get('isNotDirtyOrRelatedNotDirty')) {
            response.location_level_fk = extract_location_level(response, store);
            response.category_fks = extract_category(response, store, role_existing);
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
