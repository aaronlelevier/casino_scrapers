import Ember from 'ember';

let extract_location_level = (model, store) => {
    if (model.location_level) {
        var location_level_pk = model.location_level.id;
        var location_level = store.push('location-level', model.location_level);
        var existing_locations = location_level.get('locations') || [];
        if (existing_locations.indexOf(model.id) === -1) {
            location_level.set('locations', existing_locations.concat([model.id]));
        }
        location_level.save();
        delete model.location_level;
        return location_level_pk;
    } else {
        var location = store.find('location', model.id); 
        var location_level_fk_del = location.get('location_level_fk');
        var location_level_old = store.find('location-level', location_level_fk_del);
        var locations = location_level_old.get('locations');
        var new_locations = locations.filter((location) => {
            return location !== model.id;
        });
        location_level_old.set('locations', new_locations);
        location_level_old.save();
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
        response.location_level_fk = extract_location_level(response, store) || undefined;
        let location = store.push('location', response);
        location.save();
    },
    deserialize_list(response) {
        response.results.forEach((model) => {
            let store = this.get('store');
            model.location_level_fk = extract_location_level(model, store) || undefined;
            let location = this.get('store').push('location', model);
            location.save();
        });
    }
});

export default LocationDeserializer;

