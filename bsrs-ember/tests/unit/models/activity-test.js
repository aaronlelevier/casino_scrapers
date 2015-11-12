import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import PD from 'bsrs-ember/vendor/defaults/person';
import TAD from 'bsrs-ember/vendor/defaults/ticket_activity';

var store;

module('unit: activity test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:activity', 'model:activity/cc-add', 'model:activity/assignee', 'model:activity/person', 'model:ticket', 'model:ticket-status']);
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
