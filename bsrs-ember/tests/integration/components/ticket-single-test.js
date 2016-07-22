import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import config from 'bsrs-ember/config/environment';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import { clickTrigger, nativeMouseUp } from '../../helpers/ember-power-select';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import CD from 'bsrs-ember/vendor/defaults/category';
import LD from 'bsrs-ember/vendor/defaults/location';
import TICKET_CD from 'bsrs-ember/vendor/defaults/model-category';

let store, ticket, trans, width;

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
      const dt_path = [{
        id: TD.idOne,
        requester: TD.requesterOne,
        location: LD.idThree,
        status: TD.statusZeroId,
        priority: TD.priorityZeroId,
        categories: [],
        cc: [],
        attachments: [],
      }];
      ticket = store.push('ticket', {id: TD.idOne, request: 'foo', dt_path: dt_path});
    });
    const flexi = this.container.lookup('service:device/layout');
    const breakpoints = flexi.get('breakpoints');
    const width = breakpoints.find(bp => bp.name === 'huge').begin + 5;
    flexi.set('width', width);
  },
});

test('validation on ticket request works', function(assert) {
  const REQUEST = '.t-ticket-request';
  let modalDialogService = this.container.lookup('service:modal-dialog');
  modalDialogService.destinationElementId = 'request';
  var done = assert.async();
  let statuses = store.find('ticket-status');
  this.model = ticket;
  this.statuses = statuses;
  this.render(hbs`{{tickets/ticket-single model=model statuses=statuses activities=statuses}}`);
  let $component = this.$('.invalid');
  assert.equal($component.text().trim(), '');
  this.$(REQUEST).val('wat').keyup();
  assert.notOk($component.is(':visible'));
  this.$(REQUEST).val('').keyup();
  Ember.run.later(() => {
    const $component = this.$('.invalid');
    assert.ok($component.is(':visible'));
    assert.equal($('.validated-input-error-dialog').text().trim(), trans.t('errors.ticket.request'));
    this.$(REQUEST).val('a'.repeat(4)).keyup();
    Ember.run.later(() => {
      const $component = this.$('.invalid');
      assert.ok($component.is(':visible'));
      assert.equal($('.validated-input-error-dialog').text().trim(), trans.t('errors.ticket.request.length'));
      this.$(REQUEST).val('a'.repeat(5)).keyup();
      Ember.run.later(() => {
        const $component = this.$('.invalid');
        assert.notOk($component.is(':visible'));
        done();
      }, 200);
    }, 200);
  }, 1800);
});

test('each status shows up as a valid select option', function(assert) {
  let statuses = store.find('ticket-status');
  this.set('model', ticket);
  this.set('statuses', statuses);
  this.render(hbs`{{tickets/ticket-single model=model statuses=statuses activities=statuses}}`);
  let $component = this.$('.t-ticket-status-select');
  assert.equal($component.length, 1);
});

test('each priority shows up as a valid select option', function(assert) {
  let priorities = store.find('ticket-priority');
  this.set('model', ticket);
  this.set('priorities', priorities);
  this.render(hbs`{{tickets/ticket-single model=model priorities=priorities activities=priorities}}`);
  let $component = this.$('.t-ticket-priority-select');
  assert.equal($component.length, 1);
});

test('changing priority changes the class', function(assert) {
  run(() => {
    store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOneKey, tickets: [TD.idOne]});
    store.push('ticket-priority', {id: TD.priorityTwoId, name: TD.priorityTwoKey});
    ticket = store.push('ticket', {id: TD.idOne, priority_fk: TD.priorityOneId});
  });
  let priorities = store.find('ticket-priority');
  this.set('model', ticket);
  this.set('priorities', priorities);
  this.render(hbs`{{tickets/ticket-single model=model priorities=priorities activities=priorities}}`);
  assert.ok(this.$('.tag:eq(0)').hasClass('ticket-priority-emergency'));
  let $component = this.$('.t-ticket-priority-select');
  assert.equal($component.length, 1);
  clickTrigger('.t-ticket-priority-select');
  nativeMouseUp(`.ember-power-select-option:contains(${TD.priorityTwoKey})`);
  assert.ok(this.$('.tag:eq(0)').hasClass('ticket-priority-high'));
});

test('changing status changes the class', function(assert) {
  run(() => {
    store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOneKey, tickets: [TD.idOne]});
    ticket = store.push('ticket', {id: TD.idOne, status_fk: TD.statusOneId});
  });
  let statuses = store.find('ticket-status');
  this.set('model', ticket);
  this.set('statuses', statuses);
  this.render(hbs`{{tickets/ticket-single model=model statuses=statuses activities=statuses}}`);
  assert.ok(this.$('.tag:eq(1)').hasClass('ticket-status-new'));
  let $component = this.$('.t-ticket-status-select');
  assert.equal($component.length, 1);
  clickTrigger('.t-ticket-status-select');
  nativeMouseUp(`.ember-power-select-option:contains(${TD.statusTwoKey})`);
  assert.ok(this.$('.tag:eq(1)').hasClass('ticket-status-deferred'));
});
