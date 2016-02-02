import Ember from 'ember';
import { many_to_many, many_to_many_ids, many_to_many_dirty, many_to_many_rollback, many_to_many_save, add_many_to_many, remove_many_to_many, many_models, many_models_ids } from 'bsrs-components/attr/many-to-many';

var run = Ember.run;

var LocationMixin = Ember.Mixin.create({
    location_level_pk: Ember.computed('role.id', function() {
        const role = this.get('role');
        if(role && role.get('id')) {
            let location_level = role.get('location_level');
            return location_level ? location_level.get('id') : undefined;
        }
    }),
    location_ids: many_to_many_ids('locations'),
    locations: many_models('person_locations', 'location_pk', 'location'),
    person_locations: many_to_many('person-location', 'person_pk'),
    add_locations(location) {
        const pk = this.get('id');
        const store = this.get('store');
        const new_location = store.push('location', location);
        const location_pk = new_location.get('id');
        run(() => {
            store.push('person-location', {id: Ember.uuid(), person_pk: pk, location_pk: location_pk});
        });
    },
    remove_locations: remove_many_to_many('person-location', 'location_pk', 'person_locations'),
    locationsIsNotDirty: Ember.computed.not('locationsIsDirty'),
    locationsIsDirty: Ember.computed('person_location_fks.[]', 'locations.@each.isDirty', function() {
        const locations = this.get('locations');
        const previous_m2m_fks = this.get('person_location_fks');
        if(locations.get('length') > 0) {
            if(!previous_m2m_fks || previous_m2m_fks.get('length') !== locations.get('length')) {
                return true;
            }
            const dirty_locations = locations.filter(function(location) {
                return location.get('isDirty') === true;
            });
            return dirty_locations.length > 0;
        }
        if(previous_m2m_fks && previous_m2m_fks.get('length') > 0) {
            return true;
        }
        return false;
    }),
    saveLocations() {
        this.resetPersonLocationFks({save: true});
    },
    rollbackLocationsContainer: many_to_many_rollback('person-location', 'person_location_fks', 'person_pk'),
    rollbackLocations() {
        this.rollbackLocationsContainer();
        this.resetPersonLocationFks();
    },
    resetPersonLocationFks(options) {
        let saved_m2m_pks = [];
        const person_id = this.get('id');
        const store = this.get('store');
        const locations = this.get('locations');
        locations.forEach((location) => {
            if(options && options.save === true) {
                location.save();
            }
            const m2m_array = store.find('person-location').toArray();
            const m2m = m2m_array.filter(function(location_model, join_model) {
                const removed = join_model.get('removed');
                const person_pk = join_model.get('person_pk');
                const location_pk = join_model.get('location_pk');
                return person_pk === this.get('id') &&
                    location_pk === location_model.get('id') && !removed;
            }.bind(this, location));
            m2m.forEach((join_model) => {
                saved_m2m_pks.push(join_model.get('id'));
            });
        });
        run(() => {
            store.push('person', {id: person_id, person_location_fks: saved_m2m_pks});
        });
    }
});

export default LocationMixin;

