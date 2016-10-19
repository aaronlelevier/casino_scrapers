import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

/*
 * API 
 * - model - action model
 * - didValidate
 * - index
 */
export default Ember.Component.extend({
  personRepo: inject('person'),
});
