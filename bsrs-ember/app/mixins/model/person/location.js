import Ember from 'ember';

var LocationMixin = Ember.Mixin.create({
    location_level_pk: Ember.computed('role.id', function() {
        let role = this.get('role');
        if(role && role.get('id')) {
            let location_level = role.get('location_level');
            return location_level ? location_level.get('id') : undefined;
        }
    }),
    location_ids: Ember.computed('locations.[]', function() {
        return this.get('locations').map((location) => {
            return location.get('id');
        });
    }),
    locations: Ember.computed('person_locations.[]', function() {
        let store = this.get('store');
        let person_locations = this.get('person_locations');
        let filter = function(location) {
            let location_pks = this.map(function(join_model) {
                return join_model.get('location_pk');
            });
            return Ember.$.inArray(location.get('id'), location_pks) > -1;
        };
        return store.find('location', filter.bind(person_locations), ['id']);
    }),
    person_locations: Ember.computed(function() {
        let store = this.get('store');
        let filter = function(join_model) {
            return join_model.get('person_pk') === this.get('id') && !join_model.get('removed');
        };
        return store.find('person-location', filter.bind(this), ['removed']);
    }),
    add_locations(location_pk) {
        let store = this.get('store');
        let uuid = this.get('uuid');
        store.push('person-location', {id: uuid.v4(), person_pk: this.get('id'), location_pk: location_pk});
    },
    remove_location(location_pk) {
        let store = this.get('store');
        let m2m_pk = this.get('person_locations').filter((m2m) => {
            return m2m.get('location_pk') === location_pk;
        }).objectAt(0).get('id');
        store.push('person-location', {id: m2m_pk, removed: true});
    },
    locationsIsNotDirty: Ember.computed.not('locationsIsDirty'),
    locationsIsDirty: Ember.computed('person_locations', 'locations.@each.isDirty', function() {
        let locations = this.get('locations');
        let previous_m2m_fks = this.get('person_location_fks');
        if(locations.get('length') > 0) {
            if(!previous_m2m_fks || previous_m2m_fks.get('length') !== locations.get('length')) {
                return true;
            }

            let dirty_locations = locations.filter(function(location) {
                return location.get('isDirty') === true;
            });
            return dirty_locations.length > 0;

        }
        if(previous_m2m_fks && previous_m2m_fks.get('length') > 0) {
            return true;
        }
    }),
    saveLocations() {
        this.resetPersonLocationFks({save: true});
    },
    rollbackLocations() {
        let store = this.get('store');
        let locations = this.get('locations');
        let previous_m2m_fks = this.get('person_location_fks');

        let m2m_to_throw_out = store.find('person-location', function(join_model) {
            return Ember.$.inArray(join_model.get('id'), previous_m2m_fks) < 0 && !join_model.get('removed');
        }, ['removed']);

        m2m_to_throw_out.forEach(function(join_model) {
            join_model.set('removed', true);
        });

        previous_m2m_fks.forEach(function(pk) {
            var m2m_to_keep = store.find('person-location', pk);
            m2m_to_keep.set('removed', undefined);
        });

        this.resetPersonLocationFks();
    },
    resetPersonLocationFks(options) {
        let saved_m2m_pks = [];
        let store = this.get('store');
        let locations = this.get('locations');
        locations.forEach((location) => {
            if(options && options.save === true) {
                location.save();
            }
            let filter = function(location_model, join_model) {
                let removed = join_model.get('removed');
                let person_pk = join_model.get('person_pk');
                let location_pk = join_model.get('location_pk');
                return person_pk === this.get('id') &&
                    location_pk === location_model.get('id') && !removed;
            };
            let m2m = store.find('person-location', filter.bind(this, location), ['removed']);
            m2m.forEach(function(join_model) {
                saved_m2m_pks.push(join_model.get('id'));
            });
        });
        this.set('person_location_fks', saved_m2m_pks);
    }
});

export default LocationMixin;

