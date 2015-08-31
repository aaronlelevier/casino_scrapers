import Ember from 'ember';

export default Ember.Component.extend({
    location_ids: Ember.computed('model.[]', {
        get(key) {
            let selected_locations = this.get('selected_locations') || [];
            let locations = this.get('model');
            if(locations && locations.get('length') > 0) {
                this.get('model').forEach(function(location) {
                    selected_locations.pushObject(location);
                });
            }
            return selected_locations;
        },
        set(key, value) {
            let selected_locations = this.get('selected_locations') || [];
            selected_locations.pushObject(location);
            return selected_locations;
        }
    }),
    actions: {
        change(location) {
            let person = this.get('person');
            let location_pk = location.get('id');
            person.update_locations(location_pk);
        }
    }
});
