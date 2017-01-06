import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';

export default Ember.Component.extend({
  // For db-fetch if applicable
  currencyRepo: injectRepo('currency'),
});
