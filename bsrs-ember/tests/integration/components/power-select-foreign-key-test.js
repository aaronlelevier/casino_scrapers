import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import { clickTrigger, nativeMouseUp } from '../../helpers/ember-power-select';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/ticket';

var store, ticket, priority_one, priority_two, priority_three, trans, run = Ember.run;
const PowerSelect = '.ember-power-select-trigger';
const relatedModelName = 'ticket-priority';
const COMPONENT = `.t-${relatedModelName}-select`;
const DROPDOWN = '.ember-power-select-dropdown';

moduleForComponent('power-select-foreign-key', 'integration: power-select-foreign-key test', {
  integration: true,
  setup() {
    store = module_registry(this.container, this.registry, ['model:ticket', 'model:ticket-priority']);
    run(function() {
      ticket = store.push('ticket', {id: TD.idOne, priority_fk: TD.priorityOneId});
      priority_one = store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOneKey});
      priority_two = store.push('ticket-priority', {id: TD.priorityTwoId, name: TD.priorityTwoKey});
      priority_three = store.push('ticket-priority', {id: TD.priorityThreeId, name: TD.priorityThreeKey});
    });
    trans = this.container.lookup('service:i18n');
    translation.initialize(this);
  }
});

test('should render a selectbox when priority options are empty (initial state of power select)', function(assert) {
  let priorities = Ember.A([]);
  this.set('ticket', ticket);
  this.set('priorities', priorities);
  this.render(hbs`{{power-select-foreign-key mainModel=ticket selected=ticket.priority change_method='change_priority' relatedModels=priorities relatedModelName='ticket-priority'}}`);
  let $component = this.$(COMPONENT);
  clickTrigger();
  assert.equal($(DROPDOWN).length, 1);
  assert.equal($('.ember-power-select-placeholder').text().trim(), trans.t('power.select.select'));
  assert.equal($('.ember-power-select-options > li').length, 1);
  assert.ok(!ticket.get('priority'));
  assert.notOk($('.ember-power-select-search').text());
});

test('should render a selectbox with bound options', function(assert) {
  let priorities = store.find('ticket-priority');
  priority_one.set('tickets', [TD.idOne]);
  this.set('ticket', ticket);
  this.set('priorities', priorities);
  this.render(hbs`{{power-select-foreign-key mainModel=ticket selected=ticket.priority change_method='change_priority' relatedModels=priorities relatedModelName='ticket-priority'}}`);
  let $component = this.$(COMPONENT);
  assert.equal($component.find(PowerSelect).text().trim(), trans.t(TD.priorityOneKey));
  clickTrigger();
  assert.equal($(DROPDOWN).length, 1);
  assert.equal($('.ember-basic-dropdown-content').length, 1);
  assert.equal($('.ember-power-select-options > li').length, 3);
  assert.equal(ticket.get('priority').get('id'), TD.priorityOneId);
  assert.deepEqual(priority_one.get('tickets'), [TD.idOne]);
});

test('should be able to select new priority when one doesnt exist', function(assert) {
  let priorities = store.find('ticket-priority');
  this.set('ticket', ticket);
  this.set('priorities', priorities);
  this.render(hbs`{{power-select-foreign-key mainModel=ticket selected=ticket.priority change_method='change_priority' relatedModels=priorities relatedModelName='ticket-priority'}}`);
  let $component = this.$(COMPONENT);
  assert.equal($('.ember-power-select-placeholder').text().trim(), trans.t('power.select.select'));
  clickTrigger();
  assert.equal($(DROPDOWN).length, 1);
  assert.equal($('.ember-basic-dropdown-content').length, 1);
  assert.equal($('.ember-power-select-options > li').length, 3);
  nativeMouseUp(`.ember-power-select-option:contains(${TD.priorityOneKey})`);
  assert.equal($(DROPDOWN).length, 0);
  assert.equal($('.ember-basic-dropdown-content').length, 0);
  assert.equal($('.ember-power-select-options > li').length, 0);
  assert.equal($component.find(PowerSelect).text().trim(), trans.t(TD.priorityOneKey));
  assert.equal(ticket.get('priority').get('id'), TD.priorityOneId);
  assert.deepEqual(priority_one.get('tickets'), [TD.idOne]);
});

test('should be able to select same priority when ticket already has a priority', function(assert) {
  let priorities = store.find('ticket-priority');
  priority_one.set('tickets', [TD.idOne]);
  this.set('ticket', ticket);
  this.set('priorities', priorities);
  this.render(hbs`{{power-select-foreign-key mainModel=ticket selected=ticket.priority change_method='change_priority' relatedModels=priorities relatedModelName='ticket-priority'}}`);
  let $component = this.$(COMPONENT);
  assert.equal($component.find(PowerSelect).text().trim(), trans.t(TD.priorityOneKey));
  clickTrigger();
  assert.equal($(DROPDOWN).length, 1);
  assert.equal($('.ember-basic-dropdown-content').length, 1);
  assert.equal($('.ember-power-select-options > li').length, 3);
  nativeMouseUp(`.ember-power-select-option:contains(${TD.priorityOneKey})`);
  assert.equal($(DROPDOWN).length, 0);
  assert.equal($('.ember-basic-dropdown-content').length, 0);
  assert.equal($('.ember-power-select-options > li').length, 0);
  assert.equal($component.find(PowerSelect).text().trim(), trans.t(TD.priorityOneKey));
  assert.equal(ticket.get('priority').get('id'), TD.priorityOneId);
  assert.deepEqual(priority_one.get('tickets'), [TD.idOne]);
});

test('should be able to select new priority when ticket already has a priority', function(assert) {
  let priorities = store.find('ticket-priority');
  priority_one.set('tickets', [TD.idOne]);
  this.set('ticket', ticket);
  this.set('priorities', priorities);
  this.render(hbs`{{power-select-foreign-key mainModel=ticket selected=ticket.priority change_method='change_priority' relatedModels=priorities relatedModelName='ticket-priority'}}`);
  let $component = this.$(COMPONENT);
  assert.equal($component.find(PowerSelect).text().trim(), trans.t(TD.priorityOneKey));
  clickTrigger();
  assert.equal($(DROPDOWN).length, 1);
  assert.equal($('.ember-basic-dropdown-content').length, 1);
  assert.equal($('.ember-power-select-options > li').length, 3);
  nativeMouseUp(`.ember-power-select-option:contains(${TD.priorityTwoKey})`);
  assert.equal($(DROPDOWN).length, 0);
  assert.equal($('.ember-basic-dropdown-content').length, 0);
  assert.equal($('.ember-power-select-options > li').length, 0);
  assert.equal($component.find(PowerSelect).text().trim(), trans.t(TD.priorityTwoKey));
  assert.equal(ticket.get('priority').get('id'), TD.priorityTwoId);
  assert.deepEqual(priority_one.get('tickets'), []);
  assert.deepEqual(priority_two.get('tickets'), [TD.idOne]);
});

test('clear-btn not present by default', function(assert) {
  let priorities = Ember.A([]);
  this.set('ticket', ticket);
  this.set('priorities', priorities);
  this.render(hbs`{{power-select-foreign-key mainModel=ticket selected=ticket.priority change_method='change_priority' relatedModels=priorities relatedModelName='ticket-priority'}}`);
  let $component = this.$(COMPONENT);
  assert.equal($component.find('.ember-power-select-clear-btn').length, 0);
});

test('clear-btn present if clear=true', function(assert) {
  priority_one.set('tickets', [TD.idOne]);
  let priorities = store.find('ticket-priority');
  this.set('ticket', ticket);
  this.set('priorities', priorities);
  this.render(hbs`{{power-select-foreign-key mainModel=ticket selected=ticket.priority change_method='change_priority' relatedModels=priorities relatedModelName='ticket-priority' clear=true}}`);
  let $component = this.$(COMPONENT);
  assert.equal($component.find('.ember-power-select-clear-btn').length, 1);
});
