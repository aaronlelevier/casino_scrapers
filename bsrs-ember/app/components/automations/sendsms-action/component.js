import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

/*
 * API 
 * - model - action model
 * - index
 */
export default Ember.Component.extend({
  automationRepo: inject('automation'),
});
