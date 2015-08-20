import Ember from 'ember';

var extract_location_level = function(model, store) {
    var location_level_pk = model.location_level.id;
    model.location_level.location_id = model.id;
    var location_level = store.push('location-level', model.location_level);
    var existing_locations = location_level.get('locations') || [];
    location_level.set('locations', existing_locations.concat([model.id]));
    location_level.save();
    delete model.location_level;
    return location_level_pk;
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
        var store = this.get('store');
        response.location_level_fk = extract_location_level(response, store);
        var originalLocation = store.push('location', response);
        originalLocation.save();
    },
    deserialize_list(response) {
        response.results.forEach((model) => {
            var store = this.get('store');
            model.location_level_fk = extract_location_level(model, store);
            this.get('store').push('location', model);
        });
    }
});

export default LocationDeserializer;

