import Ember from 'ember';

export default Ember.Component.extend({
    actions: {
        changed(person, location_pk) {
            person.update_locations(location_pk);
        }
    }
});
