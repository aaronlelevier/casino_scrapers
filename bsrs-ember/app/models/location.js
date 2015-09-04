import Ember from 'ember';
import NewMixin from 'bsrs-ember/mixins/model/new';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';

var LocationModel = Model.extend(NewMixin, {
    store: inject('main'),
    name: attr(''),
    number: attr(''),
    status: attr(),
    location_level_fk: undefined,
    locationLevelDirty: Ember.computed('location_levels.@each.dirty', function() {
        let location_level = this.get('location_level');
        if(location_level) {
            return location_level.get('dirty');
        }
        return this.get('location_level_fk') ? true : false;
    }),
    locationLevelNotDirty: Ember.computed.not('locationLevelDirty'),
    location_level: Ember.computed('location_levels.[]', function() {
        var location_levels = this.get('location_levels');
        var has_location_level = location_levels.get('length') > 0;
        var foreign_key = has_location_level ? location_levels.objectAt(0).get('id') : undefined;
        if(has_location_level) {
            return location_levels.objectAt(0);
        }
    }),
    location_levels: Ember.computed(function() {
        var store = this.get('store');
        var filter = function(location_level) {
            var location_pks = location_level.get('locations') || [];
            if(Ember.$.inArray(this.get('id'), location_pks) > -1) {
                return true;
            }
            return false;
        };
        return store.find('location-level', filter.bind(this), ['locations']);
    }),
    dirtyOrRelatedDirty: Ember.computed('dirty', 'locationLevelDirty', function() {
        return this.get('dirty') || this.get('locationLevelDirty');
    }),
    notDirtyOrRelatedNotDirty: Ember.computed.not('dirtyOrRelatedDirty'),
    saveLocationLevel() {
        var location_level = this.get('location_level');
        location_level.save();
        this.set('location_level_fk', this.get('location_level').get('id'));
    },
    rollbackLocationLevel() {
        var store = this.get('store');
        var previous_location_level_fk = this.get('location_level_fk');

        var current_location_level = this.get('location_level');
        if(current_location_level) {
            var current_location_level_locations = current_location_level.get('locations') || [];
            current_location_level.set('locations', current_location_level_locations.filter((old_location_level_location_pk) => {
                return old_location_level_location_pk !== this.get('id');
            }));
        }

        var new_location_level = store.find('location-level', previous_location_level_fk);
        if(new_location_level.get('id')) {
            var location_level_locations = new_location_level.get('locations') || [];
            new_location_level.set('locations', location_level_locations.concat([this.get('id')]));
            new_location_level.save();
        }
    },
    saveRelated() {
        this.saveLocationLevel();
    },
    rollbackRelated() {
        this.rollbackLocationLevel();
    },
    serialize() {
        return {
            id: this.get('id'),
            name: this.get('name'),
            number: this.get('number'),
            status: this.get('status'),
            location_level: this.get('location_level.id'),
            children: [],
            parents: []
        };
    },
    removeRecord() {
        this.get('store').remove('location', this.get('id'));
    }
});

export default LocationModel;
