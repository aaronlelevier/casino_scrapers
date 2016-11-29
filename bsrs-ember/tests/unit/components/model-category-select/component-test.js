import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import CD from 'bsrs-ember/vendor/defaults/category';
import CCD from 'bsrs-ember/vendor/defaults/category-children';

var store;

moduleForComponent('model-category-select', 'Unit | Component | model category select', {
  needs: ['model:person', 'model:ticket', 'model:category', 'model:model-category', 'model:category-children', 'model:uuid', 'service:i18n', 'validator:presence'],
  unit: true,
  beforeEach() {
    store = module_registry(this.container, this.registry, []);
  }
});


test('categories_selected will always return the correct category object based on index', function(assert) {
  let ticket, category_rando, category_top_level, category_two, category_one;
  run(() => {
    ticket = store.push('ticket', {id: TD.idOne});
    //rando child
    store.push('category', {id: CD.idLossPreventionChild, name: CD.nameLossPreventionChild, parent_id: CD.idWatChild, level: 3});
    //new 2nd level
    category_rando = store.push('category', {id: CD.idWatChild, name: CD.nameWatChild, parent_id: CD.unusedId, level: 1});
    store.push('category-children', {id: CD.idOne, category_pk: CD.idWatChild, children_pk: CD.idLossPreventionChild});
    //top level
    category_top_level = store.push('category', {id: CD.unusedId, name: CD.nameThree, parent_id: undefined, level: 0});
    store.push('category-children', {id: CCD.idTwo, category_pk: CD.unusedId, children_pk: CD.idTwo});
    store.push('category-children', {id: CCD.idThree, category_pk: CD.unusedId, children_pk: CD.idWatChild});
    //second level
    category_two = store.push('category', {id: CD.idTwo, name: CD.nameTwo, parent_id: CD.unusedId, level: 1});
    store.push('category-children', {id: 4, category_pk: CD.idTwo, children_pk: CD.idOne});
    //third level
    category_one = store.push('category', {id: CD.idOne, name: CD.nameOne, parent_id: CD.idTwo, level: 2});
  });
  let subject_one = this.subject({ticket: ticket, index: undefined});
  // TODO: these are not creating separate instances
  let subject_two = this.subject({ticket: ticket, index: 1});
  let subject_three = this.subject({ticket: ticket, index: 2});
  assert.equal(ticket.get('categories').get('length'), 0);
  assert.equal(subject_one.get('categories_selected'), undefined);
  assert.equal(subject_two.get('categories_selected'), undefined);
  assert.equal(subject_three.get('categories_selected'), undefined);
  assert.equal(ticket.get('model_categories').get('length'), 0);
  assert.equal(ticket.get('model_categories_with_removed').get('length'), 0);
  ticket.change_category_tree({id: category_top_level.get('id')});
  assert.equal(ticket.get('categories').get('length'), 1);
  assert.equal(ticket.get('sorted_categories').get('length'), 1);
  assert.equal(ticket.get('sorted_categories').objectAt(0).get('id'), category_top_level.get('id'));
  assert.equal(subject_one.get('categories_selected').get('id'), category_top_level.get('id'));
  // assert.equal(subject_two.get('categories_selected'), undefined);
  // assert.equal(subject_three.get('categories_selected'), undefined);
  assert.equal(ticket.get('model_categories').get('length'), 1);
  assert.equal(ticket.get('model_categories_with_removed').get('length'), 1);
  ticket.change_category_tree({id: category_two.get('id')});
  assert.equal(ticket.get('categories').get('length'), 2);
  assert.equal(ticket.get('sorted_categories').get('length'), 2);
  assert.equal(ticket.get('sorted_categories').objectAt(0).get('id'), category_top_level.get('id'));
  assert.equal(ticket.get('sorted_categories').objectAt(1).get('id'), category_two.get('id'));
  assert.equal(subject_one.get('categories_selected').get('id'), category_top_level.get('id'));
  // assert.equal(subject_two.get('categories_selected').get('id'), category_two.get('id'));
  // assert.equal(subject_three.get('categories_selected'), undefined);
  assert.equal(ticket.get('model_categories').get('length'), 2);
  assert.equal(ticket.get('model_categories_with_removed').get('length'), 2);
  ticket.change_category_tree({id: category_one.get('id')});
  assert.equal(ticket.get('categories').get('length'), 3);
  assert.equal(ticket.get('sorted_categories').get('length'), 3);
  assert.equal(ticket.get('sorted_categories').objectAt(0).get('id'), category_top_level.get('id'));
  assert.equal(ticket.get('sorted_categories').objectAt(1).get('id'), category_two.get('id'));
  assert.equal(ticket.get('sorted_categories').objectAt(2).get('id'), category_one.get('id'));
  assert.equal(subject_one.get('categories_selected').get('id'), category_top_level.get('id'));
  // assert.equal(subject_two.get('categories_selected').get('id'), category_two.get('id'));
  // assert.equal(subject_three.get('categories_selected').get('id'), category_one.get('id'));
  assert.equal(ticket.get('model_categories').get('length'), 3);
  assert.equal(ticket.get('model_categories_with_removed').get('length'), 3);
  // //select rando in place of category_two
  ticket.change_category_tree({id: category_rando.get('id')});
  assert.equal(ticket.get('categories').get('length'), 2);
  assert.equal(ticket.get('sorted_categories').get('length'), 2);
  assert.equal(ticket.get('sorted_categories').objectAt(0).get('id'), category_top_level.get('id'));
  assert.equal(ticket.get('sorted_categories').objectAt(1).get('id'), category_rando.get('id'));
  assert.equal(subject_one.get('categories_selected').get('id'), category_top_level.get('id'));
  // assert.equal(subject_two.get('categories_selected').get('id'), category_rando.get('id'));
  // assert.equal(subject_three.get('categories_selected'), undefined);
  assert.equal(ticket.get('model_categories').get('length'), 2);
  assert.equal(ticket.get('model_categories_with_removed').get('length'), 4);
  ticket.change_category_tree({id: category_two.get('id')});
  assert.equal(ticket.get('categories').get('length'), 2);
  assert.equal(ticket.get('sorted_categories').get('length'), 2);
  assert.equal(ticket.get('sorted_categories').objectAt(0).get('id'), category_top_level.get('id'));
  assert.equal(ticket.get('sorted_categories').objectAt(1).get('id'), category_two.get('id'));
  assert.equal(subject_one.get('categories_selected').get('id'), category_top_level.get('id'));
  // assert.equal(subject_two.get('categories_selected').get('id'), category_two.get('id'));
  // assert.equal(subject_three.get('categories_selected'), undefined);
  assert.equal(ticket.get('model_categories').get('length'), 2);
  assert.equal(ticket.get('model_categories_with_removed').get('length'), 4);
});
