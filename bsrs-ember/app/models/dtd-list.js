import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

export default Ember.Object.extend({
  simpleStore: Ember.inject.service(),
  /*
   * always name `model` because it tab service, this will look for the model property on the list model to rollback all
   */
  model: Ember.computed(function() {
    const store = this.get('simpleStore'); 
    return store.find('dtd', this.get('id'));
  }),
  isDirtyOrRelatedDirty: Ember.computed('model.isDirtyOrRelatedDirty', function() {
    return this.get('model').get('isDirtyOrRelatedDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
}); 


