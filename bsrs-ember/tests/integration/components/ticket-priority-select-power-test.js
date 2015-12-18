import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import clickTrigger from 'bsrs-ember/tests/helpers/click-trigger';
import tHelper from 'ember-i18n/helper';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/ticket';

var store, ticket, priority_one, priority_two, priority_three, run = Ember.run, trans;
const PowerSelect = '.ember-power-select-trigger';
const COMPONENT = '.t-ticket-priority-select';
const DROPDOWN = '.ember-power-select-dropdown';

moduleForComponent('ticket-priority-select', 'integration: ticket-priority-select test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:ticket', 'model:ticket-priority']);
        ticket = store.push('ticket', {id: TD.idOne, priority_fk: TD.priorityOneId});
        priority_one = store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOneKey});
        priority_two = store.push('ticket-priority', {id: TD.priorityTwoId, name: TD.priorityTwoKey});
        priority_three = store.push('ticket-priority', {id: TD.priorityThreeId, name: TD.priorityThreeKey});
        trans = this.container.lookup('service:i18n');
        translation.initialize(this);
    }
});

test('should render a selectbox when priority options are empty (initial state of selectize)', function(assert) {
    let priorities = Ember.A([]);
    this.set('ticket', ticket);
    this.set('priorities', priorities);
    this.render(hbs`{{ticket-priority-select ticket=ticket priorities=priorities}}`);
    let $component = this.$(COMPONENT);
    assert.equal($component.find(PowerSelect).text().trim(), '');
    clickTrigger();
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-basic-dropdown-content').length, 1);
    assert.equal($('.ember-power-select-options > li').length, 1);
    assert.equal($('li.ember-power-select-option').text(), 'No results found');
    assert.ok(!ticket.get('priority'));
    assert.notOk($('.ember-power-select-search').text());
});

test('should render a selectbox with bound options', function(assert) {
    let priorities = store.find('ticket-priority');
    priority_one.set('tickets', [TD.idOne]);
    this.set('ticket', ticket);
    this.set('priorities', priorities);
    this.render(hbs`{{ticket-priority-select ticket=ticket priorities=priorities}}`);
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
    this.render(hbs`{{ticket-priority-select ticket=ticket priorities=priorities}}`);
    let $component = this.$(COMPONENT);
    assert.equal($component.find(PowerSelect).text().trim(), '');
    clickTrigger();
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-basic-dropdown-content').length, 1);
    assert.equal($('.ember-power-select-options > li').length, 3);
    run(() => { 
        $(`.ember-power-select-option:contains(${TD.priorityOneKey})`).mouseup(); 
    });
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
    this.render(hbs`{{ticket-priority-select ticket=ticket priorities=priorities}}`);
    let $component = this.$(COMPONENT);
    assert.equal($component.find(PowerSelect).text().trim(), trans.t(TD.priorityOneKey));
    clickTrigger();
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-basic-dropdown-content').length, 1);
    assert.equal($('.ember-power-select-options > li').length, 3);
    run(() => { 
        $(`.ember-power-select-option:contains(${TD.priorityOneKey})`).mouseup(); 
    });
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
    this.render(hbs`{{ticket-priority-select ticket=ticket priorities=priorities}}`);
    let $component = this.$(COMPONENT);
    assert.equal($component.find(PowerSelect).text().trim(), trans.t(TD.priorityOneKey));
    clickTrigger();
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-basic-dropdown-content').length, 1);
    assert.equal($('.ember-power-select-options > li').length, 3);
    run(() => { 
        $(`.ember-power-select-option:contains(${TD.priorityTwoKey})`).mouseup(); 
    });
    assert.equal($(DROPDOWN).length, 0);
    assert.equal($('.ember-basic-dropdown-content').length, 0);
    assert.equal($('.ember-power-select-options > li').length, 0);
    assert.equal($component.find(PowerSelect).text().trim(), trans.t(TD.priorityTwoKey));
    assert.equal(ticket.get('priority').get('id'), TD.priorityTwoId);
    assert.deepEqual(priority_one.get('tickets'), []);
    assert.deepEqual(priority_two.get('tickets'), [TD.idOne]);
});

