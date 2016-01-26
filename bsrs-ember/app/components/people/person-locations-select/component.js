import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import inject from 'bsrs-ember/utilities/inject';

var PersonLocationsSelect = Ember.Component.extend({
    repository: inject('location'),
    person_locations_selected: Ember.computed('person.person_locations.@each.removed', function() {
        let person = this.get('person');
        return person.get('locations');
    }),
    actions: {
        change_location(new_location_selection) {
            const person = this.get('person');
            const old_location_selection = person.get('locations');
            const old_location_ids = person.get('location_ids');
            const new_location_ids = new_location_selection.mapBy('id');
            new_location_selection.forEach((location) => {
                if (Ember.$.inArray(location.id, old_location_ids) < 0) {
                    person.add_locations(location);
                }
            });
            old_location_selection.forEach((old_location) => {
                if (Ember.$.inArray(old_location.get('id'), new_location_ids) < 0) {
                    person.remove_locations(old_location.get('id'));
                }
            }); 
        },
        update_filter(search) {
            const repo = this.get('repository');
            const model = this.get('person');
            return new Ember.RSVP.Promise((resolve, reject) => {
                Ember.run.later(() => {
                    if (Ember.isBlank(search)) { return resolve([]); }
                    resolve(repo.findLocationSelect({location_level: model.get('location_level_pk')}, search));
                }, config.DEBOUNCE_TIMEOUT_INTERVAL);
            });
        }
    }
});

export default PersonLocationsSelect;
