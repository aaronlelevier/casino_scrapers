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
    person_location_ids: Ember.computed('person_locations_selected.[]', function() {
        let person_locations = this.get('person_locations') || [];
        return person_locations.map((loc) => {
            return loc.get('id');
        });
    }),
    options: Ember.computed('person_location_ids.[]', 'locations_fetch.[]', function() {
        let store = this.get('store');
        let person_locations = this.get('person_locations');   
        let person_location_ids = this.get('person_location_ids');   
        let filter = function(location) {
            if (Ember.$.inArray(location.get('id'), person_location_ids) < 0) {
                return this.get('id') === location.get('person_fk');
            }
        };
        //this bound array is updated when action getLocations is called and more locations are pushed into the store
        return store.find('location', filter.bind(this), ['id']);
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
           let store = this.get('store'); 
           let locations = this.get('locations_fetch');
           locations.forEach((location) => {
               store.push('location', location);
           });
        }
    }
});

export default PersonLocationsSelect;
