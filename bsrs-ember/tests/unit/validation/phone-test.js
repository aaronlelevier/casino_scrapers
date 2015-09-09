import { test, module } from 'qunit';
import { phoneIsAllowedRegion, phoneIsValidFormat } from 'bsrs-ember/validation/phone';

module('phone validation tests');

function assertValidPhone(phoneNumber) {
    let validRegion = phoneIsAllowedRegion(phoneNumber);
    let validFormat = phoneIsValidFormat(phoneNumber);
    return validRegion && validFormat;
}

test('legit phone numbers', function(assert) {
    assert.equal(assertValidPhone('5158884567'), true);
    assertValidPhone(assert, '  5158884567  ');
    assertValidPhone(assert, '515-888-4567');
    assertValidPhone(assert, '(515) 888-4567');
    assertValidPhone(assert, '515 - 888 - 4567');
    assertValidPhone(assert, '515/888/4567');
    assertValidPhone(assert, '515.888.4567');
    assertValidPhone(assert, '+1 (515)888-4567');
    assertValidPhone(assert, '001 (515)888-4567');
    assertValidPhone(assert, '15158884567');
});

test('wrong format phone numbers', function(assert) {
    assert.equal(phoneIsValidFormat(undefined), false);
    assert.equal(phoneIsValidFormat(null), false);
    assert.equal(phoneIsValidFormat(''), false);
    assert.equal(phoneIsValidFormat('a888456789'), false);
    assert.equal(phoneIsValidFormat('888456789'), false);
    assert.equal(phoneIsValidFormat('01 (515)888-4567'), false);
    assert.equal(phoneIsValidFormat('+001 (515)888-4567'), false);
    assert.equal(phoneIsValidFormat('+01 (515)888-4567'), false);
});

test('wrong region phone numbers', function(assert) {
    assert.equal(phoneIsAllowedRegion('+2 515-888-4567'), false);
});
