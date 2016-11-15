import Ember from 'ember';
import { add_many_to_many } from 'bsrs-components/attr/many-to-many';

const { run } = Ember;

var ChildrenMixin = Ember.Mixin.create({
    location_children_fks: [],
    add_child(children){
        children.status_fk = children.status;
        delete children.status;
        children.location_level_fk = children.location_level;
        delete children.location_level;
        this.add_child_container(children);
    },
    add_child_container: add_many_to_many('children', 'location'),
});

export default ChildrenMixin;
