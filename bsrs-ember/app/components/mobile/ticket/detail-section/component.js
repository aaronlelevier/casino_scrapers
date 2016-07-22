import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Component.extend({
  classNames: ['t-mobile-ticket-detail-section', 'mobile-inner'],
  personRepo: inject('person'),
});
