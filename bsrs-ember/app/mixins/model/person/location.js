import Ember from 'ember';

var run = Ember.run;

var LocationMixin = Ember.Mixin.create({
    location_level_pk: Ember.computed('role.id', function() {
        const role = this.get('role');
        if(role && role.get('id')) {
            let location_level = role.get('location_level');
            return location_level ? location_level.get('id') : undefined;
        }
    }),
    location_ids: Ember.computed('locations.[]', function() {
        return this.get('locations').mapBy('id');
    }),
    locations: Ember.computed('person_locations.[]', function() {
        const store = this.get('store');
        const person_locations = this.get('person_locations');
        let filter = function(location) {
            let location_pks = this.mapBy('location_pk');
            return Ember.$.inArray(location.get('id'), location_pks) > -1;
        };
        return store.find('location', filter.bind(person_locations));
    }),
    person_locations: Ember.computed(function() {
        const pk = this.get('id');
        const store = this.get('store');
        const filter = function(join_model) {
            return join_model.get('person_pk') === pk && !join_model.get('removed');
        };
        return store.find('person-location', filter);
    }),
    add_locations(location) {
        const pk = this.get('id');
        const store = this.get('store');
        const new_location = store.push('location', location);
        const location_pk = new_location.get('id');
        run(() => {
            store.push('person-location', {id: Ember.uuid(), person_pk: pk, location_pk: location_pk});
        });
    },
    remove_locations(location_pk) {
        let store = this.get('store');
        let m2m_pk = this.get('person_locations').filter((m2m) => {
            return m2m.get('location_pk') === location_pk;
        }).objectAt(0).get('id');
        run(() => {
            store.push('person-location', {id: m2m_pk, removed: true});
        });
    },
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
    rollbackLocations() {
        const store = this.get('store');
        const locations = this.get('locations');
        const previous_m2m_fks = this.get('person_location_fks');
        const m2m_array = store.find('person-location').toArray();
        const m2m_to_throw_out = m2m_array.filter(function(join_model) {
            return Ember.$.inArray(join_model.get('id'), previous_m2m_fks) < 0 && !join_model.get('removed');
        });
        run(function() {
            m2m_to_throw_out.forEach(function(join_model) {
                store.push('person-location', {id: join_model.get('id'), removed: true});
            });
            previous_m2m_fks.forEach(function(pk) {
                store.push('person-location', {id: pk, removed: undefined});
            });
        });
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
            m2m.forEach(function(join_model) {
                saved_m2m_pks.push(join_model.get('id'));
            });
        });
        run(function() {
            store.push('person', {id: person_id, person_location_fks: saved_m2m_pks});
        });
    }
});

export default LocationMixin;

