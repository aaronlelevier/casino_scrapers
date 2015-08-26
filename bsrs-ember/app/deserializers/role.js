import Ember from 'ember';

var extract_location_level = function(model, store) {
    var location_level_pk = model.location_level.id;
    var location_level = store.find('location-level', model.location_level);
    var existing_roles = location_level.get('roles') || [];
    location_level.set('roles', existing_roles.concat([model.id]));
    location_level.save();
    delete model.location_level;
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
        var store = this.get('store');
        response.location_level_fk = extract_location_level(response, store);
        var originalRole = store.push('role', response);
        originalRole.save();
    },
    deserialize_list(response) {
        response.results.forEach((model) => {
            var store = this.get('store');
            model.location_level_fk = extract_location_level(model, store);
            this.get('store').push('role', model);
        });
    }
});

export default RoleDeserializer;

