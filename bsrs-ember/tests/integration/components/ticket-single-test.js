import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import PERSON_CURRENT from 'bsrs-ember/vendor/defaults/person-current';
import CD from 'bsrs-ember/vendor/defaults/category';
import LD from 'bsrs-ember/vendor/defaults/location';
import TICKET_CD from 'bsrs-ember/vendor/defaults/model-category';
import { clickTrigger, nativeMouseUp } from 'bsrs-ember/tests/helpers/ember-power-select';
import wait from 'ember-test-helpers/wait';

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
  // monkey patched.  Not actually passed to component but save.isRunning comes from save ember-concurrency task
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
