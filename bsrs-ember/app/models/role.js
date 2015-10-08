import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import injectUUID from 'bsrs-ember/utilities/uuid';

var RoleModel = Model.extend({
    store: inject('main'),
    uuid: injectUUID('uuid'),
    name: attr(''),
    people: attr([]),
    role_type: attr(),
    cleanupLocation: false,
    location_level_fk: undefined, 
    role_category_fks: [],
    role_categories: Ember.computed('role_category_fks.[]', function() {
        let filter = (join_model) => {
            return join_model.get('role_fk') === this.get('id') && !join_model.get('removed');
        };
        let store = this.get('store');
        return store.find('role-category', filter.bind(this), ['removed']);
    }),
    categories: Ember.computed('role_categories.[]', function() {
        let role_categories = this.get('role_categories');
        let filter = function(category) {
            let categories_fk = this.map((join_model) => {
                return join_model.get('category_fk');
            });
            return Ember.$.inArray(category.get('id'), categories_fk) > -1;
        };
        return this.get('store').find('category', filter.bind(role_categories), ['id']);
    }),
    categoryIsDirty: Ember.computed('role_category_fks.[]', 'categories.[]', function() {
        let role_category_fks = this.get('role_category_fks');
        let categories = this.get('categories');
        if (categories) {
            return categories.get('length') !== role_category_fks.length ? true : false;
        }
    }),
    add_category(category_pk) {
        let uuid = this.get('uuid');
        let store = this.get('store');
        store.push('role-category', {id: uuid.v4(), role_fk: this.get('id'), category_fk: category_pk});
    },
    remove_category(category_pk) {
        let uuid = this.get('uuid');
        let store = this.get('store');
        let m2m_pk = this.get('role_categories').objectAt(0).get('id');
        store.push('role-category', {id: m2m_pk, removed: true});
    },
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
    isDirtyOrRelatedDirty: Ember.computed('isDirty', 'locationLevelIsDirty', 'categoryIsDirty', function() {
        return this.get('isDirty') || this.get('locationLevelIsDirty') || this.get('categoryIsDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    locationLevelIsDirty: Ember.computed('location_levels.@each.isDirty', 'location_levels.[]', 'location_level_fk', function() {
        let location_levels = this.get('location_levels');
        let location_level = location_levels.objectAt(0);
        if (location_level) { 
            return location_level.get('isDirty'); 
        } 
        if (this.get('cleanupLocation')) {
            this.set('cleanupLocation', false);
            return false;
        }
        return this.get('location_level_fk') ? true : false;
    }),
    locationLevelIsNotDirty: Ember.computed.not('locationLevelIsDirty'),
    serialize() {
        let location_level = this.get('location_level');
        let location_level_id;
        if (location_level) {
            location_level_id = location_level.get('id');
        }
        let categories = this.get('categories');
        let category_ids = categories.map((category) => {
            return category.get('id');
        });
        return {
            id: this.get('id'),
            name: this.get('name'),
            role_type: this.get('role_type'),
            location_level: location_level_id || null,
            categories: category_ids 
        };
    },
    removeRecord() {
        this.get('store').remove('role', this.get('id'));
    },
    rollbackRelated() {
        this.rollbackLocationLevel();
    },
    saveRelated() {
        this.saveLocationLevel();
        this.saveCategories();
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
    saveCategories() {
        let role_categories = this.get('role_categories');
        let role_categories_ids = role_categories.map((cat) => {
            return cat.get('id');
        });
        let role_category_fks = this.get('role_category_fks');
        //add
        role_categories.forEach((join_model) => {
            if (Ember.$.inArray(join_model.get('id'), role_category_fks) === -1) {
                role_category_fks.pushObject(join_model.get('id'));
            } 
        });
        //remove
        role_category_fks.forEach((fk) => {
            if (Ember.$.inArray(fk, role_categories_ids) === -1) {
                role_category_fks.removeObject(fk);
            } 
        });
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
    },
    toString: function() {
        let name = this.get('name');
        return name ? name : '';
    }
});

export default RoleModel;
