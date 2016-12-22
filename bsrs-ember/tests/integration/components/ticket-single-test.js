import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/ticket';
//import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import CD from 'bsrs-ember/vendor/defaults/category';
import LD from 'bsrs-ember/vendor/defaults/location';
import TICKET_CD from 'bsrs-ember/vendor/defaults/model-category';
import { clickTrigger, nativeMouseUp } from 'bsrs-ember/tests/helpers/ember-power-select';
import wait from 'ember-test-helpers/wait';

let store, ticket, trans;
//const PD = PERSON_DEFAULTS.defaults();

moduleForComponent('tickets/ticket-single', 'integration: ticket-single test', {
  integration: true,
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:ticket', 'model:ticket-status', 'model:model-category', 'service:device/layout']);
    translation.initialize(this);
    trans = this.container.lookup('service:i18n');
    run(() => {
      store.push('model-category', {id: TICKET_CD.idOne, model_pk: TD.idOne, category_pk: CD.idOne});
      store.push('model-category', {id: TICKET_CD.idTwo, model_pk: TD.idOne, category_pk: CD.idTwo});
      store.push('model-category', {id: TICKET_CD.idThree, model_pk: TD.idOne, category_pk: CD.unusedId});
      store.push('category', {id: CD.idOne, name: CD.nameOne, parent_id: CD.idTwo});
      store.push('category', {id: CD.idTwo, name: CD.nameTwo, parent_id: CD.unusedId});
      store.push('category', {id: CD.unusedId, name: CD.nameThree, parent_id: null});
      store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOneKey});
      store.push('ticket-status', {id: TD.statusTwoId, name: TD.statusTwoKey});
      store.push('ticket-status', {id: TD.statusThreeId, name: TD.statusThreeKey});
      store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOneKey});
      store.push('ticket-priority', {id: TD.priorityTwoId, name: TD.priorityTwoKey});
      store.push('ticket-priority', {id: TD.priorityThreeId, name: TD.priorityThreeKey});
      ticket = store.push('ticket', {id: TD.idOne, request: 'foo'});
    });
    /* Desktop */
    const flexi = this.container.lookup('service:device/layout');
    const breakpoints = flexi.get('breakpoints');
    const width = breakpoints.find(bp => bp.name === 'desktop').begin + 5;
    flexi.set('width', width);
  },
});

test('validation on ticket request works', function(assert) {
  const REQUEST = '.t-ticket-request-single';
  let modalDialogService = this.container.lookup('service:modal-dialog');
  modalDialogService.destinationElementId = 'request';
  var done = assert.async();
  let statuses = store.find('ticket-status');
  this.model = ticket;
  this.activities = [];
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
  this.set('model', ticket);
  this.set('activities', []);
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
  let statuses = store.find('ticket-status');
  // line in the browser using the stop sign where this.get is undefined
  this.set('model', ticket);
  this.set('activities', []);
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
  this.set('model', ticket);
  this.set('activities', []);
  this.render(hbs`{{tickets/ticket-single model=model activities=activities}}`);
  let $component = this.$('.t-ticket-priority-select');
  assert.equal($component.length, 1);
  clickTrigger('.t-ticket-priority-select');
  assert.equal(Ember.$('[data-test-id="priority-tag"]').length, 3);
  nativeMouseUp(`.ember-power-select-option:contains(${TD.priorityOneKey})`);
  assert.equal(Ember.$('[data-test-id="priority-tag"]').text().trim(), TD.priorityOneKey);
  assert.equal(Ember.$('[data-test-id="priority-tag"]').length, 1);
});
