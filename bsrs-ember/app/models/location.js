import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import loopAttrs from 'bsrs-ember/utilities/loop-attrs';

var LocationModel = Model.extend({
    store: inject('main'),
    name: attr(''),
    number: attr(''),
    status: attr(),
    location_level_fk: undefined,
    locationLevelIsDirty: Ember.computed('location_levels.@each.isDirty', function() {
        let location_level = this.get('location_level');
        if(location_level) {
            return location_level.get('isDirty');
        }
        return this.get('location_level_fk') ? true : false;
    }),
    locationLevelIsNotDirty: Ember.computed.not('locationLevelIsDirty'),
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
    isDirtyOrRelatedDirty: Ember.computed('isDirty', 'locationLevelIsDirty', function() {
        return this.get('isDirty') || this.get('locationLevelIsDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
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
    },
    isNew: Ember.computed(function() {
        return loopAttrs(this);
    })
});

export default LocationModel;
