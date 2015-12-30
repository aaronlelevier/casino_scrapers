import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import injectUUID from 'bsrs-ember/utilities/uuid';
import equal from 'bsrs-ember/utilities/equal';
import NewMixin from 'bsrs-ember/mixins/model/new';

var run = Ember.run;

var RoleModel = Model.extend(NewMixin, {
    store: inject('main'),
    uuid: injectUUID('uuid'),
    name: attr(''),
    people: [],
    role_type: attr(),
    location_level_fk: undefined, 
    role_category_fks: [],
    categories_ids: Ember.computed('categories.[]', function() {
        return this.get('categories').mapBy('id').uniq();
    }),
    categories: Ember.computed('role_categories.[]', function() {
        const role_categories = this.get('role_categories');
        const categories_fk = role_categories.map((role_cat) => {
            return role_cat.get('category_fk');
        });
        const categories = this.get('store').find('category') || [];
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
        const pk = this.get('id');
        const filter = (join_model) => {
            return join_model.get('role_fk') === pk && !join_model.get('removed');
        };
        return this.get('store').find('role-category', filter);
    }),
    categoryIsDirty: Ember.computed('role_category_fks.[]', 'categories.[]', function() {
        const categories = this.get('categories');
        const role_categories_ids = this.get('role_categories_ids');
        const previous_m2m_fks = this.get('role_category_fks') || [];
        if(categories.get('length') !== previous_m2m_fks.length) {
            return equal(role_categories_ids, previous_m2m_fks) ? false : true;
        }
        return equal(role_categories_ids, previous_m2m_fks) ? false : true;
    }),
    categoryIsNotDirty: Ember.computed.not('categoryIsDirty'),
    add_category(category_pk) {
        let role_pk = this.get('id');
        let uuid = this.get('uuid');
        let store = this.get('store');
        run(function() {
            store.push('role-category', {id: uuid.v4(), role_fk: role_pk, category_fk: category_pk});
        });
    },
    remove_category(category_pk) {
        const uuid = this.get('uuid');
        const store = this.get('store');
        let m2m_pk = this.get('role_categories').filter((m2m) => {
            return m2m.get('category_fk') === category_pk;
        }).objectAt(0).get('id');
        run(function() {
            store.push('role-category', {id: m2m_pk, removed: true});
        });
    },
    location_level: Ember.computed.alias('location_levels.firstObject'),
    location_levels: Ember.computed(function() {
        const pk = this.get('id');
        const filter = (location_level) => {
            const role_pks = location_level.get('roles') || [];
            return Ember.$.inArray(pk, role_pks) > -1;
        };
        return this.get('store').find('location-level', filter);
    }),
    change_location_level(new_location_level_id) {
        const role_id = this.get('id');
        const store = this.get('store');
        const old_location_level = this.get('location_level');
        if(old_location_level) {
            const old_roles = old_location_level.get('roles') || [];
            const updated_old_roles = old_roles.filter((id) => {
                return id !== role_id;
            });
            // old_location_level.set('roles', updated_old_roles);
            run(function() {
                store.push('location-level', {id: old_location_level.get('id'), roles: updated_old_roles});
            });
        }
        if(!new_location_level_id){
            return;
        } else{
            const new_location_level = store.find('location-level', new_location_level_id);
            const new_roles = new_location_level.get('roles') || [];
            run(function() {
                store.push('location-level', {id: new_location_level.get('id'), roles: new_roles.concat(role_id)});
            });
            // new_location_level.set('roles', new_roles.concat(role_id));
        }
    },
    isDirtyOrRelatedDirty: Ember.computed('isDirty', 'locationLevelIsDirty', 'categoryIsDirty', function() {
        return this.get('isDirty') || this.get('locationLevelIsDirty') || this.get('categoryIsDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    locationLevelIsDirty: Ember.computed('location_levels.@each.isDirty', 'location_levels.[]', 'location_level_fk', function() {//TODO: remove dirty cache breaking
        const location_level = this.get('location_level');
        const location_level_fk = this.get('location_level_fk');
        if(location_level) {
            return location_level.get('id') === location_level_fk ? false : true;
        }
        if(!location_level && location_level_fk) {
            return true;
        }
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
        const pk = this.get('id');
        const store = this.get('store');
        run(function() {
            store.remove('role', pk);
        });
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
        const pk = this.get('id');
        const store = this.get('store');
        const location_level = this.get('location_level');
        if(location_level) {
            run(function() {
                store.push('role', {id: pk, location_level_fk: location_level.get('id')});
            });
        }else{
            run(function() {
                store.push('role', {id: pk, location_level_fk: undefined});
            });
        }
        // this.set('location_level_fk', location_level ? location_level.get('id') : undefined);
    },
    rollbackLocationLevel() {
        const location_level = this.get('location_level');
        const location_level_fk = this.get('location_level_fk');
        this.change_location_level(location_level_fk);
    },
    saveCategories() {
        const role_id = this.get('id');
        const store = this.get('store');
        const role_categories = this.get('role_categories');
        const role_categories_ids = this.get('role_categories_ids');
        const previous_m2m_fks = this.get('role_category_fks');
        //add
        run(function() {
            role_categories.forEach((join_model) => {
                if (Ember.$.inArray(join_model.get('id'), previous_m2m_fks) === -1) {
                    store.push('role', {id: role_id, role_category_fks: previous_m2m_fks.concat(join_model.get('id'))});
                    // this.set('role_category_fks', previous_m2m_fks.concat(join_model.get('id')));
                } 
            });
        });
        //remove
        const previous_m2m_fks_updated = this.get('role_category_fks');
        for (let i=previous_m2m_fks_updated.length-1; i>=0; i--) {
            if (Ember.$.inArray(previous_m2m_fks_updated[i], role_categories_ids) === -1) {
                previous_m2m_fks_updated.removeObject(previous_m2m_fks_updated[i]); //this might be leaking state ...
            }
        }
    },
    rollbackCategories() {
        const store = this.get('store');
        const previous_m2m_fks = this.get('role_category_fks') || [];
        const m2m_array = store.find('role-category').toArray();
        const m2m_to_throw_out = m2m_array.filter(function(join_model) {
            return Ember.$.inArray(join_model.get('id'), previous_m2m_fks) < 0 && !join_model.get('removed');
        });
        run(function() {
            m2m_to_throw_out.forEach(function(join_model) {
                store.push('role-category', {id: join_model.get('id'), removed: true});
                // join_model.set('removed', true);
            });
            previous_m2m_fks.forEach(function(pk) {
                store.push('role-category', {id: pk, removed: undefined});
                // const m2m_to_keep = store.find('role-category', pk);
                // if (m2m_to_keep.get('id')) {
                //     m2m_to_keep.set('removed', undefined);
                // }
            });
        });
    },
    toString: function() {
        const name = this.get('name');
        return name ? name : '';
    }
});

export default RoleModel;
