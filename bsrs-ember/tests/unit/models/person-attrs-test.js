import {test, module} from 'qunit';
import Person from 'bsrs-ember/models/person';

module('unit: person attrs test');

test('default state for username on person model is an empty array', (assert) => {
    var person = Person.create({id: 1, username: undefined});
    assert.ok(person.get('isNotDirty'));
    person.set('username', 'scott');
    assert.ok(person.get('isDirty'));
    person.set('username', '');
    assert.ok(person.get('isNotDirty'));
});

