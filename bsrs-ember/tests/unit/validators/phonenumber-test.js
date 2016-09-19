/* THIS IS NOT USED AT THE MOMENT.  USING CP VALIDATION FORMAT PHONE TO SEE IF COVERS OUR USE CASES */


import { moduleFor, test } from 'ember-qunit';
import { phoneIsAllowedRegion, phoneIsValidFormat } from 'bsrs-ember/validators/phonenumber';

function assertValidPhone(phoneNumber) {
  let validRegion = phoneIsAllowedRegion(phoneNumber);
  let validFormat = phoneIsValidFormat(phoneNumber);
  return validRegion && validFormat;
}

moduleFor('validator:phonenumber', 'Unit | Validator | phonenumber', {
  needs: ['validator:messages']
});

test('legit phone numbers', assert => {
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

test('wrong format phone numbers', assert => {
  assert.equal(phoneIsValidFormat(undefined), false);
  assert.equal(phoneIsValidFormat(null), false);
  assert.equal(phoneIsValidFormat(''), false);
  assert.equal(phoneIsValidFormat('a888456789'), false);
  assert.equal(phoneIsValidFormat('888456789'), false);
  assert.equal(phoneIsValidFormat('01 (515)888-4567'), false);
  assert.equal(phoneIsValidFormat('+001 (515)888-4567'), false);
  assert.equal(phoneIsValidFormat('+01 (515)888-4567'), false);
});

test('wrong region phone numbers', assert => {
  assert.equal(phoneIsAllowedRegion('+2 515-888-4567'), false);
});

test('integration b/w functions and base validator works', function(assert) {
  var validator = this.subject();
  assert.equal(validator.validate('5158884567'), true);
  assert.equal(validator.validate('  5158884567  '), true);
  assert.equal(validator.validate('515-888-4567'), true);
  assert.equal(validator.validate('(515) 888-4567'), true);
  assert.equal(validator.validate('515 - 888 - 4567'), true);
  assert.equal(validator.validate('515/888/4567'), true);
  assert.equal(validator.validate('515.888.4567'), true);
  assert.equal(validator.validate('+1 (515)888-4567'), true);
  assert.equal(validator.validate('001 (515)888-4567'), true);
  assert.equal(validator.validate('15158884567'), true);
});

// test('integration b/w functions and base validator works for bad phone numbers', function(assert) {
//   var validator = this.subject();
//   assert.equal(validator.validate(undefined), 'admin.person.label.phone_number.one');
//   assert.equal(validator.validate(null), 'admin.person.label.phone_number.one');
//   assert.equal(validator.validate(''), 'admin.person.label.phone_number.one');
//   assert.equal(validator.validate('a888456789'), 'admin.person.label.phone_number.one');
//   assert.equal(validator.validate('888456789'), 'admin.person.label.phone_number.one');
//   assert.equal(validator.validate('01 (515)888-4567'), 'admin.person.label.phone_number.one');
//   assert.equal(validator.validate('+001 (515)888-4567'), 'admin.person.label.phone_number.one');
//   assert.equal(validator.validate('+01 (515)888-4567'), 'admin.person.label.phone_number.one');
// });
