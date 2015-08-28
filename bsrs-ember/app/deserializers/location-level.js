import Ember from 'ember';

var LocationLevelDeserializer = Ember.Object.extend({
    deserialize(response, options) {
        if (typeof options === 'undefined') {
            this.deserialize_list(response);
        } else {
            this.deserialize_single(response, options);
        }
    },
    deserialize_single(response, id) {
        let store = this.get('store');
        if (response.children.length > 0) {
            response.children_fks = response.children;
        }
        delete response.children;
        store.push('location-level', response);
    },
    deserialize_list(response) {
        let store = this.get('store');
        response.results.forEach((model) => {
            if (model.children.length > 0) {
                model.children_fks = model.children;
            }
            delete model.children;
            store.push('location-level', model);
        });
    }
});

export default LocationLevelDeserializer;


