import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import PD from 'bsrs-ember/vendor/defaults/person';
import CD from 'bsrs-ember/vendor/defaults/category';
import TAD from 'bsrs-ember/vendor/defaults/ticket_activity';

var store;

module('unit: activity test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:activity', 'model:activity/cc-add', 'model:activity/cc-remove', 'model:activity/assignee', 'model:activity/person', 'model:ticket', 'model:ticket-status', 'model:ticket-priority', 'model:activity/category-to', 'model:activity/category-from']);
    }
});

test('to returns associated model or undefined (assignee type)', (assert) => {
    let activity = store.push('activity', {id: TAD.idAssigneeOne, type: 'assignee', to_fk: 2, from_fk: 3});
    store.push('activity/assignee', {id: 3, fullname: 'y'});
    store.push('activity/assignee', {id: 2, fullname: 'x'});
    let to = activity.get('to');
    assert.equal(to.get('id'), 2);
    assert.equal(to.get('fullname'), 'x');
    activity.set('to_fk', 3);
    to = activity.get('to');
    assert.equal(to.get('id'), 3);
    activity.set('to_fk', 9);
    to = activity.get('to');
    assert.equal(to, undefined);
});

test('to returns associated model or undefined (status type)', (assert) => {
    let activity = store.push('activity', {id: TAD.idStatusOne, type: 'status', to_fk: TD.statusTwoId, from_fk: TD.statusOneId});
    store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne});
    store.push('ticket-status', {id: TD.statusTwoId, name: TD.statusTwo});
    let to = activity.get('to');
    assert.equal(to.get('id'), TD.statusTwoId);
    assert.equal(to.get('name'), TD.statusTwo);
    activity.set('to_fk', TD.statusOneId);
    to = activity.get('to');
    assert.equal(to.get('id'), TD.statusOneId);
    activity.set('to_fk', 9);
    to = activity.get('to');
    assert.equal(to, undefined);
});

test('from returns associated model or undefined (assignee type)', (assert) => {
    let activity = store.push('activity', {id: TAD.idAssigneeOne, type: 'assignee', to_fk: 2, from_fk: 3});
    store.push('activity/assignee', {id: 2, fullname: 'x'});
    store.push('activity/assignee', {id: 3, fullname: 'y'});
    let from = activity.get('from');
    assert.equal(from.get('id'), 3);
    assert.equal(from.get('fullname'), 'y');
    activity.set('from_fk', 2);
    from = activity.get('from');
    assert.equal(from.get('id'), 2);
    activity.set('from_fk', 9);
    from = activity.get('from');
    assert.equal(from, undefined);
});

test('from returns associated model or undefined (status type)', (assert) => {
    let activity = store.push('activity', {id: TAD.idStatusOne, type: 'status', to_fk: TD.statusTwoId, from_fk: TD.statusOneId});
    store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne});
    store.push('ticket-status', {id: TD.statusTwoId, name: TD.statusTwo});
    let from = activity.get('from');
    assert.ok(from);
    assert.equal(from.get('id'), TD.statusOneId);
    assert.equal(from.get('name'), TD.statusOne);
    activity.set('from_fk', TD.statusTwoId);
    from = activity.get('from');
    assert.equal(from.get('id'), TD.statusTwoId);
    activity.set('from_fk', 9);
    from = activity.get('from');
    assert.equal(from, undefined);
});

test('to returns associated model or undefined (priority type)', (assert) => {
    let activity = store.push('activity', {id: TAD.idPriorityOne, type: 'priority', to_fk: TD.priorityTwoId, from_fk: TD.priorityOneId});
    store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOne});
    store.push('ticket-priority', {id: TD.priorityTwoId, name: TD.priorityTwo});
    let to = activity.get('to');
    assert.equal(to.get('id'), TD.priorityTwoId);
    assert.equal(to.get('name'), TD.priorityTwo);
    activity.set('to_fk', TD.priorityOneId);
    to = activity.get('to');
    assert.equal(to.get('id'), TD.priorityOneId);
    activity.set('to_fk', 9);
    to = activity.get('to');
    assert.equal(to, undefined);
});

test('from returns associated model or undefined (priority type)', (assert) => {
    let activity = store.push('activity', {id: TAD.idPriorityOne, type: 'priority', to_fk: TD.priorityTwoId, from_fk: TD.priorityOneId});
    store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOne});
    store.push('ticket-priority', {id: TD.priorityTwoId, name: TD.priorityTwo});
    let from = activity.get('from');
    assert.ok(from);
    assert.equal(from.get('id'), TD.priorityOneId);
    assert.equal(from.get('name'), TD.priorityOne);
    activity.set('from_fk', TD.priorityTwoId);
    from = activity.get('from');
    assert.equal(from.get('id'), TD.priorityTwoId);
    activity.set('from_fk', 9);
    from = activity.get('from');
    assert.equal(from, undefined);
});

test('category returns associated model or undefined', (assert) => {
    let activity = store.push('activity', {id: TAD.idCategoryOne, type: 'categories'});
    store.push('activity/category-to', {id: CD.idOne, name: CD.nameOne, parent: null, activities: [TAD.idCategoryOne]});
    store.push('activity/category-from', {id: CD.idTwo, name: CD.nameTwo, parent: CD.nameOne, activities: [TAD.idCategoryOne]});
    let categories_to = activity.get('categories_to');
    let categories_from = activity.get('categories_from');
    assert.equal(categories_to.objectAt(0).get('id'), CD.idOne);
    assert.equal(categories_from.objectAt(0).get('id'), CD.idTwo);
});

test('person returns associated model or undefined', (assert) => {
    let activity = store.push('activity', {id: TAD.idCreate, type: 'assignee', person_fk: PD.idOne});
    store.push('activity/person', {id: PD.idOne, fullname: PD.fullname});
    store.push('activity/person', {id: 3, fullname: 'y'});
    let person = activity.get('person');
    assert.equal(person.get('id'), PD.idOne);
    activity.set('person_fk', 3);
    person = activity.get('person');
    assert.equal(person.get('id'), 3);
    activity.set('person_fk', PD.idOne);
    person = activity.get('person');
    assert.equal(person.get('id'), PD.idOne);
});

test('added returns associated array of cc or empty array (cc_add type)', (assert) => {
    let activity = store.push('activity', {id: TAD.idCcAddOne, type: 'cc_add'});
    let three = store.push('activity/cc-add', {id: 3, fullname: 'm', activities: [TAD.idCcAddOne]});
    store.push('activity/cc-add', {id: 2, fullname: 'n', activities: []});
    let one = store.push('activity/cc-add', {id: 1, fullname: 'o', activities: [999, TAD.idCcAddOne]});
    let added = activity.get('added');
    assert.equal(added.get('length'), 2);
    assert.equal(added.objectAt(0).get('id'), 3);
    assert.equal(added.objectAt(0).get('fullname'), 'm');
    assert.equal(added.objectAt(1).get('id'), 1);
    assert.equal(added.objectAt(1).get('fullname'), 'o');
    three.set('activities', []);
    added = activity.get('added');
    assert.equal(added.get('length'), 1);
    assert.equal(added.objectAt(0).get('id'), 1);
    assert.equal(added.objectAt(0).get('fullname'), 'o');
    one.set('activities', []);
    added = activity.get('added');
    assert.equal(added.get('length'), 0);
});

test('remove returns associated array of cc or empty array (cc_removed type)', (assert) => {
    let activity = store.push('activity', {id: TAD.idCcAddOne, type: 'cc_remove'});
    let three = store.push('activity/cc-remove', {id: 3, fullname: 'm', activities: [TAD.idCcAddOne]});
    store.push('activity/cc-remove', {id: 2, fullname: 'n', activities: []});
    let one = store.push('activity/cc-remove', {id: 1, fullname: 'o', activities: [999, TAD.idCcAddOne]});
    let removed = activity.get('removed');
    assert.equal(removed.get('length'), 2);
    assert.equal(removed.objectAt(0).get('id'), 3);
    assert.equal(removed.objectAt(0).get('fullname'), 'm');
    assert.equal(removed.objectAt(1).get('id'), 1);
    assert.equal(removed.objectAt(1).get('fullname'), 'o');
    three.set('activities', []);
    removed = activity.get('removed');
    assert.equal(removed.get('length'), 1);
    assert.equal(removed.objectAt(0).get('id'), 1);
    assert.equal(removed.objectAt(0).get('fullname'), 'o');
    one.set('activities', []);
    removed = activity.get('removed');
    assert.equal(removed.get('length'), 0);
});
