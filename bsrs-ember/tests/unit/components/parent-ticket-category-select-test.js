import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import ParentTicketCategorySelect from 'bsrs-ember/components/parent-ticket-category-select/component';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import TICKET_CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket-category';

var store, eventbus, ticket, category_one, category_two, category_three, run = Ember.run;

module('unit: parent-ticket-category-select component test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:person', 'model:ticket', 'model:category', 'model:ticket-category', 'model:uuid', 'service:eventbus', 'service:i18n']);
        eventbus = this.container.lookup('service:eventbus');
    }
});

//TODO: change_category_tree should just pass plain JS object
test('component is not valid when the only category (on the ticket model) has children', (assert) => {
    ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    category_one = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne, parent_id: CATEGORY_DEFAULTS.idTwo, children_fks: []});
    category_two = store.push('category', {id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo, parent_id: CATEGORY_DEFAULTS.unusedId, children_fks: [CATEGORY_DEFAULTS.idOne]});
    category_three = store.push('category', {id: CATEGORY_DEFAULTS.unusedId, name: CATEGORY_DEFAULTS.nameThree, parent_id: null, children_fks: [CATEGORY_DEFAULTS.idTwo]});
    let subject = ParentTicketCategorySelect.create({ticket: ticket, eventbus: eventbus});
    assert.equal(ticket.get('categories').get('length'), 0);
    let valid = subject.get('valid');
    assert.equal(valid, false);
    ticket.change_category_tree(category_three);
    assert.equal(ticket.get('categories').get('length'), 1);
    valid = subject.get('valid');
    assert.equal(valid, false);
    ticket.change_category_tree(category_two);
    assert.equal(ticket.get('categories').get('length'), 2);
    valid = subject.get('valid');
    assert.equal(valid, false);
    ticket.change_category_tree(category_one);
    assert.equal(ticket.get('categories').get('length'), 3);
    assert.equal(category_three.get('has_many_children').get('length'), 1);
    assert.equal(category_two.get('has_many_children').get('length'), 1);
    assert.equal(category_one.get('has_many_children').get('length'), 0);
    valid = subject.get('valid');
    assert.equal(valid, true);
});

test('sorted categories will start with the parent and end with the leaf child category', (assert) => {
    ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    category_one = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne, parent_id: CATEGORY_DEFAULTS.idTwo, children_fks: [], level: 2});
    category_two = store.push('category', {id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo, parent_id: CATEGORY_DEFAULTS.unusedId, children_fks: [CATEGORY_DEFAULTS.idOne], level: 1});
    category_three = store.push('category', {id: CATEGORY_DEFAULTS.unusedId, name: CATEGORY_DEFAULTS.nameThree, parent_id: null, children_fks: [CATEGORY_DEFAULTS.idTwo], level: 0});
    let subject = ParentTicketCategorySelect.create({ticket: ticket, eventbus: eventbus});
    assert.equal(ticket.get('categories').get('length'), 0);
    let valid = subject.get('valid');
    assert.equal(valid, false);
    ticket.change_category_tree(category_three);
    assert.equal(ticket.get('categories').get('length'), 1);
    assert.equal(ticket.get('sorted_categories').get('length'), 1);
    assert.equal(ticket.get('sorted_categories').objectAt(0).get('id'), category_three.get('id'));
    ticket.change_category_tree(category_two);
    assert.equal(ticket.get('categories').get('length'), 2);
    assert.equal(ticket.get('sorted_categories').get('length'), 2);
    assert.equal(ticket.get('sorted_categories').objectAt(0).get('id'), category_three.get('id'));
    assert.equal(ticket.get('sorted_categories').objectAt(1).get('id'), category_two.get('id'));
    ticket.change_category_tree(category_one);
    assert.equal(ticket.get('categories').get('length'), 3);
    assert.equal(ticket.get('sorted_categories').get('length'), 3);
    assert.equal(ticket.get('sorted_categories').objectAt(0).get('id'), category_three.get('id'));
    assert.equal(ticket.get('sorted_categories').objectAt(1).get('id'), category_two.get('id'));
    assert.equal(ticket.get('sorted_categories').objectAt(2).get('id'), category_one.get('id'));
});
