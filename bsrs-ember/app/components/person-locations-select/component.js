import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';

var PersonLocationsSelect = Ember.Component.extend({
    repository: inject('location'),
    store: injectStore('main'),
    person_locations_selected: Ember.computed('person.person_locations.[]', 'person.person_locations.@each.removed', 'person.location_level_pk', function() {
        let person = this.get('person');
        return person.get('locations');
    }),
    options: Ember.computed('person_locations_selected.[]', 'search', function() {
        return this.get('person_locations_children') && this.get('person_locations_children').get('length') > 0 ? this.get('person_locations_children') : this.get('person_locations_selected');
    }),
    find_all_locations: function() {
        let search_criteria = this.get('search_criteria');
        if (search_criteria) {
           this.set('search', search_criteria);
        }
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
