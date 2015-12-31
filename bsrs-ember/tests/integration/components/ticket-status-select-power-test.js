import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import clickTrigger from 'bsrs-ember/tests/helpers/click-trigger';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import tHelper from 'ember-i18n/helper';

var store, ticket, status_one, status_two, status_three, run = Ember.run, trans;
const PowerSelect = '.ember-power-select-trigger';
const COMPONENT = '.t-ticket-status-select';
const DROPDOWN = '.ember-power-select-dropdown';

moduleForComponent('ticket-status-select', 'integration: ticket-status-select test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:ticket', 'model:ticket-status']);
        run(function() {
            ticket = store.push('ticket', {id: TD.idOne, status_fk: TD.statusOneId});
            status_one = store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOneKey});
            status_two = store.push('ticket-status', {id: TD.statusTwoId, name: TD.statusTwoKey});
            status_three = store.push('ticket-status', {id: TD.statusThreeId, name: TD.statusThree});
        });
        trans = this.container.lookup('service:i18n');
    }
});

test('should render a selectbox when status options are empty (initial state of selectize)', function(assert) {
    let statuses = Ember.A([]);
    this.set('ticket', ticket);
    this.set('statuses', statuses);
    this.render(hbs`{{ticket-status-select ticket=ticket statuses=statuses}}`);
    let $component = this.$(COMPONENT);
    assert.equal($component.find(PowerSelect).text().trim(), '');
    clickTrigger();
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 1);
    assert.equal($('li.ember-power-select-option').text(), 'No results found');
    assert.ok(!ticket.get('status'));
    assert.notOk($('.ember-power-select-search').text());
});

test('should render a selectbox with bound options', function(assert) {
    let statuses = store.find('ticket-status');
    status_one.set('tickets', [TD.idOne]);
    this.set('ticket', ticket);
    this.set('statuses', statuses);
    this.render(hbs`{{ticket-status-select ticket=ticket statuses=statuses}}`);
    let $component = this.$(COMPONENT);
    assert.equal($component.find(`${PowerSelect}`).text().trim(), trans.t(TD.statusOneKey));
    clickTrigger();
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 3);
    assert.equal(ticket.get('status').get('id'), TD.statusOneId);
    assert.deepEqual(status_one.get('tickets'), [TD.idOne]);
});

test('should be able to select new status when one doesnt exist', function(assert) {
    let statuses = store.find('ticket-status');
    this.set('ticket', ticket);
    this.set('statuses', statuses);
    this.render(hbs`{{ticket-status-select ticket=ticket statuses=statuses}}`);
    let $component = this.$(COMPONENT);
    assert.equal($component.find(PowerSelect).text().trim(), '');
    clickTrigger();
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 3);
    run(() => {
        $(`.ember-power-select-option:contains(${TD.statusOneKey})`).mouseup();
    });
    assert.equal($(DROPDOWN).length, 0);
    assert.equal($('.ember-power-select-options > li').length, 0);
    assert.equal($component.find(PowerSelect).text().trim(), trans.t(TD.statusOneKey));
    assert.equal(ticket.get('status').get('id'), TD.statusOneId);
    assert.deepEqual(status_one.get('tickets'), [TD.idOne]);
});

test('should be able to select same status when ticket already has a status', function(assert) {
    let statuses = store.find('ticket-status');
    status_one.set('tickets', [TD.idOne]);
    this.set('ticket', ticket);
    this.set('statuses', statuses);
    this.render(hbs`{{ticket-status-select ticket=ticket statuses=statuses}}`);
    let $component = this.$(COMPONENT);
    assert.equal($component.find(PowerSelect).text().trim(), trans.t(TD.statusOneKey));
    clickTrigger();
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 3);
    run(() => {
        $(`.ember-power-select-option:contains(${TD.statusOneKey})`).mouseup();
    });
    assert.equal($(DROPDOWN).length, 0);
    assert.equal($('.ember-power-select-options > li').length, 0);
    assert.equal($component.find(PowerSelect).text().trim(), trans.t(TD.statusOneKey));
    assert.equal(ticket.get('status').get('id'), TD.statusOneId);
    assert.deepEqual(status_one.get('tickets'), [TD.idOne]);
});

test('should be able to select new status when ticket already has a status', function(assert) {
    let statuses = store.find('ticket-status');
    status_one.set('tickets', [TD.idOne]);
    this.set('ticket', ticket);
    this.set('statuses', statuses);
    this.render(hbs`{{ticket-status-select ticket=ticket statuses=statuses}}`);
    let $component = this.$(COMPONENT);
    assert.equal($component.find(PowerSelect).text().trim(), trans.t(TD.statusOneKey));
    clickTrigger();
    assert.equal($(DROPDOWN).length, 1);
    assert.equal($('.ember-power-select-options > li').length, 3);
    run(() => {
        $(`.ember-power-select-option:contains(${TD.statusTwoKey})`).mouseup();
    });
    assert.equal($(DROPDOWN).length, 0);
    assert.equal($('.ember-power-select-options > li').length, 0);
    assert.equal(ticket.get('status').get('id'), TD.statusTwoId);
    assert.deepEqual(status_one.get('tickets'), []);
    assert.deepEqual(status_two.get('tickets'), [TD.idOne]);
});
