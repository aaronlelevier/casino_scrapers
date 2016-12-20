import Ember from 'ember';
const { run } = Ember;
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LINK from 'bsrs-ember/vendor/defaults/link';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import TP from 'bsrs-ember/vendor/defaults/ticket-priority';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import CD from 'bsrs-ember/vendor/defaults/category';
import TCD from 'bsrs-ember/vendor/defaults/model-category';

var store, priority, status, dtd, link;

module('unit: link test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:link',
      'model:dtd', 'model:model-category', 'model:category', 'model:ticket-priority',
      'model:ticket-status', 'service:i18n']);
    run(() => {
      priority = store.push('ticket-priority', {id: TP.priorityOneId, name: TP.priorityOne});
      store.push('ticket-priority', {id: TP.priorityTwoId, name: TP.priorityTwo});
      status = store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne});
      store.push('ticket-status', {id: TD.statusTwoId, name: TD.statusTwo});
      link = store.push('link', {id: LINK.idOne});
    });
  }
});

test('request dirty tracking', (assert) => {
  assert.ok(!link.get('isDirty'));
  link.set('request', LINK.requestOne);
  assert.ok(link.get('isDirty'));
  link.set('request', '');
  assert.ok(link.get('isNotDirty'));
});

// TODO: check these 3 tests b/c not String types
test('order dirty tracking', (assert) => {
  assert.ok(!link.get('isDirty'));
  link.set('order', LINK.orderOne);
  assert.ok(link.get('isDirty'));
  link.set('order', '');
  assert.ok(link.get('isNotDirty'));
});

test('action_button dirty tracking', (assert) => {
  assert.ok(!link.get('isDirty'));
  link.set('action_button', LINK.action_buttonOne);
  assert.ok(link.get('isDirty'));
  link.set('action_button', '');
  assert.ok(link.get('isNotDirty'));
});

test('is_header dirty tracking', (assert) => {
  assert.ok(!link.get('isDirty'));
  link.set('is_header', LINK.is_headerOne);
  assert.ok(link.get('isDirty'));
  link.set('is_header', false);
  assert.ok(link.get('isNotDirty'));
});

// priority
test('priority relationship is setup correctly', (assert) => {
  assert.ok(!link.get('priority'));
  run(() => {
    priority = store.push('ticket-priority', {id: TP.priorityOneId, links: [LINK.idOne]});
  });
  assert.equal(link.get('priority').get('id'), TP.priorityOneId);
  assert.equal(link.get('priority').get('name'), TP.priorityOne);
  assert.deepEqual(priority.get('links'), [LINK.idOne]);
});

test('priority related dirty tracking', (assert) => {
  assert.ok(!link.get('priority'));
  run(() => {
    priority = store.push('ticket-priority', {id: TP.priorityOneId, links: [LINK.idOne]});
    link = store.push('link', {id: LINK.idOne, priority_fk: TP.priorityOneId});
  });
  assert.ok(link.get('isNotDirty'));
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(link.get('priority').get('id'), TP.priorityOneId);
  run(() => {
    priority = store.push('ticket-priority', {id: TP.priorityOneId, links: []});
    priority = store.push('ticket-priority', {id: TP.priorityTwoId, links: [LINK.idOne]});
  });
  assert.equal(link.get('priority').get('id'), TP.priorityTwoId);
  assert.ok(link.get('isNotDirty'));
  assert.ok(link.get('isDirtyOrRelatedDirty'));
});

test('change_priority changes priority', (assert) => {
  assert.equal(link.get('priority.id'), undefined);
  link.change_priority(TP.priorityOneId);
  assert.equal(link.get('priority.id'), TP.priorityOneId);
  link.change_priority(TP.priorityTwoId);
  assert.equal(link.get('priority.id'), TP.priorityTwoId);
});

test('change_priority to null', (assert) => {
  assert.equal(link.get('priority.id'), undefined);
  link.change_priority(TP.priorityOneId);
  assert.equal(link.get('priority.id'), TP.priorityOneId);
  link.change_priority(null);
  assert.equal(link.get('priority.id'), null);
});

// status
test('status relationship is setup correctly', (assert) => {
  assert.ok(!link.get('status'));
  run(() => {
    status = store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne, links: [LINK.idOne]});
  });
  assert.equal(link.get('status').get('id'), TD.statusOneId);
  assert.equal(link.get('status').get('name'), TD.statusOne);
  assert.deepEqual(status.get('links'), [LINK.idOne]);
});

test('status related dirty tracking', (assert) => {
  assert.ok(!link.get('status'));
  run(() => {
    status = store.push('ticket-status', {id: TD.statusOneId, links: [LINK.idOne]});
    link = store.push('link', {id: LINK.idOne, status_fk: TD.statusOneId});
  });
  assert.ok(link.get('isNotDirty'));
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(link.get('status').get('id'), TD.statusOneId);
  run(() => {
    status = store.push('ticket-status', {id: TD.statusOneId, links: []});
    status = store.push('ticket-status', {id: TD.statusTwoId, links: [LINK.idOne]});
  });
  assert.equal(link.get('status').get('id'), TD.statusTwoId);
  assert.ok(link.get('isNotDirty'));
  assert.ok(link.get('isDirtyOrRelatedDirty'));
});

test('change_status changes status', (assert) => {
  assert.equal(link.get('status.id'), undefined);
  link.change_status(TD.statusOneId);
  assert.equal(link.get('status.id'), TD.statusOneId);
  link.change_status(TD.statusTwoId);
  assert.equal(link.get('status.id'), TD.statusTwoId);
});

test('change_status to null', (assert) => {
  assert.equal(link.get('status.id'), undefined);
  link.change_status(TD.statusOneId);
  assert.equal(link.get('status.id'), TD.statusOneId);
  link.change_status(null);
  assert.equal(link.get('status.id'), null);
});

// destination
test('destination relationship is setup correctly', (assert) => {
  assert.ok(!link.get('destination'));
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, destination_links: [LINK.idOne]});
  });
  assert.equal(link.get('destination.id'), DTD.idOne);
  assert.deepEqual(dtd.get('destination_links'), [LINK.idOne]);
});

test('destination related dirty tracking', (assert) => {
  assert.ok(!link.get('destination'));
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, destination_links: [LINK.idOne]});
    link = store.push('link', {id: LINK.idOne, destination_fk: DTD.idOne});
  });
  assert.ok(link.get('isNotDirty'));
  assert.ok(link.get('destinationIsNotDirty'));
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(link.get('destination').get('id'), DTD.idOne);
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, destination_links: []});
    dtd = store.push('dtd', {id: DTD.idTwo, destination_links: [LINK.idOne]});
  });
  assert.equal(link.get('destination').get('id'), DTD.idTwo);
  assert.ok(link.get('isNotDirty'));
  assert.ok(link.get('destinationIsDirty'));
  assert.ok(link.get('isDirtyOrRelatedDirty'));
});

test('change_destination changes destination', (assert) => {
  assert.ok(!link.get('destination'));
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne});
    dtd = store.push('dtd', {id: DTD.idTwo});
  });
  const one = {id: DTD.idOne};
  assert.equal(link.get('destination.id'), undefined);
  link.change_destination(one);
  assert.equal(link.get('destination.id'), DTD.idOne);
  const two = {id: DTD.idTwo};
  link.change_destination(two);
  assert.equal(link.get('destination.id'), DTD.idTwo);
});

// rollback
test('rollback status - value value value', (assert) => {
  run(() => {
    status = store.push('ticket-status', {id: TD.statusOneId, links: [LINK.idOne]});
    store.push('ticket-status', {id: TD.statusTwoId});
    link = store.push('link', {id: LINK.idOne, status_fk: TD.statusOneId});
  });
  assert.equal(link.get('status.id'), TD.statusOneId);
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  link.change_status(TD.statusTwoId);
  assert.equal(link.get('status.id'), TD.statusTwoId);
  assert.equal(link.get('status_fk'), TD.statusOneId);
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  link.rollback();
  assert.equal(link.get('status.id'), TD.statusOneId);
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback priority - value value value', (assert) => {
  run(() => {
    priority = store.push('ticket-priority', {id: TP.priorityOneId, links: [LINK.idOne]});
    store.push('ticket-priority', {id: TP.priorityTwoId});
    link = store.push('link', {id: LINK.idOne, priority_fk: TP.priorityOneId});
  });
  assert.equal(link.get('priority.id'), TP.priorityOneId);
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  link.change_priority(TP.priorityTwoId);
  assert.equal(link.get('priority.id'), TP.priorityTwoId);
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  link.rollback();
  assert.equal(link.get('priority.id'), TP.priorityOneId);
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback priority - value null value', (assert) => {
  run(() => {
    priority = store.push('ticket-priority', {id: TP.priorityOneId, links: [LINK.idOne]});
    store.push('ticket-priority', {id: TP.priorityTwoId});
    link = store.push('link', {id: LINK.idOne, priority_fk: TP.priorityOneId});
  });
  assert.equal(link.get('priority.id'), TP.priorityOneId);
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  link.change_priority(null);
  assert.equal(link.get('priority.id'), null);
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  link.rollback();
  assert.equal(link.get('priority.id'), TP.priorityOneId);
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback - destination', (assert) => {
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, destination_links: [LINK.idOne]});
    link = store.push('link', {id: LINK.idOne, destination_fk: DTD.idOne});
    store.push('dtd', {id: DTD.idTwo});
  });
  const two = {id: DTD.idTwo};
  assert.equal(link.get('destination.id'), DTD.idOne);
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  link.change_destination(two);
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  assert.equal(link.get('destination.id'), DTD.idTwo);
  link.rollback();
  assert.equal(link.get('destination.id'), DTD.idOne);
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
});

// save
test('savePriority', (assert) => {
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  link.change_priority(TP.priorityOneId);
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  link.savePriority();
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
});

test('savePriority null priority', (assert) => {
  run(() => {
    priority = store.push('ticket-priority', {id: TP.priorityOneId, links: [LINK.idOne]});
    store.push('ticket-priority', {id: TP.priorityTwoId});
    link = store.push('link', {id: LINK.idOne, priority_fk: TP.priorityOneId});
  });
  link.change_priority(null);
  assert.equal(link.get('priority'), undefined);
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  link.savePriority();
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(link.get('priorityIsNotDirty'));
});

test('saveStatus', (assert) => {
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  link.change_status(TD.statusOneId);
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  link.saveStatus();
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveStatus null status', (assert) => {
  run(() => {
    status = store.push('ticket-status', {id: TD.statusOneId, links: [LINK.idOne]});
    store.push('ticket-status', {id: TD.statusTwoId});
    link = store.push('link', {id: LINK.idOne, status_fk: TD.statusOneId});
  });
  link.change_status(null);
  assert.equal(link.get('status'), undefined);
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  link.saveStatus();
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(link.get('statusIsNotDirty'));
});

test('saveDestination', (assert) => {
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne});
  });
  const two = {id: DTD.idTwo};
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  link.change_destination(two);
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  assert.ok(link.get('destination.id'), DTD.idTwo);
  link.saveDestination();
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(link.get('destination.id'), DTD.idTwo);
});

// save
test('save - priority, status, destination', (assert) => {
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne});
  });
  assert.ok(link.get('destinationIsNotDirty'));
  assert.ok(link.get('statusIsNotDirty'));
  assert.ok(link.get('priorityIsNotDirty'));
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  link.change_destination({id: DTD.idOne});
  link.change_status(TD.statusOneId);
  link.change_priority(TP.priorityOneId);
  assert.ok(link.get('destinationIsDirty'));
  assert.ok(link.get('statusIsDirty'));
  assert.ok(link.get('priorityIsDirty'));
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  link.save();
  assert.ok(link.get('destinationIsNotDirty'));
  assert.ok(link.get('statusIsNotDirty'));
  assert.ok(link.get('priorityIsNotDirty'));
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
});


/*LINK TOP LEVEL CATEGORY*/
test('top level category returned from route with many to many set up with only the top level category', (assert) => {
  store.push('model-category', {id: TCD.idThree, model_pk: LINK.idOne, category_pk: CD.idThree});
  store.push('model-category', {id: TCD.idOne, model_pk: LINK.idOne, category_pk: CD.idOne});
  store.push('model-category', {id: TCD.idTwo, model_pk: LINK.idOne, category_pk: CD.idTwo});
  store.push('category', {id: CD.idThree, parent_id: CD.idOne});
  store.push('category', {id: CD.idOne, parent_id: CD.idTwo});
  store.push('category', {id: CD.idTwo, parent_id: null});
  link = store.push('link', {id: LINK.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo, TCD.idThree]});
  assert.equal(link.get('categories.length'), 3);
  assert.equal(link.get('categories').objectAt(0).get('id'), CD.idThree);
  assert.equal(link.get('categories').objectAt(1).get('id'), CD.idOne);
  assert.equal(link.get('categories').objectAt(2).get('id'), CD.idTwo);
  let top = link.get('top_level_category');
  assert.equal(top.get('id'), CD.idTwo);
  run(() => {
    store.push('category', {id: CD.idTwo, parent_id: CD.unusedId});
    store.push('category', {id: CD.unusedId, parent_id: null});
    store.push('model-category', {id: 'xx', model_pk: LINK.idOne, category_pk: CD.unusedId});
  });
  assert.equal(link.get('categories.length'), 4);
  top = link.get('top_level_category');
  assert.equal(top.get('id'), CD.unusedId);
});

test('top level category returned when parent_id is undefined (race condition for parent not yet loaded)', (assert) => {
  store.push('model-category', {id: TCD.idOne, model_pk: LINK.idOne, category_pk: CD.idOne});
  store.push('category', {id: CD.idOne, parent_id: CD.idTwo});
  link = store.push('link', {id: LINK.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo, TCD.idThree]});
  assert.equal(link.get('categories.length'), 1);
  assert.equal(link.get('categories').objectAt(0).get('id'), CD.idOne);
  let top = link.get('top_level_category');
  assert.ok(!top);
});

test('changing top level category will reset category tree', (assert) => {
  store.push('model-category', {id: TCD.idThree, model_pk: LINK.idOne, category_pk: CD.idThree});
  store.push('model-category', {id: TCD.idOne, model_pk: LINK.idOne, category_pk: CD.idOne});
  store.push('model-category', {id: TCD.idTwo, model_pk: LINK.idOne, category_pk: CD.idTwo});
  store.push('category', {id: CD.idThree, parent_id: CD.idOne});
  store.push('category', {id: CD.idOne, parent_id: CD.idTwo});
  store.push('category', {id: CD.idTwo, parent_id: null});
  const unused = {id: CD.unusedId, parent_id: null};
  link = store.push('link', {id: LINK.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo, TCD.idThree]});
  assert.equal(link.get('categories.length'), 3);
  assert.equal(link.get('categories').objectAt(0).get('id'), CD.idThree);
  assert.equal(link.get('categories').objectAt(1).get('id'), CD.idOne);
  assert.equal(link.get('categories').objectAt(2).get('id'), CD.idTwo);
  link.change_category_tree(unused);
  assert.equal(link.get('categories.length'), 1);
  assert.equal(link.get('top_level_category').get('id'), CD.unusedId);
});

test('if category is dirty, it will not save the pushed in category', (assert) => {
  store.push('model-category', {id: TCD.idThree, model_pk: LINK.idOne, category_pk: CD.idThree});
  store.push('model-category', {id: TCD.idOne, model_pk: LINK.idOne, category_pk: CD.idOne});
  store.push('model-category', {id: TCD.idTwo, model_pk: LINK.idOne, category_pk: CD.idTwo});
  store.push('category', {id: CD.idThree, parent_id: CD.idOne});
  store.push('category', {id: CD.idOne, parent_id: CD.idTwo});
  store.push('category', {id: CD.idTwo, parent_id: null});
  const unused = store.push('category', {id: CD.unusedId, name: CD.nameUnused, parent_id: null});
  const unused_json = {id: CD.unusedId, name: 'who', parent_id: null};
  assert.ok(unused.get('isNotDirtyOrRelatedNotDirty'));
  link = store.push('link', {id: LINK.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo, TCD.idThree]});
  assert.equal(link.get('categories.length'), 3);
  assert.equal(link.get('categories').objectAt(0).get('id'), CD.idThree);
  assert.equal(link.get('categories').objectAt(1).get('id'), CD.idOne);
  assert.equal(link.get('categories').objectAt(2).get('id'), CD.idTwo);
  link.change_category_tree(unused_json);
  assert.ok(unused.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(link.get('categories.length'), 1);
  assert.equal(link.get('top_level_category').get('id'), CD.unusedId);
  assert.equal(link.get('top_level_category').get('name'), 'who');
  assert.ok(link.get('top_level_category').get('isNotDirtyOrRelatedNotDirty'));
});

test('if no existing category, it will save the pushed in category', (assert) => {
  store.push('model-category', {id: TCD.idThree, model_pk: LINK.idOne, category_pk: CD.idThree});
  store.push('model-category', {id: TCD.idOne, model_pk: LINK.idOne, category_pk: CD.idOne});
  store.push('model-category', {id: TCD.idTwo, model_pk: LINK.idOne, category_pk: CD.idTwo});
  store.push('category', {id: CD.idThree, parent_id: CD.idOne});
  store.push('category', {id: CD.idOne, parent_id: CD.idTwo});
  store.push('category', {id: CD.idTwo, parent_id: null});
  const unused_json = {id: CD.unusedId, parent_id: null};
  link = store.push('link', {id: LINK.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo, TCD.idThree]});
  assert.equal(link.get('categories.length'), 3);
  assert.equal(link.get('categories').objectAt(0).get('id'), CD.idThree);
  assert.equal(link.get('categories').objectAt(1).get('id'), CD.idOne);
  assert.equal(link.get('categories').objectAt(2).get('id'), CD.idTwo);
  link.change_category_tree(unused_json);
  assert.equal(link.get('categories.length'), 1);
  assert.equal(link.get('top_level_category').get('id'), CD.unusedId);
});

test('removing top level category will reset category tree', (assert) => {
  store.push('model-category', {id: TCD.idThree, model_pk: LINK.idOne, category_pk: CD.idThree});
  store.push('model-category', {id: TCD.idOne, model_pk: LINK.idOne, category_pk: CD.idOne});
  store.push('model-category', {id: TCD.idTwo, model_pk: LINK.idOne, category_pk: CD.idTwo});
  store.push('category', {id: CD.idThree, parent_id: CD.idOne});
  store.push('category', {id: CD.idOne, parent_id: CD.idTwo});
  store.push('category', {id: CD.idTwo, parent_id: null});
  store.push('category', {id: CD.unusedId, parent_id: null});
  link = store.push('link', {id: LINK.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo, TCD.idThree]});
  assert.equal(link.get('categories.length'), 3);
  assert.equal(link.get('categories').objectAt(0).get('id'), CD.idThree);
  assert.equal(link.get('categories').objectAt(1).get('id'), CD.idOne);
  assert.equal(link.get('categories').objectAt(2).get('id'), CD.idTwo);
  link.remove_categories_down_tree(CD.idTwo);
  assert.equal(link.get('categories.length'), 0);
});

test('removing leaf node category will remove leaf node m2m join model', (assert) => {
  store.push('model-category', {id: TCD.idThree, model_pk: LINK.idOne, category_pk: CD.idThree});
  store.push('model-category', {id: TCD.idOne, model_pk: LINK.idOne, category_pk: CD.idOne});
  store.push('model-category', {id: TCD.idTwo, model_pk: LINK.idOne, category_pk: CD.idTwo});
  store.push('category', {id: CD.idThree, parent_id: CD.idOne});
  store.push('category', {id: CD.idOne, parent_id: CD.idTwo});
  store.push('category', {id: CD.idTwo, parent_id: null});
  store.push('category', {id: CD.unusedId, parent_id: null});
  link = store.push('link', {id: LINK.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo, TCD.idThree]});
  assert.equal(link.get('categories.length'), 3);
  assert.equal(link.get('categories').objectAt(0).get('id'), CD.idThree);
  assert.equal(link.get('categories').objectAt(1).get('id'), CD.idOne);
  assert.equal(link.get('categories').objectAt(2).get('id'), CD.idTwo);
  link.remove_categories_down_tree(CD.idThree);
  assert.equal(link.get('categories.length'), 2);
  assert.equal(link.get('top_level_category').get('id'), CD.idTwo);
});

test('removing middle node category will remove leaf node m2m join model', (assert) => {
  store.push('model-category', {id: TCD.idThree, model_pk: LINK.idOne, category_pk: CD.idThree});
  store.push('model-category', {id: TCD.idOne, model_pk: LINK.idOne, category_pk: CD.idOne});
  store.push('model-category', {id: TCD.idTwo, model_pk: LINK.idOne, category_pk: CD.idTwo});
  store.push('category', {id: CD.idThree, parent_id: CD.idOne});
  store.push('category', {id: CD.idOne, parent_id: CD.idTwo});
  store.push('category', {id: CD.idTwo, parent_id: null});
  store.push('category', {id: CD.unusedId, parent_id: null});
  link = store.push('link', {id: LINK.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo, TCD.idThree]});
  assert.equal(link.get('categories.length'), 3);
  assert.equal(link.get('categories').objectAt(0).get('id'), CD.idThree);
  assert.equal(link.get('categories').objectAt(1).get('id'), CD.idOne);
  assert.equal(link.get('categories').objectAt(2).get('id'), CD.idTwo);
  link.remove_categories_down_tree(CD.idOne);
  assert.equal(link.get('categories.length'), 1);
  assert.equal(link.get('top_level_category').get('id'), CD.idTwo);
});

test('rollback categories will also restore the category tree (when top node changed)', (assert) => {
  store.push('model-category', {id: TCD.idThree, model_pk: LINK.idOne, category_pk: CD.idThree});
  store.push('model-category', {id: TCD.idOne, model_pk: LINK.idOne, category_pk: CD.idOne});
  store.push('model-category', {id: TCD.idTwo, model_pk: LINK.idOne, category_pk: CD.idTwo});
  store.push('category', {id: CD.idThree, parent_id: CD.idOne});
  store.push('category', {id: CD.idOne, parent_id: CD.idTwo});
  store.push('category', {id: CD.idTwo, parent_id: null});
  const unused = {id: CD.unusedId, parent_id: null};
  link = store.push('link', {id: LINK.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo, TCD.idThree]});
  assert.equal(link.get('categories.length'), 3);
  assert.equal(link.get('categories').objectAt(0).get('id'), CD.idThree);
  assert.equal(link.get('categories').objectAt(1).get('id'), CD.idOne);
  assert.equal(link.get('categories').objectAt(2).get('id'), CD.idTwo);
  assert.equal(link.get('top_level_category').get('id'), CD.idTwo);
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  link.change_category_tree(unused);
  assert.equal(link.get('categories.length'), 1);
  assert.equal(link.get('top_level_category').get('id'), CD.unusedId);
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  link.rollback();
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(link.get('categories.length'), 3);
  assert.equal(link.get('top_level_category').get('id'), CD.idTwo);
  assert.equal(link.get('categories').objectAt(0).get('id'), CD.idThree);
  assert.equal(link.get('categories').objectAt(1).get('id'), CD.idOne);
  assert.equal(link.get('categories').objectAt(2).get('id'), CD.idTwo);
});

test('rollback categories will also restore the category tree (when middle node changed)', (assert) => {
  store.push('model-category', {id: TCD.idThree, model_pk: LINK.idOne, category_pk: CD.idThree});
  store.push('model-category', {id: TCD.idOne, model_pk: LINK.idOne, category_pk: CD.idOne});
  store.push('model-category', {id: TCD.idTwo, model_pk: LINK.idOne, category_pk: CD.idTwo});
  store.push('category', {id: CD.idThree, parent_id: CD.idOne});
  store.push('category', {id: CD.idOne, parent_id: CD.idTwo});
  store.push('category', {id: CD.idTwo, parent_id: null});
  const unused = {id: CD.unusedId, parent_id: CD.idTwo};
  link = store.push('link', {id: LINK.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo, TCD.idThree]});
  assert.equal(link.get('categories.length'), 3);
  assert.equal(link.get('categories').objectAt(0).get('id'), CD.idThree);
  assert.equal(link.get('categories').objectAt(1).get('id'), CD.idOne);
  assert.equal(link.get('categories').objectAt(2).get('id'), CD.idTwo);
  assert.equal(link.get('top_level_category').get('id'), CD.idTwo);
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  link.change_category_tree(unused);
  assert.equal(link.get('categories.length'), 2);
  assert.equal(link.get('top_level_category').get('id'), CD.idTwo);
  assert.equal(link.get('categories').objectAt(0).get('id'), CD.idTwo);
  assert.equal(link.get('categories').objectAt(1).get('id'), CD.unusedId);
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  link.rollback();
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(link.get('categories.length'), 3);
  assert.equal(link.get('top_level_category').get('id'), CD.idTwo);
  assert.equal(link.get('categories').objectAt(0).get('id'), CD.idThree);
  assert.equal(link.get('categories').objectAt(1).get('id'), CD.idOne);
  assert.equal(link.get('categories').objectAt(2).get('id'), CD.idTwo);
});

test('rollback categories will also restore the category tree (when leaf node changed)', (assert) => {
  store.push('model-category', {id: TCD.idThree, model_pk: LINK.idOne, category_pk: CD.idThree});
  store.push('model-category', {id: TCD.idOne, model_pk: LINK.idOne, category_pk: CD.idOne});
  store.push('model-category', {id: TCD.idTwo, model_pk: LINK.idOne, category_pk: CD.idTwo});
  store.push('category', {id: CD.idThree, parent_id: CD.idOne});
  store.push('category', {id: CD.idOne, parent_id: CD.idTwo});
  store.push('category', {id: CD.idTwo, parent_id: null});
  const unused = {id: CD.unusedId, parent_id: CD.idOne};
  link = store.push('link', {id: LINK.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo, TCD.idThree]});
  assert.equal(link.get('categories.length'), 3);
  assert.equal(link.get('categories').objectAt(0).get('id'), CD.idThree);
  assert.equal(link.get('categories').objectAt(1).get('id'), CD.idOne);
  assert.equal(link.get('categories').objectAt(2).get('id'), CD.idTwo);
  assert.equal(link.get('top_level_category').get('id'), CD.idTwo);
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  link.change_category_tree(unused);
  assert.equal(link.get('categories.length'), 3);
  assert.equal(link.get('top_level_category').get('id'), CD.idTwo);
  assert.equal(link.get('categories').objectAt(0).get('id'), CD.idOne);
  assert.equal(link.get('categories').objectAt(1).get('id'), CD.idTwo);
  assert.equal(link.get('categories').objectAt(2).get('id'), CD.unusedId);
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  link.rollback();
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(link.get('categories.length'), 3);
  assert.equal(link.get('top_level_category').get('id'), CD.idTwo);
  assert.equal(link.get('categories').objectAt(0).get('id'), CD.idThree);
  assert.equal(link.get('categories').objectAt(1).get('id'), CD.idOne);
  assert.equal(link.get('categories').objectAt(2).get('id'), CD.idTwo);
});

test('category names computed will return a string of each category name in order of priority', (assert) => {
  link = store.push('link', {id: LINK.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo, TCD.idThree]});
  store.push('model-category', {id: TCD.idThree, model_pk: LINK.idOne, category_pk: CD.idThree});
  store.push('model-category', {id: TCD.idOne, model_pk: LINK.idOne, category_pk: CD.idOne});
  store.push('model-category', {id: TCD.idTwo, model_pk: LINK.idOne, category_pk: CD.idTwo});
  store.push('model-category', {id: 998, model_pk: LINK.idTwo, category_pk: CD.unusedId});
  store.push('category', {id: CD.idOne, name: CD.nameOne, parent_id: CD.idTwo, children_fks: [], level: 2});
  store.push('category', {id: CD.idTwo, name: CD.nameTwo, parent_id: CD.unusedId, children_fks: [CD.idOne], level: 1});
  store.push('category', {id: CD.idThree, name: CD.nameThree, parent_id: null, children_fks: [CD.idTwo], level: 0});
  const unused = {id: CD.unusedId, name: 'unused', parent_id: null, children_fks: []};
  assert.equal(link.get('categories.length'), 3);
  assert.equal(link.get('sorted_categories').objectAt(0).get('id'), CD.idThree);
  assert.equal(link.get('sorted_categories').objectAt(1).get('id'), CD.idTwo);
  assert.equal(link.get('sorted_categories').objectAt(2).get('id'), CD.idOne);
  assert.equal(link.get('top_level_category').get('id'), CD.idThree);
  assert.equal(link.get('category_names'), 'Loss Prevention &#8226; Electrical &#8226; Repair');
  link.change_category_tree(unused);
  assert.equal(link.get('categories').get('length'), 1);
  assert.equal(link.get('sorted_categories').get('length'), 1);
  assert.equal(link.get('top_level_category').get('id'), CD.unusedId);
  assert.equal(link.get('category_names'), 'unused');
});

/*LINK TO CATEGORIES M2M*/
test('categories property only returns the single matching item even when multiple people (categories) exist', (assert) => {
  store.push('model-category', {id: TCD.idOne, model_pk: LINK.idOne, category_pk: CD.idTwo});
  store.push('category', {id: CD.idTwo});
  link = store.push('link', {id: LINK.idOne, model_categories_fks: [TCD.idOne]});
  link.add_category(CD.idTwo);
  let categories = link.get('categories');
  assert.equal(categories.get('length'), 1);
  assert.equal(categories.objectAt(0).get('id'), CD.idTwo);
});

test('categories property returns multiple matching items when multiple people (categories) exist', (assert) => {
  store.push('category', {id: CD.idOne});
  store.push('category', {id: CD.idTwo});
  store.push('model-category', {id: TCD.idOne, category_pk: CD.idTwo, model_pk: LINK.idOne});
  store.push('model-category', {id: TCD.idTwo, category_pk: CD.idOne, model_pk: LINK.idOne});
  link = store.push('link', {id: LINK.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo]});
  let categories = link.get('categories');
  assert.equal(categories.get('length'), 2);
  assert.equal(categories.objectAt(0).get('id'), CD.idOne);
  assert.equal(categories.objectAt(1).get('id'), CD.idTwo);
});

test('categories property will update when the m2m array suddenly has the category pk (starting w/ empty array)', (assert) => {
  link = store.push('link', {id: LINK.idOne, model_categories_fks: []});
  store.push('category', {id: CD.idOne});
  assert.equal(link.get('categories').get('length'), 0);
  assert.ok(link.get('categoriesIsNotDirty'));
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  link.add_category(CD.idOne);
  assert.equal(link.get('categories').get('length'), 1);
  assert.equal(link.get('categories').objectAt(0).get('id'), CD.idOne);
  assert.ok(link.get('categoriesIsDirty'));
  assert.ok(link.get('isDirtyOrRelatedDirty'));
});

test('categories property will update when the m2m array suddenly has the category pk', (assert) => {
  store.push('model-category', {id: TCD.idOne, category_pk: CD.idOne, model_pk: LINK.idOne});
  link = store.push('link', {id: LINK.idOne, model_categories_fks: [TCD.idOne]});
  store.push('category', {id: CD.idOne});
  store.push('category', {id: CD.idTwo});
  assert.equal(link.get('categories').get('length'), 1);
  assert.ok(link.get('categoriesIsNotDirty'));
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  link.add_category(CD.idTwo);
  assert.equal(link.get('categories').get('length'), 2);
  assert.equal(link.get('categories').objectAt(0).get('id'), CD.idOne);
  assert.equal(link.get('categories').objectAt(1).get('id'), CD.idTwo);
  assert.ok(link.get('categoriesIsDirty'));
  assert.ok(link.get('isDirtyOrRelatedDirty'));
});

test('categories property will update when the m2m array suddenly removes the category', (assert) => {
  store.push('model-category', {id: TCD.idOne, category_pk: CD.idOne, model_pk: LINK.idOne});
  link = store.push('link', {id: LINK.idOne, model_categories_fks: [TCD.idOne]});
  store.push('category', {id: CD.idOne});
  assert.equal(link.get('categories').get('length'), 1);
  link.remove_category(CD.idOne);
  assert.equal(link.get('categories').get('length'), 0);
});

test('when categories is changed dirty tracking works as expected (removing)', (assert) => {
  store.push('model-category', {id: TCD.idOne, model_pk: LINK.idOne, category_pk: CD.idOne});
  store.push('category', {id: CD.idOne});
  link = store.push('link', {id: LINK.idOne, model_categories_fks: [TCD.idOne]});
  assert.equal(link.get('categories').get('length'), 1);
  assert.ok(link.get('categoriesIsNotDirty'));
  link.remove_category(CD.idOne);
  assert.equal(link.get('categories').get('length'), 0);
  assert.ok(link.get('categoriesIsDirty'));
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  link.rollback();
  assert.equal(link.get('categories').get('length'), 1);
  assert.ok(link.get('categoriesIsNotDirty'));
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  link.remove_category(CD.idOne);
  assert.equal(link.get('categories').get('length'), 0);
  assert.ok(link.get('categoriesIsDirty'));
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  link.rollback();
  assert.equal(link.get('categories').get('length'), 1);
  assert.ok(link.get('categoriesIsNotDirty'));
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
});

test('when categories is changed dirty tracking works as expected (replacing)', (assert) => {
  store.push('model-category', {id: TCD.idOne, model_pk: LINK.idOne, category_pk: CD.idOne});
  store.push('category', {id: CD.idOne});
  store.push('category', {id: CD.idTwo});
  link = store.push('link', {id: LINK.idOne, model_categories_fks: [TCD.idOne]});
  assert.equal(link.get('categories').get('length'), 1);
  assert.ok(link.get('categoriesIsNotDirty'));
  link.remove_category(CD.idOne);
  assert.ok(link.get('categoriesIsDirty'));
  assert.equal(link.get('categories').get('length'), 0);
  link.add_category(CD.idTwo);
  assert.ok(link.get('categoriesIsDirty'));
  assert.equal(link.get('categories').get('length'), 1);
  assert.equal(link.get('categories').objectAt(0).get('id'), CD.idTwo);
  link.rollback();
  assert.equal(link.get('categories').get('length'), 1);
  assert.ok(link.get('categoriesIsNotDirty'));
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  link.remove_category(CD.idOne);
  link.add_category(CD.idTwo);
  assert.equal(link.get('categories').get('length'), 1);
  assert.ok(link.get('categoriesIsDirty'));
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  link.rollback();
  assert.equal(link.get('categories').get('length'), 1);
  assert.ok(link.get('categoriesIsNotDirty'));
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
});

test('when category is suddently removed it shows as a dirty relationship (when it has multiple locations to begin with)', (assert) => {
  store.push('category', {id: CD.idOne});
  store.push('category', {id: CD.idTwo});
  store.push('model-category', {id: TCD.idOne, category_pk: CD.idOne, model_pk: LINK.idOne});
  store.push('model-category', {id: TCD.idTwo, category_pk: CD.idTwo, model_pk: LINK.idOne});
  link = store.push('link', {id: LINK.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo]});
  assert.equal(link.get('categories').get('length'), 2);
  assert.ok(link.get('categoriesIsNotDirty'));
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  link.remove_category(CD.idTwo);
  assert.equal(link.get('categories').get('length'), 1);
  assert.ok(link.get('categoriesIsDirty'));
  assert.ok(link.get('isDirtyOrRelatedDirty'));
});

test('rollback link will reset the previously used people (categories) when switching from valid categories array to nothing', (assert) => {
  store.push('category', {id: CD.idOne});
  store.push('category', {id: CD.idTwo});
  store.push('model-category', {id: TCD.idOne, category_pk: CD.idOne, model_pk: LINK.idOne});
  store.push('model-category', {id: TCD.idTwo, category_pk: CD.idTwo, model_pk: LINK.idOne});
  link = store.push('link', {id: LINK.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo]});
  assert.equal(link.get('categories').get('length'), 2);
  assert.ok(link.get('categoriesIsNotDirty'));
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  link.remove_category(CD.idTwo);
  assert.equal(link.get('categories').get('length'), 1);
  assert.ok(link.get('categoriesIsDirty'));
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  link.rollback();
  assert.equal(link.get('categories').get('length'), 2);
  assert.ok(link.get('categoriesIsNotDirty'));
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  link.remove_category(CD.idTwo);
  link.remove_category(CD.idOne);
  assert.equal(link.get('categories').get('length'), 0);
  assert.ok(link.get('categoriesIsDirty'));
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  link.rollback();
  assert.equal(link.get('categories').get('length'), 2);
  assert.ok(link.get('categoriesIsNotDirty'));
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(link.get('categories').objectAt(0).get('id'), CD.idOne);
  assert.equal(link.get('categories').objectAt(1).get('id'), CD.idTwo);
});

test('rollback categories will reset the previous people (categories) when switching from one category to another and saving in between each step', (assert) => {
  store.push('category', {id: CD.idOne});
  store.push('category', {id: CD.idTwo});
  store.push('category', {id: CD.unusedId});
  store.push('model-category', {id: TCD.idOne, category_pk: CD.idOne, model_pk: LINK.idOne});
  store.push('model-category', {id: TCD.idTwo, category_pk: CD.idTwo, model_pk: LINK.idOne});
  link = store.push('link', {id: LINK.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo]});
  assert.equal(link.get('categories').get('length'), 2);
  link.remove_category(CD.idOne);
  assert.equal(link.get('categories').get('length'), 1);
  assert.ok(link.get('categoriesIsDirty'));
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  link.save();
  link.save();
  assert.equal(link.get('categories').get('length'), 1);
  assert.ok(link.get('isNotDirty'));
  assert.ok(link.get('categoriesIsNotDirty'));
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
  link.add_category(CD.unusedId);
  assert.equal(link.get('categories').get('length'), 2);
  assert.ok(link.get('categoriesIsDirty'));
  assert.ok(link.get('isDirtyOrRelatedDirty'));
  link.save();
  link.save();
  assert.equal(link.get('categories').get('length'), 2);
  assert.ok(link.get('isNotDirty'));
  assert.ok(link.get('categoriesIsNotDirty'));
  assert.ok(link.get('isNotDirtyOrRelatedNotDirty'));
});

test('categories_ids computed returns a flat list of ids for each category', (assert) => {
  store.push('category', {id: CD.idOne});
  store.push('category', {id: CD.idTwo});
  store.push('model-category', {id: TCD.idOne, category_pk: CD.idOne, model_pk: LINK.idOne});
  store.push('model-category', {id: TCD.idTwo, category_pk: CD.idTwo, model_pk: LINK.idOne});
  link = store.push('link', {id: LINK.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo]});
  assert.equal(link.get('categories').get('length'), 2);
  assert.deepEqual(link.get('categories_ids'), [CD.idOne, CD.idTwo]);
  link.remove_category(CD.idOne);
  assert.equal(link.get('categories').get('length'), 1);
  assert.deepEqual(link.get('categories_ids'), [CD.idTwo]);
});

test('model_categories_ids computed returns a flat list of ids for each category', (assert) => {
  store.push('category', {id: CD.idOne});
  store.push('category', {id: CD.idTwo});
  store.push('model-category', {id: TCD.idOne, category_pk: CD.idOne, model_pk: LINK.idOne});
  store.push('model-category', {id: TCD.idTwo, category_pk: CD.idTwo, model_pk: LINK.idOne});
  link = store.push('link', {id: LINK.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo]});
  assert.equal(link.get('categories').get('length'), 2);
  assert.deepEqual(link.get('model_categories_ids'), [TCD.idOne, TCD.idTwo]);
  link.remove_category(CD.idOne);
  assert.equal(link.get('categories').get('length'), 1);
  assert.deepEqual(link.get('model_categories_ids'), [TCD.idTwo]);
});
/*END link CATEGORY M2M*/
