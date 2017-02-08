import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';

export default Ember.Component.extend({
  currencyRepo: injectRepo('currency'),
  isExpanded: false,
});
