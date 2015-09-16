import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';

var PersonLocationsSelect = Ember.Component.extend({
    repository: inject('location'),
    store: injectStore('main'),
    location_ids: Ember.computed('person.person_locations.[]', function() {
        let person = this.get('person');
        return person.get('locations');
    }),
    actions: {
        add(location) {
            let person = this.get('person');
            let location_pk = location.get('id');
            person.add_locations(location_pk);
        },
        remove(location) {
            let person = this.get('person');
            let location_pk = location.get('id');
            person.remove_location(location_pk);
        },
        getLocations() {
           let repository = this.get('repository'); 
           let store = this.get('store'); 
           let locations = repository.find();
           locations.forEach((location) => {
               store.push('location', location);
           });
        }
    }
});

export default PersonLocationsSelect;
