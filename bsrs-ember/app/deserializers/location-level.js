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
        let existing_location_level = store.find('location-level', id);
        if (!existing_location_level.get('id') || existing_location_level.get('isNotDirtyOrRelatedNotDirty')) {
            response.children_fks = response.children || [];
            delete response.children;
            let location_level = store.push('location-level', response);
            location_level.save();
        }
    },
    deserialize_list(response) {
        let store = this.get('store');
        response.results.forEach((model) => {
            let existing_location_level = store.find('location-level', model.id);
            if (!existing_location_level.get('id') || existing_location_level.get('isNotDirtyOrRelatedNotDirty')) {
                model.children_fks = model.children || [];
                delete model.children;
                let location_level = store.push('location-level', model);
                location_level.save();
            }
        });
    }
});

export default LocationLevelDeserializer;


