import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import OptConf from 'bsrs-ember/mixins/optconfigure/work-order';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  scheduled_date: validator('presence', {
    presence: true,
    message: 'errors.work-order.scheduled_date'
  }),
  cost_estimate: validator('presence', {
    presence: true,
    message: 'errors.work-order.cost_estimate'
  }),
  cost_estimate_currency: validator('presence', {
    presence: true,
    message: 'errors.work-order.cost_estimate_currency'
  }),
});

let WorkOrder = Model.extend(OptConf, Validations, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)('status', 'work-order', { bootstrapped: true });
    belongs_to.bind(this)('category', 'work-order');
    belongs_to.bind(this)('provider', 'work-order');
    belongs_to.bind(this)('cost_estimate_currency', 'work-order', { bootstrapped: true });
  },
  simpleStore: Ember.inject.service(),
  // status_fk: undefined,
  cost_estimate_currency_fk: undefined,
  scheduled_date: attr(''),
  completed_date: attr(''),
  expiration_date: attr(''),
  approval_date: attr(''),
  approved_amount: attr(''),
  cost_estimate: attr(''),

  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'costEstimateCurrencyIsDirty', 'statusIsDirty', 'categoryIsDirty', 'providerIsDirty', function() {
    return this.get('isDirty') || this.get('costEstimateCurrencyIsDirty') || this.get('statusIsDirty') || this.get('categoryIsDirty') || this.get('providerIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),

  rollback() {
    this._super(...arguments);
    this.rollbackCostEstimateCurrency();
    this.rollbackStatus();
    this.rollbackCategory();
    this.rollbackProvider();
  },

  saveRelated() {
    this.saveCostEstimateCurrency();
    this.saveStatus();
    this.saveCategory();
    this.saveProvider();
  },
});

export default WorkOrder;
