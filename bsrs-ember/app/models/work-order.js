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
  cost_estimate: validator('format', {
    allowBlank: true,
    // allow only numbers commas and decimal points
    regex: /^[0-9.,]+$/,
  })
});

let WorkOrder = Model.extend(OptConf, Validations, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)('status', 'work-order', { bootstrapped: true });
    belongs_to.bind(this)('category', 'work-order');
    belongs_to.bind(this)('provider', 'work-order');
    belongs_to.bind(this)('approver', 'work-order', { bootstrapped: true });
  },
  simpleStore: Ember.inject.service(),
  status_fk: undefined,
  category_fk: undefined,
  provider_fk: undefined,
  approver_fk: undefined,
  cost_estimate_currency: attr(),
  scheduled_date: attr(''),
  completed_date: attr(''),
  expiration_date: attr(''),
  approval_date: attr(''),
  approved_amount: attr(''),
  cost_estimate: attr(''),
  gl_code: attr(''),
  tracking_number: attr(''),
  instructions: attr(''),

  personCurrent: Ember.inject.service('person-current'),
  isReadOnly: Ember.computed.alias('personCurrent.isReadOnlyWorkorder'),

  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'approverIsDirty', 'statusIsDirty', 'categoryIsDirty', 'providerIsDirty', function() {
    return this.get('isDirty') || this.get('approverIsDirty') || this.get('statusIsDirty') || this.get('categoryIsDirty') || this.get('providerIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),

  rollback() {
    this._super(...arguments);
    this.rollbackStatus();
    this.rollbackCategory();
    this.rollbackProvider();
    this.rollbackApprover();
  },

  saveRelated() {
    this.saveStatus();
    this.saveCategory();
    this.saveProvider();
    this.saveApprover();
  },
  serialize() {
    return {
      id: get(this, 'id'),
      cost_estimate_currency: get(this, 'cost_estimate_currency'),
      cost_estimate: get(this, 'cost_estimate'),
      scheduled_date: get(this, 'scheduled_date'),
      approval_date: get(this, 'approval_date'),
      approved_amount: get(this, 'approved_amount'),
      completed_date: get(this, 'completed_date'),
      expiration_date: get(this, 'expiration_date'),
      instructions: get(this, 'instructions'),
      gl_code: get(this, 'gl_code'),
      status: get(this, 'status.id'),
      category: get(this, 'category.id'),
      provider: get(this, 'provider.id'),
      approver: get(this, 'approver.id'),
      ticket: get(this, 'ticket'),
    };
  },
  timelineItems: [
    { name: 'work_order.status.sent', index: 0 }, 
    { name: 'work_order.status.scheduled', index: 1 },
    { name: 'work_order.status.on_site', index: 2 }, 
    { name: 'work_order.status.complete', index: 3 }, 
    { name: 'work_order.status.invoiced', index: 4 }, 
    { name: 'work_order.status.paid', index: 5 }
  ],
});

export default WorkOrder;
