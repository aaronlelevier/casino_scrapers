import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import clickTrigger from 'bsrs-ember/tests/helpers/click-trigger';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import CD from 'bsrs-ember/vendor/defaults/category';
import TICKET_CD from 'bsrs-ember/vendor/defaults/ticket-category';

let store, m2m, m2m_two, m2m_three, ticket, category_one, category_two, category_three, run = Ember.run, category_repo;
const DROPDOWN = '.ember-basic-dropdown-trigger';

moduleForComponent('tickets/ticket-single', 'integration: ticket-single test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:ticket', 'model:ticket-status', 'model:ticket-category']);
        translation.initialize(this);
        run(function() {
            m2m = store.push('ticket-category', {id: TICKET_CD.idOne, ticket_pk: TD.idOne, category_pk: CD.idOne});
            m2m_two = store.push('ticket-category', {id: TICKET_CD.idTwo, ticket_pk: TD.idOne, category_pk: CD.idTwo});
            m2m_three = store.push('ticket-category', {id: TICKET_CD.idThree, ticket_pk: TD.idOne, category_pk: CD.unusedId});
            category_one = store.push('category', {id: CD.idOne, name: CD.nameOne, parent_id: CD.idTwo});
            category_two = store.push('category', {id: CD.idTwo, name: CD.nameTwo, parent_id: CD.unusedId});
            category_three = store.push('category', {id: CD.unusedId, name: CD.nameThree, parent_id: null});
        });
    }
});

test('each status shows up as a valid select option', function(assert) {
    run(function() {
        store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOneKey});
        store.push('ticket-status', {id: TD.statusTwoId, name: TD.statusTwoKey});
        ticket = store.push('ticket', {id: TD.idOne});
    });
    let statuses = store.find('ticket-status');
    this.set('model', ticket);
    this.set('statuses', statuses);
    this.render(hbs`{{tickets/ticket-single model=model statuses=statuses activities=statuses}}`);
    let $component = this.$('.t-ticket-status-select');
    assert.equal($component.length, 1);
});

test('each priority shows up as a valid select option', function(assert) {
    run(function() {
        store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOneKey});
        store.push('ticket-priority', {id: TD.priorityTwoId, name: TD.priorityTwoKey});
        ticket = store.push('ticket', {id: TD.idOne});
    });
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
    this.$('.t-ticket-priority-select > .ember-basic-dropdown-trigger').mousedown();
    run(() => {
        $(`.ember-power-select-option:contains(${TD.priorityTwoKey})`).mouseup();
    });
    assert.ok(this.$('.tag:eq(0)').hasClass('ticket-priority-high'));
});

test('changing status changes the class', function(assert) {
    run(() => {
        store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOneKey, tickets: [TD.idOne]});
        store.push('ticket-status', {id: TD.statusTwoId, name: TD.statusTwoKey});
        ticket = store.push('ticket', {id: TD.idOne, status_fk: TD.statusOneId});
    });
    let statuses = store.find('ticket-status');
    this.set('model', ticket);
    this.set('statuses', statuses);
    this.render(hbs`{{tickets/ticket-single model=model statuses=statuses activities=statuses}}`);
    assert.ok(this.$('.tag:eq(1)').hasClass('ticket-status-new'));
    let $component = this.$('.t-ticket-status-select');
    assert.equal($component.length, 1);
    this.$('.t-ticket-status-select > .ember-basic-dropdown-trigger').mousedown();
    run(() => {
        $(`.ember-power-select-option:contains(${TD.statusTwoKey})`).mouseup();
    });
    assert.ok(this.$('.tag:eq(1)').hasClass('ticket-status-deferred'));
});
