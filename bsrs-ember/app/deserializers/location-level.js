import Ember from 'ember';

var LocationLevelDeserializer = Ember.Object.extend({
    deserialize(response, options) {
        if (typeof options === 'undefined') {
            return this.deserialize_list(response);
        } else {
            return this.deserialize_single(response, options);
        }
    },
    deserialize_single(response, id) {
        const store = this.get('store');
        const existing_location_level = store.find('location-level', id);
        let location_level = existing_location_level;
        if (!existing_location_level.get('id') || existing_location_level.get('isNotDirtyOrRelatedNotDirty')) {
            response.children_fks = response.children || [];
            response.parent_fks = response.parents || [];
            delete response.children;
            delete response.parents;
            response.detail = true;
            location_level = store.push('location-level', response);
            location_level.save();
        }
        return location_level;
    },
    deserialize_list(response) {
        const store = this.get('store');
        const return_array = [];
        response.results.forEach((model) => {
            const location_level = store.push('location-level-list', model);
            return_array.push(location_level);
        });
        return return_array;
    }
});

export default LocationLevelDeserializer;


