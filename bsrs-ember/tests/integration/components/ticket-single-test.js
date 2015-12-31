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
        run(function() {
            m2m = store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idOne, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idOne});
            m2m_two = store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idTwo, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.idTwo});
            m2m_three = store.push('ticket-category', {id: TICKET_CATEGORY_DEFAULTS.idThree, ticket_pk: TICKET_DEFAULTS.idOne, category_pk: CATEGORY_DEFAULTS.unusedId});
            category_one = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne, parent_id: CATEGORY_DEFAULTS.idTwo});
            category_two = store.push('category', {id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo, parent_id: CATEGORY_DEFAULTS.unusedId});
            category_three = store.push('category', {id: CATEGORY_DEFAULTS.unusedId, name: CATEGORY_DEFAULTS.nameThree, parent_id: null});
        });
    }
});

test('each status shows up as a valid select option', function(assert) {
    run(function() {
        store.push('ticket-status', {id: TICKET_DEFAULTS.statusOneId, name: TICKET_DEFAULTS.statusOneKey});
        store.push('ticket-status', {id: TICKET_DEFAULTS.statusTwoId, name: TICKET_DEFAULTS.statusTwoKey});
        ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    });
    let statuses = store.find('ticket-status');
    this.set('model', ticket);
    this.set('statuses', statuses);
    this.render(hbs`{{tickets/ticket-single model=model statuses=statuses}}`);
    let $component = this.$('.t-ticket-status-select');
    assert.equal($component.length, 1);
});

test('each priority shows up as a valid select option', function(assert) {
    run(function() {
        store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOneKey});
        store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityTwoId, name: TICKET_DEFAULTS.priorityTwoKey});
        ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    });
    let priorities = store.find('ticket-priority');
    this.set('model', ticket);
    this.set('priorities', priorities);
    this.render(hbs`{{tickets/ticket-single model=model priorities=priorities}}`);
    let $component = this.$('.t-ticket-priority-select');
    assert.equal($component.length, 1);
});
