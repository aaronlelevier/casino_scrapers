import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';

export default Model.extend({
    store: inject('main'),
    name: attr(''),
    role_type: attr('Location'),
    location_levels: Ember.computed(function() {
        var store = this.get('store');
        return store.find('location-level', {role_id: this.get('id')});
    }),
    categories: Ember.computed('id', function() {
        var store = this.get('store');
        return store.find('category', {role_id: this.get('id')});
    }),
    isDirtyOrRelatedDirty: Ember.computed('isDirty', 'locationLevelIsDirty', function() {
        return this.get('isDirty') || this.get('locationLevelIsDirty'); 
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    locationLevelIsDirty: Ember.computed('location_levels.@each.isDirty', 'location_levels.@each.name', function() {
        var location_levels = this.get('location_levels');
        var location_level_dirty = false;
        location_levels.forEach((level) => {
            if (level.get('isDirty')) {
                location_level_dirty = true;
            }
        });
        return location_level_dirty;
    }),
    locationLevelIsNotDirty: Ember.computed.not('locationLevelIsDirty'),
    serialize() {
        var categories = this.get('categories').map((category) => {
            return category.serialize();
        });
        return {
            id: this.get('id'),
            name: this.get('name'),
            role_type: this.get('role_type'),
            location_level: this.get('location_level'),
            categories: categories
        };
    },
    removeRecord(id) {
        this.get('store').remove('role', id);
    },
    saveLocationLevels() {
        var location_levels = this.get('location_levels');
        location_levels.forEach((level) => {
            level.save();
        });
    },
    rollbackRelated() {
        this.rollbackLocationLevels();
    },
    rollbackLocationLevels() {
        var location_levels = this.get('location_levels');
        location_levels.forEach((level) => {
            level.rollback();
        });
    },
});
