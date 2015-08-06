import Ember from 'ember';

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
        store.push('location_level', {id: response.location_level, location_id: response.id});
        delete response.location_level;
        var originalLocation = store.push('location', response);
        originalLocation.save();
    },
    deserialize_list(response) {
        response.results.forEach((model) => {
            this.get('store').push('location', model);
        });
    }
});

export default LocationDeserializer;

