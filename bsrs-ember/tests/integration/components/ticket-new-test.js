import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import TICKET_CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket-category';
import repository from 'bsrs-ember/tests/helpers/repository';

let store, m2m, m2m_two, m2m_three, ticket, category_one, category_two, category_three, run = Ember.run, category_repo;
const CATEGORY_ONE = '.t-ticket-category-select:eq(0) > .ember-basic-dropdown > .ember-power-select-trigger';
const CATEGORY_TWO = '.t-ticket-category-select:eq(1) > .ember-basic-dropdown > .ember-power-select-trigger';
const CATEGORY_THREE = '.t-ticket-category-select:eq(2) > .ember-basic-dropdown > .ember-power-select-trigger';

moduleForComponent('tickets/ticket-new', 'integration: ticket-new test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:ticket', 'model:ticket-status']);
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
    this.render(hbs`{{tickets/ticket-new model=model statuses=statuses}}`);
    let $component = this.$('.t-ticket-status-select');
    assert.equal($component.length, 1);
});

test('each priority shows up as a valid select option', function(assert) {
    store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityOneId, name: TICKET_DEFAULTS.priorityOne});
    store.push('ticket-priority', {id: TICKET_DEFAULTS.priorityTwoId, name: TICKET_DEFAULTS.priorityTwo});
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    let priorities = store.find('ticket-priority');
    this.set('model', ticket);
    this.set('priorities', priorities);
    this.render(hbs`{{tickets/ticket-new model=model priorities=priorities}}`);
    let $component = this.$('.t-ticket-priority-select');
    assert.equal($component.length, 1);
});

test('only one select is rendered when ticket has no categories (and no top level options yet resolved)', function(assert) {
    let top_level_category_options = Ember.A([]);
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.unusedId});
    this.set('model', ticket);
    this.set('top_level_category_options', top_level_category_options);
    this.render(hbs`{{tickets/ticket-new model=model top_level_category_options=top_level_category_options}}`);
    let $component = this.$('.t-ticket-category-select');
    assert.equal(ticket.get('categories').get('length'), 0);
    assert.equal($component.length, 1);
    assert.equal($component.find('div.item').length, 0);
    assert.equal($component.find('div.option').length, 0);
});

test('a second select will be rendred after top level category picked', function(assert) {
    store.clear('category');
    store.clear('ticket-category');
    let onlyParents = function(category) {
        return category.get('parent') === undefined;
    };
    let top_level_category_options = store.find('category', onlyParents, ['id']);
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    this.set('model', ticket);
    this.set('top_level_category_options', top_level_category_options);
    this.render(hbs`{{tickets/ticket-new model=model top_level_category_options=top_level_category_options}}`);
    let $components = this.$('.t-ticket-category-select');
    let $component = this.$('.t-ticket-category-select:eq(0)');
    run(() => { 
        this.$(`${CATEGORY_ONE}`).click(); 
    });
    assert.equal($('.ember-power-select-dropdown').length, 1);
    assert.equal($('.ember-power-select-options > li').length, 1);
    assert.equal($('li.ember-power-select-option').text(), 'No results found');
    assert.equal($components.length, 1);
    run(() => {
        //route finished ajax of top level
        store.push('category', {id: CATEGORY_DEFAULTS.unusedId, name: CATEGORY_DEFAULTS.nameOne, children_fks: [CATEGORY_DEFAULTS.idTwo], parent_id: null});
        //this category is the child of unusedId and got serialized by same CategoryDeserializer (thus getting children_fks and parent_fks)
        store.push('category', {id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameRepairChild, parent_id: CATEGORY_DEFAULTS.unusedId});
    });
    run(() => { 
        //open and close the dropdown
        this.$(`${CATEGORY_ONE}`).click(); 
        this.$(`${CATEGORY_ONE}`).click(); 
    });
    assert.equal($('.ember-power-select-dropdown').length, 1);
    assert.equal($('.ember-power-select-options > li').length, 1);
    assert.equal($('li.ember-power-select-option').text().trim(), CATEGORY_DEFAULTS.nameOne);
    assert.equal($components.length, 1);
    category_repo.findById = function() {
        run(() => {
            store.push('category', {id: CATEGORY_DEFAULTS.unusedId, name: CATEGORY_DEFAULTS.nameOne, children_fks: [CATEGORY_DEFAULTS.idTwo], parent_id: null});
            store.push('category', {id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameRepairChild, parent_id: CATEGORY_DEFAULTS.unusedId});
        });
    };
    run(() => { 
        $(`.ember-power-select-option:contains(${CATEGORY_DEFAULTS.nameOne})`).click();
    });
    $components = this.$('.t-ticket-category-select');
    assert.equal($components.length, 2);
    let $component_two = this.$('.t-ticket-category-select:eq(1)');
    run(() => { 
        this.$(`${CATEGORY_TWO}`).click(); 
    });
    assert.equal($('.ember-power-select-dropdown').length, 1);
    assert.equal($('.ember-power-select-options > li').length, 1);
    assert.equal($('li.ember-power-select-option').text().trim(), CATEGORY_DEFAULTS.nameRepairChild);
    run(() => { 
        $(`.ember-power-select-option:contains(${CATEGORY_DEFAULTS.nameRepairChild})`).click();
    });
    $components = this.$('.t-ticket-category-select');
    assert.equal($components.length, 2);
    assert.equal(ticket.get('top_level_category').get('id'), CATEGORY_DEFAULTS.unusedId);
    assert.equal(ticket.get('categories').get('length'), 2);
    assert.equal(ticket.get('sorted_categories').objectAt(0).get('name'), CATEGORY_DEFAULTS.nameOne);
    assert.equal(ticket.get('sorted_categories').objectAt(1).get('name'), CATEGORY_DEFAULTS.nameRepairChild);
    run(() => {
        store.push('category', {id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameRepairChild, children_fks: [CATEGORY_DEFAULTS.idOne], parent_id: CATEGORY_DEFAULTS.unusedId});
        store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.namePlumbingChild, parent_id: CATEGORY_DEFAULTS.idTwo});
    });
    category_repo.findById = function() {
        run(() => {
            store.push('category', {id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameRepairChild, children_fks: [CATEGORY_DEFAULTS.idOne], parent_id: CATEGORY_DEFAULTS.unusedId});
            store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.namePlumbingChild, parent_id: CATEGORY_DEFAULTS.idTwo});
        });
    };
    $components = this.$('.t-ticket-category-select');
    assert.equal($components.length, 3);
    run(() => { 
        this.$(`${CATEGORY_THREE}`).click(); 
    });
    assert.equal($('.ember-power-select-dropdown').length, 1);
    assert.equal($('.ember-power-select-options > li').length, 1);
    assert.equal($('li.ember-power-select-option').text().trim(), CATEGORY_DEFAULTS.namePlumbingChild);
    run(() => { 
        $(`.ember-power-select-option:contains(${CATEGORY_DEFAULTS.namePlumbingChild})`).click();
    });
    assert.equal(ticket.get('categories').get('length'), 3);
    assert.equal(ticket.get('sorted_categories').objectAt(0).get('name'), CATEGORY_DEFAULTS.nameOne);
    assert.equal(ticket.get('sorted_categories').objectAt(1).get('name'), CATEGORY_DEFAULTS.nameRepairChild);
    assert.equal(ticket.get('sorted_categories').objectAt(2).get('name'), CATEGORY_DEFAULTS.namePlumbingChild);
});
