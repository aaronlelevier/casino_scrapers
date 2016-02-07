import Ember from 'ember';

var LocationLevelDeserializer = Ember.Object.extend({
    deserialize(response, options) {
        if (typeof options === 'undefined') {
            return this.deserialize_list(response);
        } else {
            this.deserialize_single(response, options);
        }
    },
    deserialize_single(response, id) {
        let store = this.get('store');
        let existing_location_level = store.find('location-level', id);
        if (!existing_location_level.get('id') || existing_location_level.get('isNotDirtyOrRelatedNotDirty')) {
            response.children_fks = response.children || [];
            response.parent_fks = response.parents || [];
            delete response.children;
            delete response.parents;
            response.detail = true;
            let location_level = store.push('location-level', response);
            location_level.save();
        }
    },
    deserialize_list(response) {
        let store = this.get('store');
        let return_array = Ember.A();
        response.results.forEach((model) => {
            let existing = store.find('location-level', model.id);
            if (!existing.get('id') || existing.get('isNotDirtyOrRelatedNotDirty')) {
                model.grid = true;
                let location_level = store.push('location-level', model);
                location_level.save();
                return_array.pushObject(location_level);
            }else{
                return_array.pushObject(existing);
            }
        });
        return return_array;
    }
});

export default LocationLevelDeserializer;


