import Ember from 'ember';

let extract_location_level = (model, store) => {
    var location_level_pk = model.location_level.id;
    var location = store.find('location', model.id); 
    var location_level_fk = location.get('location_level_fk');
    var location_level_old = store.find('location-level', location_level_fk);
    var location_level_new = store.push('location-level', model.location_level);
    if (model.location_level.id === location_level_fk) {
        var existing_locations = location_level_new.get('locations') || [];
        if (existing_locations.indexOf(model.id) === -1) {
            location_level_new.set('locations', existing_locations.concat([model.id]));
        }
        location_level_new.save();
        delete model.location_level;
    } else {
        if (location_level_old.get('locations')) {
            var locations = location_level_old.get('locations');
            location_level_old.set('locations', locations.filter((loc) => {
                return loc !== model.id;
            }));
            location_level_old.save();
        }
        var new_locations = location_level_new.get('locations') || [];
        if (new_locations.indexOf(model.id) < 0) {
            location_level_new.set('locations', new_locations.concat([model.id]));
        }
        location_level_new.save();
        delete model.location_level;
    }
};

var LocationDeserializer = Ember.Object.extend({
    deserialize(response, options) {
        if (typeof options === 'undefined') {
            this.deserialize_list(response);
        } else {
            this.deserialize_single(response, options);
        }
    },
    deserialize_single(response, id) {
        let store = this.get('store');
        let existing_location = store.find('location', id);
        if (!existing_location.get('id') || existing_location.get('isNotDirtyOrRelatedNotDirty')) {
            extract_location_level(response, store);
            let location = store.push('location', response);
            location.save();
        }
    },
    deserialize_list(response) {
        response.results.forEach((model) => {
            let store = this.get('store');
            let existing_location = store.find('location', model.id);
            if (!existing_location.get('id') || existing_location.get('isNotDirtyOrRelatedNotDirty')) {
                extract_location_level(model, store);
                let location = this.get('store').push('location', model);
                location.save();
            }
        });
    }
});

export default LocationDeserializer;
