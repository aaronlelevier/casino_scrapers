import Ember from 'ember';

export default Ember.Component.extend({
    location_ids: Ember.computed('person.person_locations.[]', function() {
        let person = this.get('person');
        return person.get('locations');
    }),
    actions: {
        add(location) {
            let person = this.get('person');
            let location_pk = location.get('id');
            person.update_locations(location_pk);
        },
        remove(location) {
            let person = this.get('person');
            let location_pk = location.get('id');
            person.remove_location(location_pk);
        }
    }
});
