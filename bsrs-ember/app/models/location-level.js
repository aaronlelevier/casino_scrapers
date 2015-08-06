import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';

var LocationLevel = Model.extend({
    store: inject('main'),
    name: attr(''),
    isDirtyOrRelatedDirty: Ember.computed('isDirty', function() {
        //for children eventually
        return this.get('isDirty'); 
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    rollbackRelated() {
    },
    serialize() {
        return {
            id: this.get('id'),
            name: this.get('name'),
            children: []
        };
    },
    removeRecord(id) {
        this.get('store').remove('location-level', id);
    }
});

export default LocationLevel;
