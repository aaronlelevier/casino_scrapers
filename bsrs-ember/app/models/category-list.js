import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

export default Ember.Object.extend({
    store: inject('main'),
    category: Ember.computed(function() {
        const store = this.get('store'); 
        return store.find('category', this.get('id'));
    }),
    isDirtyOrRelatedDirty: Ember.computed('category.isDirtyOrRelatedDirty', function() {
        return this.get('category').get('isDirtyOrRelatedDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
}); 


