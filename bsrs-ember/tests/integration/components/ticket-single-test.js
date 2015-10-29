import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import TICKET_CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket-category';

let store, m2m, m2m_two, m2m_three, ticket, category_one, category_two, category_three, run = Ember.run, category_repo;

moduleForComponent('tickets/ticket-single', 'integration: ticket-single test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:ticket', 'model:ticket-status', 'model:ticket-category']);
        translation.initialize(this);
        category_repo = repository.initialize(this.container, this.registry, 'category');
        category_repo.findTopLevelCategories = function() { return store.find('category'); };
        m2m = store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idOne});
        m2m_two = store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idTwo, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idTwo});
        m2m_three = store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idThree, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.unusedId});
        category_one = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne, parent_id: CATEGORY_DEFAULTS.idTwo});
        category_two = store.push('category', {id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo, parent_id: CATEGORY_DEFAULTS.unusedId});
        category_three = store.push('category', {id: CATEGORY_DEFAULTS.unusedId, name: CATEGORY_DEFAULTS.nameThree, parent_id: null});
    }
});

test('each status shows up as a valid select option', function(assert) {
    store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne});
    store.push('ticket-status', {id: TICKET_DEFAULTS.statusTwoId, name: TICKET_DEFAULTS.statusTwo});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    let statuses = store.find('ticket-status');
    this.set('model', ticket);
    this.set('statuses', statuses);
    this.render(hbs`{{tickets/ticket-single model=model statuses=statuses}}`);
    let $component = this.$('.t-ticket-status-select');
    assert.equal($component.find('div.option:eq(0)').attr('data-value'), TICKET_DEFAULTS.statusOneId);
    assert.equal($component.find('div.option:eq(1)').attr('data-value'), TICKET_DEFAULTS.statusTwoId);
    assert.equal($component.find('div.option:eq(0)').text(), TICKET_DEFAULTS.statusOne);
    assert.equal($component.find('div.option:eq(1)').text(), TICKET_DEFAULTS.statusTwo);
});

test('the selected status reflects the status property on the ticket', function(assert) {
    store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: []});
    store.push('ticket-status', {id: TICKET_DEFAULTS.statusTwoId, name: TICKET_DEFAULTS.statusTwo, tickets: [TICKET_DEFAULTS.idOne]});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    let statuses = store.find('ticket-status');
    this.set('model', ticket);
    this.set('statuses', statuses);
    this.render(hbs`{{tickets/ticket-single model=model statuses=statuses}}`);
    let $component = this.$('.t-ticket-status-select');
    assert.equal($component.find('option:selected').val(), TICKET_DEFAULTS.statusTwoId);
});

test('on change will modify the underlying status property on ticket', function(assert) {
    store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOne, tickets: []});
    store.push('ticket-status', {id: TICKET_DEFAULTS.statusTwoId, name: TICKET_DEFAULTS.statusTwo, tickets: [TICKET_DEFAULTS.idOne]});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    let statuses = store.find('ticket-status');
    this.set('model', ticket);
    this.set('statuses', statuses);
    this.render(hbs`{{tickets/ticket-single model=model statuses=statuses}}`);
    let selector = 'select.t-ticket-status-select:eq(0) + .selectize-control';
    let $component = this.$(selector);
    assert.equal($component.find('div.item').attr('data-value'), TICKET_DEFAULTS.statusTwoId);
    assert.equal(ticket.get('status').get('id'), TICKET_DEFAULTS.statusTwoId);
    this.$(`${selector} > .selectize-input`).trigger('click');
    run(() => {
        this.$(`${selector} > .selectize-dropdown div.option:eq(0)`).trigger('click').trigger('change');
    });
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 2);
    assert.equal($component.find('div.item').attr('data-value'), TICKET_DEFAULTS.statusOneId);
    assert.equal(ticket.get('status').get('id'), TICKET_DEFAULTS.statusOneId);
});

test('each priority shows up as a valid select option', function(assert) {
    store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne});
    store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityTwoId, name: TICKET_DEFAULTS.priorityTwo});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    let priorities = store.find('ticket-priority');
    this.set('model', ticket);
    this.set('priorities', priorities);
    this.render(hbs`{{tickets/ticket-single model=model priorities=priorities}}`);
    let $component = this.$('.t-ticket-priority-select');
    assert.equal($component.find('div.item').length, 0);
    assert.equal($component.find('div.option').length, 2);
    assert.equal($component.find('div.option:eq(0)').attr('data-value'), TICKET_DEFAULTS.priorityOneId);
    assert.equal($component.find('div.option:eq(1)').attr('data-value'), TICKET_DEFAULTS.priorityTwoId);
    assert.equal($component.find('div.option:eq(0)').text(), TICKET_DEFAULTS.priorityOne);
    assert.equal($component.find('div.option:eq(1)').text(), TICKET_DEFAULTS.priorityTwo);
});

test('the selected priority reflects the priority property on the ticket', function(assert) {
    store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne, tickets: []});
    store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityTwoId, name: TICKET_DEFAULTS.priorityTwo, tickets: [TICKET_DEFAULTS.idOne]});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    let priorities = store.find('ticket-priority');
    this.set('model', ticket);
    this.set('priorities', priorities);
    this.render(hbs`{{tickets/ticket-single model=model priorities=priorities}}`);
    let $component = this.$('.t-ticket-priority-select');
    assert.equal($component.find('div.item').attr('data-value'), TICKET_DEFAULTS.priorityTwoId);
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 2);
});

test('on change will modify the underlying priority property on ticket', function(assert) {
    store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne, tickets: []});
    store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityTwoId, name: TICKET_DEFAULTS.priorityTwo, tickets: [TICKET_DEFAULTS.idOne]});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    let priorities = store.find('ticket-priority');
    this.set('model', ticket);
    this.set('priorities', priorities);
    this.render(hbs`{{tickets/ticket-single model=model priorities=priorities}}`);
    let selector = 'select.t-ticket-priority-select:eq(0) + .selectize-control';
    let $component = this.$(selector);
    assert.equal($component.find('div.item').attr('data-value'), TICKET_DEFAULTS.priorityTwoId);
    assert.equal(ticket.get('priority').get('id'), TICKET_DEFAULTS.priorityTwoId);
    this.$(`${selector} > .selectize-input`).trigger('click');
    run(() => {
        this.$(`${selector} > .selectize-dropdown div.option:eq(0)`).trigger('click').trigger('change');
    });
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 2);
    assert.equal($component.find('div.item').attr('data-value'), TICKET_DEFAULTS.priorityOneId);
    assert.equal(ticket.get('priority').get('id'), TICKET_DEFAULTS.priorityOneId);
});
