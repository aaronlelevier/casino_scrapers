import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import injectUUID from 'bsrs-ember/utilities/uuid';
import equal from 'bsrs-ember/utilities/equal';
import NewMixin from 'bsrs-ember/mixins/model/new';

var RoleModel = Model.extend(NewMixin, {
    store: inject('main'),
    uuid: injectUUID('uuid'),
    name: attr(''),
    people: [],
    role_type: attr(),
    cleanupLocation: false,
    location_level_fk: undefined, 
    role_category_fks: [],
    categories_ids: Ember.computed('categories.[]', function() {
        return this.get('categories').mapBy('id').uniq();
    }),
    categories: Ember.computed('role_categories.[]', function() {
        let role_categories = this.get('role_categories');
        let categories_fk = role_categories.map((role_cat) => {
            return role_cat.get('category_fk');
        });
        let categories = this.get('store').find('category') || [];
        let hash_table = {};
        return categories.filter((category) => {
            let cat_id = category.get('id');
            if (!hash_table.hasOwnProperty(cat_id) && Ember.$.inArray(cat_id, categories_fk) > -1) {
                hash_table[cat_id] = true;
                return true;
            }
        });
    }),
    role_categories_ids: Ember.computed('role_categories.[]', function() {
        return this.get('role_categories').mapBy('id'); 
    }),
    role_categories: Ember.computed(function() {
        let filter = (join_model) => {
            return join_model.get('role_fk') === this.get('id') && !join_model.get('removed');
        };
        let store = this.get('store');
        return store.find('role-category', filter.bind(this), ['removed']);
    }),
    categoryIsDirty: Ember.computed('role_category_fks.[]', 'categories.[]', function() {
        let categories = this.get('categories');
        let role_categories_ids = this.get('role_categories_ids');
        let previous_m2m_fks = this.get('role_category_fks') || [];
        if(categories.get('length') !== previous_m2m_fks.length) {
            return equal(role_categories_ids, previous_m2m_fks) ? false : true;
        }
        return equal(role_categories_ids, previous_m2m_fks) ? false : true;
    }),
    categoryIsNotDirty: Ember.computed.not('categoryIsDirty'),
    rollbackCategories() {
        let store = this.get('store');
        let previous_m2m_fks = this.get('role_category_fks') || [];

        let m2m_to_throw_out = store.find('role-category', function(join_model) {
            return Ember.$.inArray(join_model.get('id'), previous_m2m_fks) < 0 && !join_model.get('removed');
        }, ['id']);
        m2m_to_throw_out.forEach(function(join_model) {
            join_model.set('removed', true);
        });
        previous_m2m_fks.forEach(function(pk) {
            var m2m_to_keep = store.find('role-category', pk);
            if (m2m_to_keep.get('id')) {
                m2m_to_keep.set('removed', undefined);
            }
        });
    },
    add_category(category_pk) {
        let uuid = this.get('uuid');
        let store = this.get('store');
        store.push('role-category', {id: uuid.v4(), role_fk: this.get('id'), category_fk: category_pk});
    },
    remove_category(category_pk) {
        let uuid = this.get('uuid');
        let store = this.get('store');
        let m2m_pk = this.get('role_categories').filter((m2m) => {
            return m2m.get('category_fk') === category_pk;
        }).objectAt(0).get('id');
        store.push('role-category', {id: m2m_pk, removed: true});
    },
    location_level: Ember.computed.alias('location_levels.firstObject'),
    location_levels: Ember.computed(function() {
        let filter = (location_level) => {
            let role_pks = location_level.get('roles') || [];
            return Ember.$.inArray(this.get('id'), role_pks) > -1;
        };
        return this.get('store').find('location-level', filter.bind(this), ['roles']);
    }),
    change_location_level(new_location_level_id) {
        let role_id = this.get('id');
        let store = this.get('store');
        let old_location_level = this.get('location_level');
        if(old_location_level) {
            let old_roles = old_location_level.get('roles') || [];
            let updated_old_roles = old_roles.filter((id) => {
                return id !== role_id;
            });
            old_location_level.set('roles', updated_old_roles);
        }
        if(!new_location_level_id){
            return;
        } else{
            let new_location_level = store.find('location-level', new_location_level_id);
            let new_roles = new_location_level.get('roles') || [];
            new_location_level.set('roles', new_roles.concat(role_id));
        }
    },
    isDirtyOrRelatedDirty: Ember.computed('isDirty', 'locationLevelIsDirty', 'categoryIsDirty', function() {
        return this.get('isDirty') || this.get('locationLevelIsDirty') || this.get('categoryIsDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    locationLevelIsDirty: Ember.computed('location_levels.@each.isDirty', 'location_levels.[]', 'location_level_fk', function() {
        const location_level = this.get('location_level');
        const location_level_fk = this.get('location_level_fk');
        if(location_level) {
            return location_level.get('id') === location_level_fk ? false : true;
        }
        if(!location_level && location_level_fk) {
            return true;
        }
        // let location_levels = this.get('location_levels');
        // let location_level = location_levels.objectAt(0);
        // if (location_level) { 
        //     //TODO: remove this! don't want to dirty role if location level is dirty
        //     return location_level.get('isDirty'); 
        // } 
        // if (this.get('cleanupLocation')) {
        //     this.set('cleanupLocation', false);
        //     return false;
        // }
        // return this.get('location_level_fk') ? true : false;
    }),
    locationLevelIsNotDirty: Ember.computed.not('locationLevelIsDirty'),
    serialize() {
        const location_level = this.get('location_level');
        let location_level_id;
        if (location_level) {
            location_level_id = location_level.get('id');
        }
        return {
            id: this.get('id'),
            name: this.get('name'),
            role_type: this.get('role_type'),
            location_level: location_level_id || null,
            categories: this.get('categories_ids') 
        };
    },
    removeRecord() {
        this.get('store').remove('role', this.get('id'));
    },
    rollbackRelated() {
        this.rollbackLocationLevel();
        this.rollbackCategories();
    },
    saveRelated() {
        this.saveLocationLevel();
        this.saveCategories();
    },
    saveLocationLevel() {
        const location_level = this.get('location_level');
        this.set('location_level_fk', location_level ? location_level.get('id') : undefined);
    },
    saveCategories() {
        const role_categories = this.get('role_categories');
        const role_categories_ids = this.get('role_categories_ids');
        const previous_m2m_fks = this.get('role_category_fks');
        //add
        role_categories.forEach((join_model) => {
            if (Ember.$.inArray(join_model.get('id'), previous_m2m_fks) === -1) {
                previous_m2m_fks.pushObject(join_model.get('id'));
            } 
        });
        //remove
        for (let i=previous_m2m_fks.length-1; i>=0; i--) {
            if (Ember.$.inArray(previous_m2m_fks[i], role_categories_ids) === -1) {
                previous_m2m_fks.removeObject(previous_m2m_fks[i]);
            } 
        }
    },
    rollbackLocationLevel() {
        const location_level = this.get('location_level');
        const location_level_fk = this.get('location_level_fk');
        this.change_location_level(location_level_fk);
    },
    toString: function() {
        let name = this.get('name');
        return name ? name : '';
    }
});

export default RoleModel;
