import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

export default Ember.Object.extend({
    simpleStore: Ember.inject.service(),
    category: Ember.computed(function() {
        const store = this.get('simpleStore'); 
        return store.find('category', this.get('id'));
    }),
    isDirtyOrRelatedDirty: Ember.computed('category.isDirtyOrRelatedDirty', function() {
        return this.get('category').get('isDirtyOrRelatedDirty');
    }).readOnly(),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty').readOnly(),
}); 


