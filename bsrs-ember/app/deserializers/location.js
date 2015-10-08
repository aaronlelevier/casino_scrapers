import Ember from 'ember';
import injectDeserializer from 'bsrs-ember/utilities/deserializer';

let extract_location_level = (model, store, location_level_deserializer) => {
    let location_level_pk = model.location_level.id;  
    let existing_location_level = store.find('location-level', location_level_pk);
    //if existing location level
    if (existing_location_level.get('content')) {
        let locations = existing_location_level.get('locations') || [];//bootstrapped location levels will not have locations
        if (locations.indexOf(model.id) < 0) { locations.pushObject(model.id); }
        existing_location_level.set('locations', locations);
        existing_location_level.save();
    } else {
        //if no location level
        model.location_level.locations = [model.id];
        let location_level_push = store.push('location-level', model.location_level); 
        location_level_deserializer.deserialize(model.location_level, model.location_level.id);
    }
    //get old location level from location already in store if only a different location level than current
    let existing_location = store.find('location', model.id); 
    let old_location_level_fk = existing_location.get('location_level_fk');
    if (old_location_level_fk && old_location_level_fk !== existing_location_level.get('id')) {
        let old_location_level = store.find('location-level', old_location_level_fk);
        let locations = old_location_level.get('locations');
        if (locations.indexOf(model.id) > -1) { locations.removeObject(model.id); }
        old_location_level.set('locations', locations);
        old_location_level.save();
    }
    delete model.location_level;
    return location_level_pk;
};

var LocationDeserializer = Ember.Object.extend({
    LocationLevelDeserializer: injectDeserializer('location-level'),
    deserialize(response, options) {
        let location_level_deserializer = this.get('LocationLevelDeserializer');
        if (typeof options === 'undefined') {
            this.deserialize_list(response, location_level_deserializer);
        } else {
            this.deserialize_single(response, options, location_level_deserializer);
        }
    },
    deserialize_single(response, id, location_level_deserializer) {
        let store = this.get('store');
        let existing_location = store.find('location', id);
        if (!existing_location.get('id') || existing_location.get('isNotDirtyOrRelatedNotDirty')) {
            response.location_level_fk = extract_location_level(response, store, location_level_deserializer);
            let location = store.push('location', response);
            location.save();
        }
    },
    deserialize_list(response, location_level_deserializer) {
        response.results.forEach((model) => {
            let store = this.get('store');
            let existing_location = store.find('location', model.id);
            if (!existing_location.get('id') || existing_location.get('isNotDirtyOrRelatedNotDirty')) {
                model.location_level_fk = extract_location_level(model, store, location_level_deserializer);
                let location = store.push('location', model);
                location.save();
            }
        });
    }
});

export default LocationDeserializer;
