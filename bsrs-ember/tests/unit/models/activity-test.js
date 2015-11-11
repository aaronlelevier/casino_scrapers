import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import PD from 'bsrs-ember/vendor/defaults/person';
// import TICKET_ACTIVITY_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket_activity';

var store;

module('unit: activity test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:activity', 'model:activity/assignee', 'model:activity/person', 'model:ticket']);
    }
});

test('to returns associated model or undefined', (assert) => {
    let activity = store.push('activity', {id: 1, type: 'assignee', to_fk: 2, from_fk: 3});
    store.push('activity/assignee', {id: 3, first_name: 'y'});
    store.push('activity/assignee', {id: 2, first_name: 'x'});
    let to = activity.get('to');
    assert.equal(to.get('id'), 2);
    assert.equal(to.get('first_name'), 'x');
    activity.set('to_fk', 3);
    to = activity.get('to');
    assert.equal(to.get('id'), 3);
    activity.set('to_fk', 9);
    to = activity.get('to');
    assert.equal(to, undefined);
});

test('from returns associated model or undefined', (assert) => {
    let activity = store.push('activity', {id: 1, type: 'assignee', to_fk: 2, from_fk: 3});
    store.push('activity/assignee', {id: 2, first_name: 'x'});
    store.push('activity/assignee', {id: 3, first_name: 'y'});
    let from = activity.get('from');
    assert.equal(from.get('id'), 3);
    assert.equal(from.get('first_name'), 'y');
    activity.set('from_fk', 2);
    from = activity.get('from');
    assert.equal(from.get('id'), 2);
    activity.set('from_fk', 9);
    from = activity.get('from');
    assert.equal(from, undefined);
});

test('person returns associated model or undefined', (assert) => {
    let activity = store.push('activity', {id: 1, type: 'assignee', person_fk: PD.idOne});
    store.push('activity/person', {id: PD.idOne, first_name: PD.first_name});
    store.push('activity/person', {id: 3, first_name: 'y'});
    let person = activity.get('person');
    assert.equal(person.get('id'), PD.idOne);
    activity.set('person_fk', 3);
    person = activity.get('person');
    assert.equal(person.get('id'), 3);
    activity.set('person_fk', PD.idOne);
    person = activity.get('person');
    assert.equal(person.get('id'), PD.idOne);
});
