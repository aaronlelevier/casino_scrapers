import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';

export default Model.extend({
  /**
   * @method isDirtyOrRelatedDirty
   * all models need this property
   * returning false tells the attr addon that you are free to push into the store w/ no consequences
   */
  tickets: [],
  isDirtyOrRelatedDirty: Ember.computed(function() {
    return false;
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
});

