import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';

export default Model.extend({
  fullname: Ember.computed('first_name', 'last_name', function() {
    const { first_name, last_name } = this.getProperties('first_name', 'last_name');
    return first_name + ' ' + last_name;
  }),
  /**
   * @method isDirtyOrRelatedDirty
   * all models need this property
   * returning false tells the attr addon that you are free to push into the store w/ no consequences
   */
  isDirtyOrRelatedDirty: Ember.computed(function() {
    return false;
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
});

