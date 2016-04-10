import Ember from 'ember';
import { add_many_to_many } from 'bsrs-components/attr/many-to-many';

const { run } = Ember;

var ParentMixin = Ember.Mixin.create({
    location_parents_fks: [],
    parents_ids: Ember.computed('parents.[]', function() {
        return this.get('parents').mapBy('id'); 
    }),
    // parents: many_models('location_parents', 'parent_pk', 'location'),
    location_parents_ids: Ember.computed('location_parents.[]', function() {
        return this.get('location_parents').mapBy('id'); 
    }),
    // location_parents: many_to_many('location-parents', 'location_pk'),
    add_parent(parent) {
        parent.status_fk = parent.status;
        delete parent.status;
        parent.location_level_fk = parent.location_level;
        delete parent.location_level;
        this.add_parent_container(parent);
    },
    add_parent_container: add_many_to_many('location-parents', 'location', 'parent_pk', 'location_pk'),
    // remove_parent: remove_many_to_many('location-parents', 'parent_pk', 'location_parents'),
    // saveParents: many_to_many_save('location', 'location_parents', 'location_parents_ids', 'location_parents_fks'),
    // rollbackParents: many_to_many_rollback('location-parents', 'location_parents_fks', 'location_pk'),
});

export default ParentMixin;
