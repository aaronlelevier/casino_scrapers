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
        const store = this.get('store');
        const existing_location_level = store.find('location-level', id);
        if (!existing_location_level.get('id') || existing_location_level.get('isNotDirtyOrRelatedNotDirty')) {
            response.children_fks = response.children || [];
            response.parent_fks = response.parents || [];
            delete response.children;
            delete response.parents;
            response.detail = true;
            const location_level = store.push('location-level', response);
            location_level.save();
        }
    },
    deserialize_list(response) {
        const store = this.get('store');
        response.results.forEach((model) => {
            const location_level = store.push('location-level-list', model);
        });
    }
});

export default LocationLevelDeserializer;


