import {test, module} from 'qunit';
import PhoneNumber from 'bsrs-ember/models/phonenumber';

module('unit: phone number attrs test');

test('phone number has type attr that is dirty tracked', (assert) => {
    var phone_number = PhoneNumber.create({id: 1, type: 1});
    assert.ok(phone_number.get('isNotDirty'));
    phone_number.set('type', 2);
    assert.ok(phone_number.get('isDirty'));
    phone_number.rollback();
    assert.ok(phone_number.get('isNotDirty'));
});

test('phone number has number attr that is dirty tracked', (assert) => {
    var phone_number = PhoneNumber.create({id: 1, type: 1});
    assert.ok(phone_number.get('isNotDirty'));
    phone_number.set('number', '123-123-1234');
    assert.ok(phone_number.get('isDirty'));
    phone_number.rollback();
    assert.ok(phone_number.get('isNotDirty'));
});
