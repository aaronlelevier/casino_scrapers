import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';

export default Model.extend({
  name: attr(),
  isDirtyOrRelatedDirty: Ember.computed(function() {
    return this.get('isDirty'); 
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty')
});
