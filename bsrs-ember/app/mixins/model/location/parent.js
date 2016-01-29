import Ember from 'ember';
import { many_to_many, many_to_many_ids, many_to_many_dirty, many_to_many_rollback, many_to_many_save, add_many_to_many, remove_many_to_many, many_models, many_models_ids } from 'bsrs-components/attr/many-to-many';

var run = Ember.run;

var ParentMixin = Ember.Mixin.create({
    location_parents_fks: [],
    parents_ids: Ember.computed('parents.[]', function() {
        return this.get('parents').mapBy('id'); 
    }),
    parents: many_models('location_parents', 'parent_pk', 'location'),
    location_parents_ids: Ember.computed('location_parents.[]', function() {
        return this.get('location_parents').mapBy('id'); 
    }),
    location_parents: many_to_many('location-parents', 'location_pk'),
    add_parent: add_many_to_many('location-parents', 'location', 'parent_pk', 'location_pk'),
    // remove_parent: add_many_to_many('location-parents', 'parent_pk', 'location_parents'),
    remove_parent(parent_id) {
        const store = this.get('store'); 
        const m2m_pk = this.get('location_parents').filter((m2m) => {
            return m2m.get('parent_pk') === parent_id;
        }).objectAt(0).get('id'); 
        run(() => {
            store.push('location-parents', {id: m2m_pk, removed: true});
        });
    },
    saveParents: many_to_many_save('location', 'location_parents', 'location_parents_ids', 'location_parents_fks'),
    rollbackParents: many_to_many_rollback('location-parents', 'location_parents_fks', 'location_pk'),
});

export default ParentMixin;
