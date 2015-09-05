import {test, module} from 'qunit';
import PHONE_NUMBER_DEFAULTS from 'bsrs-ember/vendor/defaults/phone-number';
import PHONE_NUMBER_TYPES_DEFAULTS from 'bsrs-ember/vendor/defaults/phone-number-type';
import PhoneNumber from 'bsrs-ember/models/phonenumber';

module('unit: phone number attrs test');

test('phone number has type attr that is dirty tracked', (assert) => {
    var phone_number = PhoneNumber.create({id: PHONE_NUMBER_DEFAULTS.id, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId});
    assert.ok(phone_number.get('isNotDirty'));
    phone_number.set('type', PHONE_NUMBER_TYPES_DEFAULTS.mobileId);
    assert.ok(phone_number.get('isDirty'));
    phone_number.rollback();
    assert.ok(phone_number.get('isNotDirty'));
});

test('phone number has number attr that is dirty tracked', (assert) => {
    var phone_number = PhoneNumber.create({id: PHONE_NUMBER_DEFAULTS.id, type: PHONE_NUMBER_TYPES_DEFAULTS.officeId});
    assert.ok(phone_number.get('isNotDirty'));
    phone_number.set('number', '123-123-1234');
    assert.ok(phone_number.get('isDirty'));
    phone_number.rollback();
    assert.ok(phone_number.get('isNotDirty'));
});
