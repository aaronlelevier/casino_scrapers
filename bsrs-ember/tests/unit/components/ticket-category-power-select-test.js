import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TicketCategories from 'bsrs-ember/components/ticket-category-power-select/component';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import TICKET_CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket-category';

var store;

module('unit: ticket-category-power-select component test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:person', 'model:ticket', 'model:category', 'model:ticket-category', 'model:uuid']);
    }
});

test('categories_selected will always return the correct category object based on index', function(assert) {
    let ticket = store.push('ticket', {id: TICKET_DEFAULTS.idOne});
    //rando child
    let category_huh = store.push('category', {id: CATEGORY_DEFAULTS.idLossPreventionChild, name: CATEGORY_DEFAULTS.nameLossPreventionChild, parent_id: CATEGORY_DEFAULTS.idWatChild, children_fks: []});
    //new 2nd level
    let category_rando = store.push('category', {id: CATEGORY_DEFAULTS.idWatChild, name: CATEGORY_DEFAULTS.nameWatChild, parent_id: CATEGORY_DEFAULTS.unusedId, children_fks: [CATEGORY_DEFAULTS.idLossPreventionChild]});
    //top level
    let category_top_level = store.push('category', {id: CATEGORY_DEFAULTS.unusedId, name: CATEGORY_DEFAULTS.nameThree, parent_id: undefined, children_fks: [CATEGORY_DEFAULTS.idTwo, CATEGORY_DEFAULTS.idWatChild]});
    //second level
    let category_two = store.push('category', {id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo, parent_id: CATEGORY_DEFAULTS.unusedId, children_fks: [CATEGORY_DEFAULTS.idOne]});
    //third level
    let category_one = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne, parent_id: CATEGORY_DEFAULTS.idTwo, children_fks: []});

    let subject_one = TicketCategories.create({ticket: ticket, index: undefined});
    let subject_two = TicketCategories.create({ticket: ticket, index: 1});
    let subject_three = TicketCategories.create({ticket: ticket, index: 2});

    assert.equal(ticket.get('categories').get('length'), 0);
    assert.equal(subject_one.get('categories_selected'), undefined);
    assert.equal(subject_two.get('categories_selected'), undefined);
    assert.equal(subject_three.get('categories_selected'), undefined);

    Ember.run(function() {
        ticket.change_category_tree(category_top_level.get('id'));
    });

    assert.equal(ticket.get('categories').get('length'), 1);
    assert.equal(ticket.get('sorted_categories').get('length'), 1);
    assert.equal(ticket.get('sorted_categories').objectAt(0).get('id'), category_top_level.get('id'));
    assert.equal(subject_one.get('categories_selected').get('id'), category_top_level.get('id'));
    assert.equal(subject_two.get('categories_selected'), undefined);
    assert.equal(subject_three.get('categories_selected'), undefined);

    Ember.run(function() {
        ticket.change_category_tree(category_two.get('id'));
    });

    assert.equal(ticket.get('categories').get('length'), 2);
    assert.equal(ticket.get('sorted_categories').get('length'), 2);
    assert.equal(ticket.get('sorted_categories').objectAt(0).get('id'), category_top_level.get('id'));
    assert.equal(ticket.get('sorted_categories').objectAt(1).get('id'), category_two.get('id'));
    assert.equal(subject_one.get('categories_selected').get('id'), category_top_level.get('id'));
    assert.equal(subject_two.get('categories_selected').get('id'), category_two.get('id'));
    assert.equal(subject_three.get('categories_selected'), undefined);

    Ember.run(function() {
        ticket.change_category_tree(category_one.get('id'));
    });

    assert.equal(ticket.get('categories').get('length'), 3);
    assert.equal(ticket.get('sorted_categories').get('length'), 3);
    assert.equal(ticket.get('sorted_categories').objectAt(0).get('id'), category_top_level.get('id'));
    assert.equal(ticket.get('sorted_categories').objectAt(1).get('id'), category_two.get('id'));
    assert.equal(ticket.get('sorted_categories').objectAt(2).get('id'), category_one.get('id'));
    assert.equal(subject_one.get('categories_selected').get('id'), category_top_level.get('id'));
    assert.equal(subject_two.get('categories_selected').get('id'), category_two.get('id'));
    assert.equal(subject_three.get('categories_selected').get('id'), category_one.get('id'));

    Ember.run(function() {
        //select rando in place of category_two
        ticket.change_category_tree(category_rando.get('id'));
    });

    assert.equal(ticket.get('categories').get('length'), 2);
    assert.equal(ticket.get('sorted_categories').get('length'), 2);
    assert.equal(ticket.get('sorted_categories').objectAt(0).get('id'), category_top_level.get('id'));
    assert.equal(ticket.get('sorted_categories').objectAt(1).get('id'), category_rando.get('id'));
    assert.equal(subject_one.get('categories_selected').get('id'), category_top_level.get('id'));
    assert.equal(subject_two.get('categories_selected').get('id'), category_rando.get('id'));
    assert.equal(subject_three.get('categories_selected'), undefined);
});
