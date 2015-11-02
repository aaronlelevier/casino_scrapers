import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var LocationLevelComponent = Ember.Component.extend({
    repository: inject('location-level'),
    classNames: ['wrapper', 'form'],
    available_location_levels: Ember.computed(function() {
        const repository = this.get('repository');
        const location_level_id = this.get('model.id');
        const filter = (location_level) => {
            return location_level.get('id') !== location_level_id;
        };
        return repository.peek(filter, ['id']);
    }),
    available_location_level_names: Ember.computed('available_location_levels.[]', function() {
        const available_location_levels = this.get('available_location_levels');
        const name_arr = [];
        available_location_levels.forEach((loc_level) => {
            name_arr.push(loc_level.get('name'));
        });
        return name_arr;
    }),
});

export default LocationLevelComponent;

