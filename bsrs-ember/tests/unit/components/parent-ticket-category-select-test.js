import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import ParentTicketCategorySelect from 'bsrs-ember/components/parent-ticket-category-select/component';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import TICKET_CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket-category';

var store, eventbus;

module('unit: parent-ticket-category-select component test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:person', 'model:ticket', 'model:category', 'model:ticket-category', 'model:uuid', 'service:eventbus']);
        eventbus = this.container.lookup('service:eventbus');
    }
});

test('component is not valid when the only category (on the ticket model) has children', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    let category_one = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne, parent_id: CATEGORY_DEFAULTS.idTwo, children_fks: []});
    let category_two = store.push('category', {id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo, parent_id: CATEGORY_DEFAULTS.unusedId, children_fks: [CATEGORY_DEFAULTS.idOne]});
    let category_three = store.push('category', {id: CATEGORY_DEFAULTS.unusedId, name: CATEGORY_DEFAULTS.nameThree, parent_id: null, children_fks: [CATEGORY_DEFAULTS.idTwo]});
    let subject = ParentTicketCategorySelect.create({ticket: ticket, eventbus: eventbus});
    assert.equal(ticket.get('categories').get('length'), 0);
    let valid = subject.get('valid');
    assert.equal(valid, false);
    Ember.run(function() {
        ticket.change_category_tree(category_three.get('id'));
    });
    assert.equal(ticket.get('categories').get('length'), 1);
    valid = subject.get('valid');
    assert.equal(valid, false);
    Ember.run(function() {
        ticket.change_category_tree(category_two.get('id'));
    });
    assert.equal(ticket.get('categories').get('length'), 2);
    valid = subject.get('valid');
    assert.equal(valid, false);
    Ember.run(function() {
        ticket.change_category_tree(category_one.get('id'));
    });
    assert.equal(ticket.get('categories').get('length'), 3);
    assert.equal(category_three.get('has_many_children').get('length'), 1);
    assert.equal(category_two.get('has_many_children').get('length'), 1);
    assert.equal(category_one.get('has_many_children').get('length'), 0);
    valid = subject.get('valid');
    assert.equal(valid, true);
});

test('sorted categories will start with the parent and end with the leaf child category', (assert) => {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    let category_one = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne, parent_id: CATEGORY_DEFAULTS.idTwo, children_fks: []});
    let category_two = store.push('category', {id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo, parent_id: CATEGORY_DEFAULTS.unusedId, children_fks: [CATEGORY_DEFAULTS.idOne]});
    let category_three = store.push('category', {id: CATEGORY_DEFAULTS.unusedId, name: CATEGORY_DEFAULTS.nameThree, parent_id: null, children_fks: [CATEGORY_DEFAULTS.idTwo]});
    let subject = ParentTicketCategorySelect.create({ticket: ticket, eventbus: eventbus});
    assert.equal(ticket.get('categories').get('length'), 0);
    let valid = subject.get('valid');
    assert.equal(valid, false);
    Ember.run(function() {
        ticket.change_category_tree(category_three.get('id'));
    });
    assert.equal(ticket.get('categories').get('length'), 1);
    assert.equal(ticket.get('sorted_categories').get('length'), 1);
    assert.equal(ticket.get('sorted_categories').objectAt(0).get('id'), category_three.get('id'));
    Ember.run(function() {
        ticket.change_category_tree(category_two.get('id'));
    });
    assert.equal(ticket.get('categories').get('length'), 2);
    assert.equal(ticket.get('sorted_categories').get('length'), 2);
    assert.equal(ticket.get('sorted_categories').objectAt(0).get('id'), category_three.get('id'));
    assert.equal(ticket.get('sorted_categories').objectAt(1).get('id'), category_two.get('id'));
    Ember.run(function() {
        ticket.change_category_tree(category_one.get('id'));
    });
    assert.equal(ticket.get('categories').get('length'), 3);
    assert.equal(ticket.get('sorted_categories').get('length'), 3);
    assert.equal(ticket.get('sorted_categories').objectAt(0).get('id'), category_three.get('id'));
    assert.equal(ticket.get('sorted_categories').objectAt(1).get('id'), category_two.get('id'));
    assert.equal(ticket.get('sorted_categories').objectAt(2).get('id'), category_one.get('id'));
});
