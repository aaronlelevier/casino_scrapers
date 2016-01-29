import Ember from 'ember';
import { many_to_many, many_to_many_ids, many_to_many_dirty, many_to_many_rollback, many_to_many_save, add_many_to_many, remove_many_to_many, many_models, many_models_ids } from 'bsrs-components/attr/many-to-many';

var run = Ember.run;

var ChildrenMixin = Ember.Mixin.create({
    location_children_fks: [],
    children_ids: Ember.computed('children.[]', function() {
        return this.get('children').mapBy('id'); 
    }),
    children: many_models('location_children', 'child_pk', 'location'),
    location_children_ids: Ember.computed('location_children.[]', function() {
        return this.get('location_children').mapBy('id'); 
    }),
    location_children: many_to_many('location-children', 'location_pk'),
    add_child: add_many_to_many('location-children', 'location', 'child_pk', 'location_pk'),
    remove_child: remove_many_to_many('location-children', 'child_pk', 'location_children'),
    saveChildren: many_to_many_save('location', 'location_children', 'location_children_ids', 'location_children_fks'),
    rollbackChildren: many_to_many_rollback('location-children', 'location_children_fks', 'location_pk'),
});

export default ChildrenMixin;
