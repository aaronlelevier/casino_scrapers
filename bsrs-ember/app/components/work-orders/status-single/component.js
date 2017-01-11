import Ember from 'ember';
const { computed } = Ember;

export default Ember.Component.extend({
  classNameBindings: [
    'isPositive',
    'isNegative',
  ],
  isPositive: computed.bool('statusValue'),
  isNegative: computed.not('isPositive'),
  /**
   * lookup status name in icons map
   * @property statusValue
   * @type boolean
   */
  statusValue: computed(function() {
    const status = this.get('model').get('status');
    return this.get('icons')[status.get('name')];
  }),
  /**
   * computes the fa-icon for the template
   * @property faIcon
   */
  faIcon: Ember.computed('model.status.name', function() {
    return this.get('statusValue') ? 'check' : 'exclamation-triangle'; 
  }),
  icons: {
    'work_order.status.new': true,
    'work_order.status.declined': false,
    'work_order.status.dispatch_confirmed': true,
    'work_order.status.onsite': true,
    'work_order.status.parts_on_order': true,
    'work_order.status.proposal_approved': true,

    'work_order.status.waiting_for_approval': false,
    'work_order.status.waiting_for_quote': false,
    'work_order.status.cancelled': false,
    'work_order.status.no_charge': true,
    'work_order.status.pending_confirmation': false,
    'work_order.status.confirmed': true,
    'work_order.status.unsatisfactory': false,
  }
});

