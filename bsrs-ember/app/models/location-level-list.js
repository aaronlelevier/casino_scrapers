import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

export default Ember.Object.extend({
    store: inject('main'),
    location_level: Ember.computed(function() {
        const store = this.get('store'); 
        return store.find('location-level', this.get('id'));
    }),
    isDirtyOrRelatedDirty: Ember.computed('location_level.isDirtyOrRelatedDirty', function() {
        return this.get('location_level').get('isDirtyOrRelatedDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
});


