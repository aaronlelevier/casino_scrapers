import Ember from 'ember';
const { inject } = Ember;
import injectRepo from 'bsrs-ember/utilities/inject';

export default Ember.Component.extend({
  currency: inject.service(),
  currencyRepo: injectRepo('currency'),
  click() {
    this.toggleProperty('isExpanded');
  },
});
