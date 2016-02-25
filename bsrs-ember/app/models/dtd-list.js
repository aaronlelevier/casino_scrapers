import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

export default Ember.Object.extend({
    store: inject('main'),
    dtd: Ember.computed(function() {
        const store = this.get('store'); 
        return store.find('dtd', this.get('id'));
    }),
    isDirtyOrRelatedDirty: Ember.computed('dtd.isDirtyOrRelatedDirty', function() {
        return this.get('dtd').get('isDirtyOrRelatedDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
});


