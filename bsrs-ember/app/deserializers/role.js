import Ember from 'ember';

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
        response.categories.forEach((category) => {
            category.role_id = id;
            store.push('category', category);
        });
        delete response.categories;
        var originalRole = store.push('role', response);
        originalRole.save();
    },
    deserialize_list(response) {
        response.results.forEach((model) => {
            this.get('store').push('role', model);
        });
    }
});

export default RoleDeserializer;

