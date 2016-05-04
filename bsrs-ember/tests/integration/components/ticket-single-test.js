import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import { clickTrigger, nativeMouseUp } from '../../helpers/ember-power-select';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import CD from 'bsrs-ember/vendor/defaults/category';
import TICKET_CD from 'bsrs-ember/vendor/defaults/model-category';
import page from 'bsrs-ember/tests/pages/tickets';

let store, m2m, m2m_two, m2m_three, ticket, category_one, category_two, category_three, run = Ember.run, category_repo, trans;
const DROPDOWN = '.ember-basic-dropdown-trigger';

moduleForComponent('tickets/ticket-single', 'integration: ticket-single test', {
  integration: true,
  beforeEach() {
    page.setContext(this);
    store = module_registry(this.container, this.registry, ['model:ticket', 'model:ticket-status', 'model:model-category']);
    translation.initialize(this);
    trans = this.container.lookup('service:i18n');
    run(function() {
      m2m = store.push('model-category', {id: TICKET_CD.idOne, model_pk: TD.idOne, category_pk: CD.idOne});
      m2m_two = store.push('model-category', {id: TICKET_CD.idTwo, model_pk: TD.idOne, category_pk: CD.idTwo});
      m2m_three = store.push('model-category', {id: TICKET_CD.idThree, model_pk: TD.idOne, category_pk: CD.unusedId});
      category_one = store.push('category', {id: CD.idOne, name: CD.nameOne, parent_id: CD.idTwo});
      category_two = store.push('category', {id: CD.idTwo, name: CD.nameTwo, parent_id: CD.unusedId});
      category_three = store.push('category', {id: CD.unusedId, name: CD.nameThree, parent_id: null});
      store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOneKey});
      store.push('ticket-status', {id: TD.statusTwoId, name: TD.statusTwoKey});
      ticket = store.push('ticket', {id: TD.idOne, request: 'foo'});
    });
  },
  afterEach() {
    page.removeContext(this);
  }
});

test('validation on ticket request works if clear out textarea', function(assert) {
  var done = assert.async();
  let statuses = store.find('ticket-status');
  this.set('model', ticket);
  this.set('statuses', statuses);
  this.render(hbs`{{tickets/ticket-single model=model statuses=statuses activities=statuses}}`);
  let $component = this.$('.has-error');
  assert.equal($component.text().trim(), '');
  page.requestFillIn('wat');
  assert.equal(page.request, 'wat');
  assert.notOk($component.is(':visible'));
  page.requestFillIn('');
  Ember.run.later(() => {
    const $component = this.$('.has-error');
    assert.ok($component.is(':visible'));
    assert.equal($component.text().trim(), trans.t('errors.ticket.request'));
    done();
  }, 300);
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
  clickTrigger('.t-ticket-priority-select >');
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
  clickTrigger('.t-ticket-status-select >');
  nativeMouseUp(`.ember-power-select-option:contains(${TD.statusTwoKey})`);
  assert.ok(this.$('.tag:eq(1)').hasClass('ticket-status-deferred'));
});
