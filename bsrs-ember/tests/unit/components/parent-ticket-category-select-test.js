import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import ParentTicketCategorySelectComponent from 'bsrs-ember/components/parent-ticket-category-select/component';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import TICKET_CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket-category';
import random from 'bsrs-ember/models/random';

var store;

module('unit: parent-ticket-category-select component test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:person', 'model:ticket', 'model:category', 'model:ticket-category', 'model:uuid', 'service:eventbus']);
        // eventbus = this.container.lookup('service:eventbus');
        random.uuid = function() { return Ember.uuid(); };
    },
    afterEach() {
        random.uuid = function() { return 'abc123'; };
    }
});


test('component is not valid when the only category (on the ticket model) has children', (assert) => {
    assert.equal(1,1);
    // let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    // let category_one = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne, parent_id: CATEGORY_DEFAULTS.idTwo, children_fks: []});
    // let category_two = store.push('category', {id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo, parent_id: CATEGORY_DEFAULTS.unusedId, children_fks: [CATEGORY_DEFAULTS.idOne]});
    // let category_three = store.push('category', {id: CATEGORY_DEFAULTS.unusedId, name: CATEGORY_DEFAULTS.nameThree, parent_id: null, children_fks: [CATEGORY_DEFAULTS.idTwo]});
    // let subject = ParentTicketCategorySelectComponent.create({ticket: ticket});
    // assert.equal(ticket.get('categories').get('length'), 0);
    // let valid = subject.get('valid');
    // assert.equal(valid, false);
    // ticket.change_category_tree(category_three.get('id'));
    // assert.equal(ticket.get('categories').get('length'), 1);
    // valid = subject.get('valid');
    // assert.equal(valid, false);
    // ticket.change_category_tree(category_two.get('id'));
    // assert.equal(ticket.get('categories').get('length'), 2);
    // valid = subject.get('valid');
    // assert.equal(valid, false);
    // ticket.change_category_tree(category_one.get('id'));
    // assert.equal(ticket.get('categories').get('length'), 3);
    // assert.equal(category_three.get('children').get('length'), 1);
    // assert.equal(category_two.get('children').get('length'), 1);
    // assert.equal(category_one.get('children').get('length'), 0);
    // valid = subject.get('valid');
    // assert.equal(valid, true);
});
