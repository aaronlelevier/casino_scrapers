import Ember from 'ember';

let extract_location_level = (model, store) => {
    let location_level_pk = model.location_level.id;
    let location_level = store.find('location-level', model.location_level);
    let existing_roles = location_level.get('roles') || [];
    if (existing_roles.indexOf(model.id) === -1) {
        location_level.set('roles', existing_roles.concat([model.id]));
    }
    location_level.save();
    delete model.location_level;
    return location_level_pk;
};

let RoleDeserializer = Ember.Object.extend({
    deserialize(response, options) {
        if (typeof options === 'undefined') {
            this.deserialize_list(response);
        } else {
            this.deserialize_single(response, options);
        }
    },
    deserialize_single(response, id) {
        let store = this.get('store');
        response.location_level_fk = extract_location_level(response, store);
        let originalRole = store.push('role', response);
        originalRole.save();
    },
    deserialize_list(response) {
        response.results.forEach((model) => {
            let store = this.get('store');
            model.location_level_fk = extract_location_level(model, store);
            this.get('store').push('role', model);
        });
    }
});

export default RoleDeserializer;

