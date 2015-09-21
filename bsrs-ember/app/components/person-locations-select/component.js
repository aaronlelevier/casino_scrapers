import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';

var PersonLocationsSelect = Ember.Component.extend({
    repository: inject('location'),
    store: injectStore('main'),
    person_locations_selected: Ember.computed('person.person_locations.[]', function() {
        let person = this.get('person');
        return person.get('locations');
    }),
    options: Ember.computed('person_locations_selected.[]', 'all_locations.[]', function() {
        //options must be present for selected locations to populate selectize (line 586 contentArrayDidChange calls this._selectionDidChange();)
        //this bound array is updated when action getLocations is called and more locations are pushed into the store
        return this.get('store').find('location', {location_level_fk: this.get('person.location_level_pk')});
    }),
    all_locations: Ember.computed('person.location_level_pk', function() { 
        let repo = this.get('repository');
        let location_level_pk = this.get('person.location_level_pk');
        let search_criteria = this.get('search_criteria');
        return location_level_pk ? repo.findLocationSelect({location_level: location_level_pk}, search_criteria) : [];
    }),
    find_all_locations: function() {
        let locations = this.get('all_locations'); 
    },
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
        update_filter() {
            Ember.run.debounce(this, this.get('find_all_locations'), 300);
        }
    }
});

export default PersonLocationsSelect;
