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
    },
    children: Ember.computed(function() {
        var filter = function(level) {
            var pk = this.get('id');
            var id = level.get('id');
            var parent_id = level.get('parent_id');
            return parent_id === pk && pk !== id;
        };
        return this.get('store').find('location-level', filter.bind(this), ['id', 'parent_id']);
    })
});

export default LocationLevel;
