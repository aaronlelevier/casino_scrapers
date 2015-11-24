import Ember from 'ember';

var PersonLocationsSelect = Ember.Component.extend({
    person_locations_selected: Ember.computed('person.person_locations.@each.removed', function() {
        let person = this.get('person');
        return person.get('locations');
    }),
    options: Ember.computed('person_locations_children.[]', 'person_locations_selected.[]', 'search', function() {
        let options = this.get('person_locations_children');
        if (options && options.get('length') > 0) {
            return options;
        }
    }),
    find_all_locations(search) {
        this.set('search', search);
    },
    actions: {
        change_location(new_location_selection) {
            const person = this.get('person');
            const old_location_selection = person.get('locations');
            const old_location_ids = person.get('location_ids');
            const new_location_ids = new_location_selection.mapBy('id');
            new_location_selection.forEach((location) => {
                if (Ember.$.inArray(location.get('id'), old_location_ids) < 0) {
                    person.add_locations(location.get('id'));
                }
            });
            old_location_selection.forEach((old_location) => {
                if (Ember.$.inArray(old_location.get('id'), new_location_ids) < 0) {
                    person.remove_locations(old_location.get('id'));
                }
            }); 
        },
        update_filter(search) {
            Ember.run.debounce(this, this.get('find_all_locations'), search, 300);
        }
    }
});

export default PersonLocationsSelect;
