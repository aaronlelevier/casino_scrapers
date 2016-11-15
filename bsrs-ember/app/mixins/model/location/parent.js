import Ember from 'ember';
import { add_many_to_many } from 'bsrs-components/attr/many-to-many';

const { run } = Ember;

var ParentMixin = Ember.Mixin.create({
    location_parents_fks: [],
    add_parent(parent) {
        parent.status_fk = parent.status;
        delete parent.status;
        parent.location_level_fk = parent.location_level;
        delete parent.location_level;
        this.add_parent_container(parent);
    },
    add_parent_container: add_many_to_many('parents', 'location'),
});

export default ParentMixin;
