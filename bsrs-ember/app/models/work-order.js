import Ember from 'ember';
const { get } = Ember;
import { attr, Model } from 'ember-cli-simple-store/model';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import OptConf from 'bsrs-ember/mixins/optconfigure/work-order';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  scheduled_date: validator('presence', {
    presence: true,
    message: 'errors.work_order.scheduled_date'
  }),
  approved_amount: validator('presence', {
    presence: true,
    message: 'errors.work_order.approved_amount'
  }),
  cost_estimate: validator('presence', {
    presence: true,
    message: 'errors.work_order.cost_estimate'
  }),
  cost_estimate_currency: validator('presence', {
    presence: true,
    message: 'errors.work_order.cost_estimate_currency'
  }),
});

let WorkOrder = Model.extend(OptConf, Validations, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)('status', 'work-order', { bootstrapped: true });
    belongs_to.bind(this)('category', 'work-order');
    belongs_to.bind(this)('provider', 'work-order');
    belongs_to.bind(this)('approver', 'work-order', { bootstrapped: true});
    belongs_to.bind(this)('cost_estimate_currency', 'work-order', { bootstrapped: true });
    // setup location toOne
  },
  simpleStore: Ember.inject.service(),
  status_fk: undefined,
  category_fk: undefined,
  provider_fk: undefined,
  approver_fk: undefined,
  // needs a location id
  cost_estimate_currency_fk: undefined,
  scheduled_date: attr(''),
  completed_date: attr(''),
  expiration_date: attr(''),
  approval_date: attr(''),
  approved_amount: attr(''),
  cost_estimate: attr(''),
  gl_code: attr(''),
  tracking_number: attr(''),
  instructions: attr(''),

  isDirtyOrRelatedDirty: Ember.computed('isDirty','approverIsDirty', 'costEstimateCurrencyIsDirty', 'statusIsDirty', 'categoryIsDirty', 'providerIsDirty', function() {
    return this.get('isDirty') || this.get('approverIsDirty') ||  this.get('costEstimateCurrencyIsDirty') || this.get('statusIsDirty') || this.get('categoryIsDirty') || this.get('providerIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),

  rollback() {
    this._super(...arguments);
    this.rollbackCostEstimateCurrency();
    this.rollbackStatus();
    this.rollbackCategory();
    this.rollbackProvider();
    this.rollbackApprover();
  },

  saveRelated() {
    this.saveCostEstimateCurrency();
    this.saveStatus();
    this.saveCategory();
    this.saveProvider();
    this.saveApprover();
  },
  serialize() {
    return {
      id: get(this, 'id'),
      approved_amount: get(this, 'approved_amount'),
      cost_estimate: get(this, 'cost_estimate'),
      scheduled_date: get(this, 'scheduled_date'),
      expiration_date: get(this, 'expiration_date'),
      approval_date: get(this, 'approval_date'),
      status: get(this, 'status.id'),
      category: get(this, 'category.id'),
      provider: get(this, 'provider.id'),
    };
  }
});

export default WorkOrder;
