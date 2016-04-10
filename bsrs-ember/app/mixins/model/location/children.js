import Ember from 'ember';
import { add_many_to_many } from 'bsrs-components/attr/many-to-many';

const { run } = Ember;

var ChildrenMixin = Ember.Mixin.create({
    location_children_fks: [],
    children_ids: Ember.computed('children.[]', function() {
        return this.get('children').mapBy('id'); 
    }),
    // children: many_models('location_children', 'child_pk', 'location'),
    location_children_ids: Ember.computed('location_children.[]', function() {
        return this.get('location_children').mapBy('id'); 
    }),
    // location_children: many_to_many('location-children', 'location_pk'),
    add_child(children){
        children.status_fk = children.status;
        delete children.status;
        children.location_level_fk = children.location_level;
        delete children.location_level;
        this.add_child_container(children);
    },
    add_child_container: add_many_to_many('location-children', 'location', 'child_pk', 'location_pk'),
    // remove_child: remove_many_to_many('location-children', 'child_pk', 'location_children'),
    // saveChildren: many_to_many_save('location', 'location_children', 'location_children_ids', 'location_children_fks'),
    // rollbackChildren: many_to_many_rollback('location-children', 'location_children_fks', 'location_pk'),
});

export default ChildrenMixin;
