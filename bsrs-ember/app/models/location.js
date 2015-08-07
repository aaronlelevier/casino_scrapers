import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';

var LocationModel = Model.extend({
    store: inject('main'),
    name: attr(''),
    number: attr(''),
    status: attr(),
    location_levels: Ember.computed(function() {
        var store = this.get('store');
        return store.findOne('location-level', {location_id: this.get('id')});
    }),
    isDirtyOrRelatedDirty: Ember.computed('isDirty', function() {
        return this.get('isDirty'); 
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    rollbackRelated() {
    },
    serialize() {
        return {
            id: this.get('id'),
            name: this.get('name'),
            number: this.get('number'),
            status: this.get('status'),
            location_level: this.get('location_levels').get('id'),
        };
    },
    removeRecord(id) {
        this.get('store').remove('location', id);
    }
});

export default LocationModel; 
