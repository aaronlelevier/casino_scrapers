import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import loopAttrs from 'bsrs-ember/utilities/loop-attrs';

export default Model.extend({
    store: inject('main'),
    name: attr(''),
    people: attr([]),
    role_type: attr(),
    location_level: attr(),
    isDirtyOrRelatedDirty: Ember.computed('isDirty', function() {
        return this.get('isDirty'); 
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    serialize() {
        return {
            id: this.get('id'),
            name: this.get('name'),
            role_type: this.get('role_type'),
            location_level: this.get('location_level'),
        };
    },
    removeRecord(id) {
        this.get('store').remove('role', id);
    },
    rollbackRelated() {
    },
    isNew: Ember.computed(function() {
        return loopAttrs(this, 'role_type', 'location_level');
    })
});
