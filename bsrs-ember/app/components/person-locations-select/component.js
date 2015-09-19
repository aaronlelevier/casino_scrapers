import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';
import PersonLocationsMixin from 'bsrs-ember/mixins/person/locations';

var PersonLocationsSelect = Ember.Component.extend(PersonLocationsMixin, {
    repository: inject('location'),
    store: injectStore('main'),
    person_locations_selected: Ember.computed('person.person_locations.[]', function() {
        let person = this.get('person');
        return person.get('locations');
    }),
    options: Ember.computed('person_location_ids.[]', 'locations_fetch.[]', function() {
        //options must be present for selected locations to populate selectize (line 586 contentArrayDidChange calls this._selectionDidChange();)
        //this bound array is updated when action getLocations is called and more locations are pushed into the store
        return this.get('store').find('location');
    }),
    actions: {
        add(location) {
            //auto updates person's locations
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
           let store = this.get('store'); 
           let locations = this.get('locations_fetch');
           locations.forEach((location) => {
               store.push('location', location);
           });
        }
    }
});

export default PersonLocationsSelect;
