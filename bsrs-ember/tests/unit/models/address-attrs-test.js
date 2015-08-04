import {test, module} from 'qunit';
import Person from 'bsrs-ember/models/person';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';

module('unit: person attrs test');

test('default state for username on person model is an empty array', (assert) => {
    var person = Person.create({id: PEOPLE_DEFAULTS.id, username: undefined});
    assert.ok(person.get('isNotDirty'));
    person.set('username', 'scott');
    assert.ok(person.get('isDirty'));
    person.set('username', '');
    assert.ok(person.get('isNotDirty'));
});

test('default state for first name, middle initial, and last name on person model is undefined', (assert) => {
    var person = Person.create({id: PEOPLE_DEFAULTS.id, first_name: undefined, middle_initial: undefined, last_name: undefined});
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

test('default state for employee number, email, and title on person model is undefined', (assert) => {
    var person = Person.create({id: PEOPLE_DEFAULTS.id, emp_number: undefined, email: undefined, title: undefined});
    assert.ok(person.get('isNotDirty'));
    person.set('emp_number', '1222');
    assert.ok(person.get('isDirty'));
    person.set('emp_number', '');
    assert.ok(person.get('isNotDirty'));
    person.set('title', 'mastermind');
    assert.ok(person.get('isDirty'));
    person.set('title', '');
    assert.ok(person.get('isNotDirty'));
    person.set('email', 'abc@gmail.com');
    assert.ok(person.get('isDirty'));
    person.set('email', '');
    assert.ok(person.get('isNotDirty'));
});

test('default state for auth amount on person model is undefined', (assert) => {
    var person = Person.create({id: PEOPLE_DEFAULTS.id, auth_amount: undefined});
    assert.ok(person.get('isNotDirty'));
    person.set('auth_amount', '50,000');
    assert.ok(person.get('isDirty'));
    person.set('auth_amount', '');
    assert.ok(person.get('isNotDirty'));
});

