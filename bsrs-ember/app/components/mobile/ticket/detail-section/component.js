import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import Base from 'bsrs-ember/components/mobile/base';

export default Base.extend({
  classNames: ['t-mobile-ticket-detail-section'],
  personRepo: inject('person'),
});
