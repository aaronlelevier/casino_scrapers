import Ember from 'ember';
import NewMixin from 'bsrs-ember/mixins/model/new';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import loopAttrs from 'bsrs-ember/utilities/loop-attrs';

export default Model.extend(NewMixin, {
    store: inject('main'),
    name: attr(''),
    people: attr([]),
    role_type: attr(),
    cleanupLocation: false,
    location_level_fk: undefined,
    location_level: Ember.computed('location_levels.[]', function() {
        let location_levels = this.get('location_levels');
        let has_location_level = location_levels.get('length') > 0;
        if (has_location_level) { return location_levels.objectAt(0); }
    }),
    location_levels: Ember.computed(function() {
        let filter = (location_level) => {
            let role_pks = location_level.get('roles') || [];
            if (Ember.$.inArray(this.get('id'), role_pks) > -1) {
                return true;
            }
            return false;
        };
        let store = this.get('store');
        return store.find('location-level', filter.bind(this), ['roles']);
    }),
    dirtyOrRelatedDirty: Ember.computed('dirty', 'locationLevelDirty', function() {
        return this.get('dirty') || this.get('locationLevelDirty');
    }),
    notDirtyOrRelatedNotDirty: Ember.computed.not('dirtyOrRelatedDirty'),
    locationLevelDirty: Ember.computed('location_levels.@each.dirty', 'location_levels.[]', 'location_level_fk', function() {
        let location_levels = this.get('location_levels');
        let location_level = location_levels.objectAt(0);
        if (location_level) {
            return location_level.get('dirty');
        }
        if (this.get('cleanupLocation')) {
            this.set('cleanupLocation', false);
            return false;
        }
        return this.get('location_level_fk') ? true : false;
    }),
    locationLevelNotDirty: Ember.computed.not('locationLevelDirty'),
    serialize() {
        let location_level = this.get('location_level');
        let location_level_id;
        if (location_level) {
            location_level_id = location_level.get('id');
        }
        return {
            id: this.get('id'),
            name: this.get('name'),
            role_type: this.get('role_type'),
            location_level: location_level_id || null
        };
    },
    removeRecord() {
        this.get('store').remove('role', this.get('id'));
    },
    rollbackRelated() {
        this.rollbackLocationLevel();
    },
    isNew: Ember.computed(function() {
        return loopAttrs(this, 'role_type', 'location_level');
    }),
    saveRelated() {
        this.saveLocationLevel();
    },
    saveLocationLevel() {
        let location_level = this.get('location_level');
        if (location_level) {
            location_level.save();
            this.set('location_level_fk', location_level.get('id'));
        } else {
            this.set('location_level_fk', undefined);
        }
    },
    rollbackLocationLevel() {
        let store = this.get('store');
        let current_location_level = this.get('location_level');
        if (current_location_level) {
            let current_location_level_roles = current_location_level.get('roles');
            current_location_level.set('roles', current_location_level_roles.filter((old_location_level_pks) => {
                return old_location_level_pks !== this.get('id');
            }));
        }
        let location_level_fk = this.get('location_level_fk');
        let new_location_level = store.find('location-level', location_level_fk);
        if (new_location_level.get('id')) {
            let loc_level_roles = new_location_level.get('roles') || [];
            new_location_level.set('roles', loc_level_roles.concat([this.get('id')]));
            new_location_level.save();
        } else {
            this.set('cleanupLocation', true);
        }
    }
});
