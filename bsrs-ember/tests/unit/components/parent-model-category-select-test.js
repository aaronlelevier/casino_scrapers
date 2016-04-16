import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import ParentTicketCategorySelect from 'bsrs-ember/components/parent-model-category-select/component';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import CD from 'bsrs-ember/vendor/defaults/category';
import CCD from 'bsrs-ember/vendor/defaults/category-children';
import TICKET_CD from 'bsrs-ember/vendor/defaults/model-category';

var store, eventbus, ticket, category_one, category_two, category_three, run = Ember.run;

module('unit: parent-model-category-select component test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:person', 'model:ticket', 'model:category', 'model:model-category', 'model:category-children', 'model:uuid', 'service:eventbus', 'service:i18n']);
    eventbus = this.container.lookup('service:eventbus');
  }
});

//TODO: change_category_tree should just pass plain JS object
test('component is not valid when the only category (on the ticket model) has children', (assert) => {
  ticket = store.push('ticket', {id: TD.idOne});
  store.push('category-children', {id: CCD.idOne, category_pk: CD.idTwo, children_pk: CD.idOne});
  store.push('category-children', {id: CCD.idTwo, category_pk: CD.unusedId, children_pk: CD.idTwo});
  category_one = store.push('category', {id: CD.idOne, name: CD.nameOne, parent_id: CD.idTwo});
  category_two = store.push('category', {id: CD.idTwo, name: CD.nameTwo, parent_id: CD.unusedId});
  category_three = store.push('category', {id: CD.unusedId, name: CD.nameThree, parent_id: null});
  let subject = ParentTicketCategorySelect.create({ticket: ticket, eventbus: eventbus});
  assert.equal(ticket.get('categories').get('length'), 0);
  let valid = subject.get('valid');
  assert.equal(valid, false);
  ticket.change_category_tree({id: CD.unusedId});
  assert.equal(ticket.get('categories').get('length'), 1);
  valid = subject.get('valid');
  assert.equal(valid, false);
  ticket.change_category_tree({id: CD.idTwo});
  assert.equal(ticket.get('categories').get('length'), 2);
  valid = subject.get('valid');
  assert.equal(valid, false);
  ticket.change_category_tree({id: CD.idOne});
  assert.equal(ticket.get('categories').get('length'), 3);
  assert.equal(category_three.get('children').get('length'), 1);
  assert.equal(category_two.get('children').get('length'), 1);
  assert.equal(category_one.get('children').get('length'), 0);
  valid = subject.get('valid');
  assert.equal(valid, true);
});

test('sorted categories will start with the parent and end with the leaf child category', (assert) => {
    ticket = store.push('ticket', {id: TD.idOne});
    category_one = store.push('category', {id: CD.idOne, name: CD.nameOne, parent_id: CD.idTwo, children_fks: [], level: 2});
    category_two = store.push('category', {id: CD.idTwo, name: CD.nameTwo, parent_id: CD.unusedId, children_fks: [CD.idOne], level: 1});
    category_three = store.push('category', {id: CD.unusedId, name: CD.nameThree, parent_id: null, children_fks: [CD.idTwo], level: 0});
    let subject = ParentTicketCategorySelect.create({ticket: ticket, eventbus: eventbus});
    assert.equal(ticket.get('categories').get('length'), 0);
    let valid = subject.get('valid');
    assert.equal(valid, false);
    ticket.change_category_tree({id: CD.unusedId});
    assert.equal(ticket.get('categories').get('length'), 1);
    assert.equal(ticket.get('sorted_categories').get('length'), 1);
    assert.equal(ticket.get('sorted_categories').objectAt(0).get('id'), category_three.get('id'));
    ticket.change_category_tree({id: CD.idTwo});
    assert.equal(ticket.get('categories').get('length'), 2);
    assert.equal(ticket.get('sorted_categories').get('length'), 2);
    assert.equal(ticket.get('sorted_categories').objectAt(0).get('id'), category_three.get('id'));
    assert.equal(ticket.get('sorted_categories').objectAt(1).get('id'), category_two.get('id'));
    ticket.change_category_tree({id: CD.idOne});
    assert.equal(ticket.get('categories').get('length'), 3);
    assert.equal(ticket.get('sorted_categories').get('length'), 3);
    assert.equal(ticket.get('sorted_categories').objectAt(0).get('id'), category_three.get('id'));
    assert.equal(ticket.get('sorted_categories').objectAt(1).get('id'), category_two.get('id'));
    assert.equal(ticket.get('sorted_categories').objectAt(2).get('id'), category_one.get('id'));
});
