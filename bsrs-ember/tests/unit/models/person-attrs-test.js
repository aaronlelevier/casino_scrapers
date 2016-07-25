import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import Person from 'bsrs-ember/models/person';
import PD from 'bsrs-ember/vendor/defaults/person';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

let store, person;

module('unit: person attrs test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:person']);
    }
});

test('default state for username on person model is undefined', (assert) => {
    person = Person.create({id: PD.idOne, username: undefined});
    assert.ok(person.get('isNotDirty'));
    person.set('username', 'scott');
    assert.ok(person.get('isDirty'));
    person.set('username', '');
    assert.ok(person.get('isNotDirty'));
});

test('default state for first name, middle initial, and last name on person model is undefined', (assert) => {
    person = Person.create({id: PD.idOne, first_name: undefined, middle_initial: undefined, last_name: undefined});
    assert.ok(person.get('isNotDirty'));
    person.set('first_name', 'Katy');
    assert.ok(person.get('isDirty'));
    person.set('first_name', '');
    assert.ok(person.get('isNotDirty'));
    person.set('last_name', 'Perry');
    assert.ok(person.get('isDirty'));
    person.set('last_name', '');
    assert.ok(person.get('isNotDirty'));
    person.set('middle_initial', 'A');
    assert.ok(person.get('isDirty'));
    person.set('middle_initial', '');
    assert.ok(person.get('isNotDirty'));
});

test('default state for employee number, and title on person model is undefined', (assert) => {
    person = Person.create({id: PD.idOne, employee_id: undefined, title: undefined});
    assert.ok(person.get('isNotDirty'));
    person.set('employee_id', '1222');
    assert.ok(person.get('isDirty'));
    person.set('employee_id', '');
    assert.ok(person.get('isNotDirty'));
    person.set('title', 'mastermind');
    assert.ok(person.get('isDirty'));
    person.set('title', '');
    assert.ok(person.get('isNotDirty'));
});

test('default state for auth amount on person model is undefined', (assert) => {
    person = Person.create({id: PD.idOne, auth_amount: undefined});
    assert.ok(person.get('isNotDirty'));
    person.set('auth_amount', '50,000');
    assert.ok(person.get('isDirty'));
    person.set('auth_amount', '');
    assert.ok(person.get('isNotDirty'));
});

test('password_one_time', assert => {
    person = store.push('person', {id: PD.idOne});
    assert.ok(person.get('isNotDirty'));
    person.set('password_one_time', true);
    assert.ok(person.get('isDirty'));
});

