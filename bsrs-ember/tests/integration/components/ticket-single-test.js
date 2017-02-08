import Ember from 'ember';
const { run, set } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import CD from 'bsrs-ember/vendor/defaults/category';
import LD from 'bsrs-ember/vendor/defaults/location';
import TICKET_CD from 'bsrs-ember/vendor/defaults/model-category';
import WORK_ORDER_DEFAULTS from 'bsrs-ember/vendor/defaults/work-order';
import WORK_ORDER_STATUS_DEFAULTS from 'bsrs-ember/vendor/defaults/work-order-status';
import CurrencyD from 'bsrs-ember/vendor/defaults/currency';
import PROVIDER_DEFAULTS from 'bsrs-ember/vendor/defaults/provider';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import PERSON_CURRENT from 'bsrs-ember/vendor/defaults/person-current';
import { clickTrigger, nativeMouseUp } from 'bsrs-ember/tests/helpers/ember-power-select';
import wait from 'ember-test-helpers/wait';

const WD = WORK_ORDER_DEFAULTS.defaults();
const PD = PERSON_DEFAULTS.defaults();
const PC = PERSON_CURRENT.defaults();
const WOSD = WORK_ORDER_STATUS_DEFAULTS.defaults();
const ProviderD = PROVIDER_DEFAULTS.defaults();
let ticket, trans;

moduleForComponent('tickets/ticket-single', 'integration: ticket-single test', {
  integration: true,
  beforeEach() {
    this.store = module_registry(this.container, this.registry, ['model:ticket',
      'model:ticket-status', 'model:model-category', 'service:device/layout',
      'service:person-current']);
    translation.initialize(this);
    trans = this.container.lookup('service:i18n');
    run(() => {
      this.store.push('person-current', PERSON_CURRENT.defaults());
      this.store.push('model-category', {id: TICKET_CD.idOne, model_pk: TD.idOne, category_pk: CD.idOne});
      this.store.push('model-category', {id: TICKET_CD.idTwo, model_pk: TD.idOne, category_pk: CD.idTwo});
      this.store.push('model-category', {id: TICKET_CD.idThree, model_pk: TD.idOne, category_pk: CD.unusedId});
      this.store.push('category', {id: CD.idOne, name: CD.nameOne, parent_id: CD.idTwo});
      this.store.push('category', {id: CD.idTwo, name: CD.nameTwo, parent_id: CD.unusedId});
      this.store.push('category', {id: CD.unusedId, name: CD.nameThree, parent_id: null});
      this.store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOneKey});
      this.store.push('ticket-status', {id: TD.statusTwoId, name: TD.statusTwoKey});
      this.store.push('ticket-status', {id: TD.statusThreeId, name: TD.statusThreeKey});
      this.store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOneKey});
      this.store.push('ticket-priority', {id: TD.priorityTwoId, name: TD.priorityTwoKey});
      this.store.push('ticket-priority', {id: TD.priorityThreeId, name: TD.priorityThreeKey});
      ticket = this.store.push('ticket', {id: TD.idOne, request: 'foo'});
      this.model = ticket;
      this.activities = [];
    });
    /* Desktop */
    const flexi = this.container.lookup('service:device/layout');
    const breakpoints = flexi.get('breakpoints');
    const width = breakpoints.find(bp => bp.name === 'desktop').begin + 5;
    flexi.set('width', width);
  },
  afterEach() {
    delete this.store;
  }
});

test('validation on ticket request works', function(assert) {
  const REQUEST = '.t-ticket-request-single';
  let modalDialogService = this.container.lookup('service:modal-dialog');
  modalDialogService.destinationElementId = 'request';
  var done = assert.async();
  let statuses = this.store.find('ticket-status');
  this.render(hbs`{{tickets/ticket-single model=model activities=activities}}`);
  const $component = this.$('.t-ticket-request-validator.invalid');
  assert.notOk($component.is(':visible'));
  this.$(REQUEST).val('').keyup();
  return wait().
    then(() => {
    const $component = this.$('.t-ticket-request-validator.invalid');
    // assert.ok($component.is(':visible'), 'no entry. Too low');
    // assert.equal($('.validated-input-error-dialog').text().trim(), trans.t('errors.ticket.request'));
    this.$(REQUEST).val('a'.repeat(4)).keyup();
    return wait().
      then(() => {
      const $component = this.$('.t-ticket-request-validator.invalid');
      assert.ok($component.is(':visible'), 'only 4 characters. Too low');
      assert.equal($('.validated-input-error-dialog').text().trim(), trans.t('errors.ticket.request.length'));
      this.$(REQUEST).val('a'.repeat(5)).keyup();
      return wait().
        then(() => {
        const $component = this.$('.invalid');
        assert.notOk($component.is(':visible'), 'meets min length');
        done();
      });
    });
  });
});

test('if save isRunning, btn is disabled', function(assert) {
  // monkey patched.  Not actually passed to component but saveTask.isRunning comes from save ember-concurrency task
  this.model.validations = [];
  this.saveIsRunning = { isRunning: 'disabled' };
  this.permissions = ['change_ticket'];
  this.render(hbs`{{tickets/ticket-single 
    model=model 
    activities=activities 
    saveTask=saveIsRunning
    permissions=permissions
  }}`);
  assert.equal(this.$('.t-save-btn').attr('disabled'), 'disabled', 'Button is disabled if xhr save is outstanding');
});

test('click status dropdown and choose status from dropdown', function(assert) {
  let statuses = this.store.find('ticket-status');
  // line in the browser using the stop sign where this.get is undefined
  this.render(hbs`{{tickets/ticket-single model=model activities=activities}}`);
  let $component = this.$('.t-ticket-status-select'); // actual component
  assert.equal($component.length, 1);
  clickTrigger('.t-ticket-status-select');
  assert.equal(Ember.$('[data-test-id="status-tag"]').length, 3); // ticket-status tag component
  nativeMouseUp(`.ember-power-select-option:contains(${TD.statusOneKey})`);
  assert.equal(Ember.$('[data-test-id="status-tag"]').text().trim(), TD.statusOneKey);
  assert.equal(Ember.$('[data-test-id="status-tag"]').length, 1);
});

test('click priority dropdown an choose priority from dropdown', function(assert) {
  this.render(hbs`{{tickets/ticket-single model=model activities=activities}}`);
  let $component = this.$('.t-ticket-priority-select');
  assert.equal($component.length, 1);
  clickTrigger('.t-ticket-priority-select');
  assert.equal(Ember.$('[data-test-id="priority-tag"]').length, 3);
  nativeMouseUp(`.ember-power-select-option:contains(${TD.priorityOneKey})`);
  assert.equal(Ember.$('[data-test-id="priority-tag"]').text().trim(), TD.priorityOneKey);
  assert.equal(Ember.$('[data-test-id="priority-tag"]').length, 1);
});

test('permissions to "read only" show disabled input and select boxes', function(assert) {
  let person = PERSON_CURRENT.defaults();
  person.permissions = person.permissions.filter((perm) => { return perm !== 'change_ticket'; });
  run(() => {
    this.store.push('person-current', person);
  });
  this.render(hbs`{{tickets/ticket-single model=model activities=activities}}`);
  let $component = this.$('.t-ticket-status-select'); // actual component
  assert.equal($component.length, 1);
  let readonlyInput = this.$('textarea[readonly]');
  assert.equal(readonlyInput.length, 1, 'readonly textarea shown');
  let readonlyInputVal = readonlyInput.val();
  let readonlySelectGroups = this.$('.readonly .ember-power-select-trigger');
  assert.equal(readonlySelectGroups.length, 6, '6 select groups have a readonly class');
  let powerSelectTrigger = this.$('[aria-disabled]');
  assert.equal(powerSelectTrigger.length, 6, '6 selects are disabled');
});

test('ticket single renders work order dispatch btn if no work orders', function(assert) {
  this.permissions = ['add_workorder'];
  run(() => {
    this.store.push('ticket', {id: TD.idOne, ticket_wo_fks: []});
  });
  this.render(hbs`{{tickets/ticket-single model=model activities=activities permissions=permissions}}`);
  assert.equal(this.$('[data-test-id="wo-dispatch"]').length, 1);
  assert.equal(this.$('[data-test-id="wo-dispatch"]').text().trim(), trans.t('work_order.button.dispatch'));
  assert.ok(this.$('[data-test-id="wo-dispatch"] > i').attr('class').includes('fa-wrench'));
});

test('one expanded and one collapsed work order are displayed', function(assert) {
  this.permissions = ['view_workorder'];
  run(() => {
    this.store.push('work-order-status', {id: WOSD.idOne, name: WOSD.nameOne, workOrders: [WD.idOne, WD.idTwo]});
    this.store.push('work-order', { id: WD.idOne, cost_estimate: WD.costEstimateOne, scheduled_date: WD.scheduledDateOne,
      cost_estimate_currency: CurrencyD.idOne, status_fk: WOSD.idOne, provider_fk: ProviderD.idOne });
    this.store.push('work-order', { id: WD.idTwo, cost_estimate: WD.costEstimateTwo, scheduled_date: WD.scheduledDateTwo,
      cost_estimate_currency: CurrencyD.idOne, status_fk: WOSD.idTwo, provider_fk: ProviderD.idOne });
    this.store.push('provider', {id: ProviderD.idOne, name: ProviderD.nameOne, city: ProviderD.cityOne, logo: ProviderD.logoOne, workOrders: [WD.idOne]});
    this.store.push('provider', {id: ProviderD.idTwo, name: ProviderD.nameTwo, city: ProviderD.cityOne, logo: ProviderD.logoTwo, workOrders: [WD.idTwo]});
    this.store.push('currency', {id: CurrencyD.idOne, workOrders: [WD.idOne]});
    this.store.push('ticket-join-wo', {id: 1, ticket_pk: TD.idOne, work_order_pk: WD.idOne});
    this.store.push('ticket-join-wo', {id: 2, ticket_pk: TD.idOne, work_order_pk: WD.idTwo});
    this.store.push('ticket', {id: TD.idOne, ticket_wo_fks: [1]});
  });
  this.render(hbs`{{tickets/ticket-single model=model activities=activities permissions=permissions}}`);
  assert.equal(this.$('[data-test-id*="expander-collapsed"]').length, 2, 'two work order components are collapsed');
  this.$('[data-test-id="expander-collapsed0"]').click();
  assert.equal(this.$('[data-test-id*="expander-expanded"]').length, 1, 'one work order component is expanded');
  assert.equal(this.$('[data-test-id*="expander-collapsed"]').length, 1, 'one work order component is collapsed');
});

test('two expanded work orders are displayed', function(assert) {
  this.permissions = ['view_workorder'];
  run(() => {
    this.store.push('work-order-status', {id: WOSD.idOne, name: WOSD.nameOne, workOrders: [WD.idOne, WD.idTwo]});
    this.store.push('work-order', { id: WD.idOne, cost_estimate: WD.costEstimateOne, scheduled_date: WD.scheduledDateOne,
      cost_estimate_currency: CurrencyD.idOne, status_fk: WOSD.idOne, provider_fk: ProviderD.idOne });
    this.store.push('work-order', { id: WD.idTwo, cost_estimate: WD.costEstimateTwo, scheduled_date: WD.scheduledDateTwo,
      cost_estimate_currency: CurrencyD.idOne, status_fk: WOSD.idTwo, provider_fk: ProviderD.idOne });
    this.store.push('provider', {id: ProviderD.idOne, name: ProviderD.nameOne, city: ProviderD.cityOne, logo: ProviderD.logoOne, workOrders: [WD.idOne]});
    this.store.push('provider', {id: ProviderD.idTwo, name: ProviderD.nameTwo, city: ProviderD.cityOne, logo: ProviderD.logoTwo, workOrders: [WD.idTwo]});
    this.store.push('currency', {id: CurrencyD.idOne, workOrders: [WD.idOne]});
    this.store.push('ticket-join-wo', {id: 1, ticket_pk: TD.idOne, work_order_pk: WD.idOne});
    this.store.push('ticket-join-wo', {id: 2, ticket_pk: TD.idOne, work_order_pk: WD.idTwo});
    this.store.push('ticket', {id: TD.idOne, ticket_wo_fks: [1]});
  });
  this.render(hbs`{{tickets/ticket-single model=model activities=activities permissions=permissions}}`);
  assert.equal(this.$('[data-test-id*="expander-collapsed"]').length, 2);
  this.$('[data-test-id="expander-collapsed0"]').click();
  this.$('[data-test-id="expander-collapsed1"]').click();
  assert.equal(this.$('[data-test-id*="expander-expanded"]').length, 2);
  assert.equal(this.$('[data-test-id*="expander-collapsed"]').length, 0);
  this.$('[data-test-id="expander-expanded0"]').click();
  this.$('[data-test-id="expander-expanded1"]').click();
  assert.equal(this.$('[data-test-id*="expander-expanded"]').length, 0);
  assert.equal(this.$('[data-test-id*="expander-collapsed"]').length, 2);
});

test('view work order permissions', function(assert) {
  this.permissions = ['view_workorder'];
  run(() => {
    this.store.push('work-order-status', {id: WOSD.idOne, name: WOSD.nameOne, workOrders: [WD.idOne, WD.idTwo]});
    this.store.push('work-order', { id: WD.idOne, cost_estimate: WD.costEstimateOne, scheduled_date: WD.scheduledDateOne,
      cost_estimate_currency: CurrencyD.idOne, status_fk: WOSD.idOne, provider_fk: ProviderD.idOne });
    this.store.push('provider', {id: ProviderD.idOne, name: ProviderD.nameOne, city: ProviderD.cityOne, logo: ProviderD.logoOne, workOrders: [WD.idOne]});
    this.store.push('currency', {id: CurrencyD.idOne, workOrders: [WD.idOne]});
    this.store.push('ticket-join-wo', {id: 1, ticket_pk: TD.idOne, work_order_pk: WD.idOne});
    this.store.push('ticket', {id: TD.idOne, ticket_wo_fks: [1]});
  });
  this.render(hbs`{{tickets/ticket-single model=model activities=activities permissions=permissions}}`);
  assert.equal(this.$('[data-test-id="ticket-display-collapsed"]').length, 1);
  run(() => {
    set(this, 'permissions', []);
  });
  assert.equal(this.$('[data-test-id="ticket-display-collapsed"]').length, 0);
});

test('create work order permissions', function(assert) {
  this.permissions = ['add_workorder'];
  run(() => {
    this.store.push('ticket', {id: TD.idOne, ticket_wo_fks: []});
  });
  this.render(hbs`{{tickets/ticket-single model=model activities=activities permissions=permissions}}`);
  assert.equal(this.$('[data-test-id="wo-dispatch"]').length, 1);
  run(() => {
    set(this, 'permissions', []);
  });
  assert.equal(this.$('[data-test-id="wo-dispatch"]').length, 0);
});

test('change work order permissions', function(assert) {
  this.permissions = ['view_workorder'];
  run(() => {
    this.store.push('person-current', { id: PC.id, permissions: ['view_ticket', 'view_workorder'] });
    this.store.push('work-order-status', {id: WOSD.idOne, name: WOSD.nameOne, workOrders: [WD.idOne, WD.idTwo]});
    this.store.push('work-order', { id: WD.idOne, cost_estimate: WD.costEstimateOne, gl_code: WD.glCodeOne, scheduled_date: WD.scheduledDateOne,
      cost_estimate_currency: CurrencyD.idOne, instructions: WD.instructions,  status_fk: WOSD.idOne, provider_fk: ProviderD.idOne });
    this.store.push('provider', {id: ProviderD.idOne, name: ProviderD.nameOne, city: ProviderD.cityOne, logo: ProviderD.logoOne, workOrders: [WD.idOne]});
    this.store.push('currency', {id: CurrencyD.idOne, workOrders: [WD.idOne]});
    this.store.push('ticket-join-wo', {id: 1, ticket_pk: TD.idOne, work_order_pk: WD.idOne});
    this.store.push('ticket', {id: TD.idOne, ticket_wo_fks: [1]});
  });
  this.render(hbs`{{tickets/ticket-single model=model activities=activities permissions=permissions}}`);
  this.$('[data-test-id="ticket-display-collapsed"]').click();
  assert.equal(this.$('.t-wo-gl_code0').prop('readonly'), true);
  assert.equal(this.$('.t-amount').prop('readonly'), true); 
  assert.ok(this.$('[data-test-id="scheduled-date"]').prop('disabled'), true);
  assert.ok(this.$('.t-instructions').prop('readonly'), true);
  run(() => {
    set(this, 'permissions', ['view_workorder', 'change_workorder']);
  });
  assert.ok(this.$('[data-test-id="begin-reschedule"]').length, 1);
});
