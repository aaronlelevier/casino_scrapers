import { moduleFor, test } from 'ember-qunit';
import { postal_code_validation } from 'bsrs-ember/validators/address-postal';

moduleFor('validator:address-postal', 'Unit | Validator | address-postal', {
  needs: ['validator:messages']
});

test('should be a valid zip code', function(assert) {
  assert.ok(!postal_code_validation(''));
  assert.ok(!postal_code_validation('1234'));
  assert.ok(!postal_code_validation('.1234'));
  assert.ok(!postal_code_validation('(1234)'));
  assert.ok(postal_code_validation('12345'));
  assert.ok(postal_code_validation('a12345'));
  assert.ok(postal_code_validation('A12345'));
  assert.ok(postal_code_validation('A-12345'));
  assert.ok(postal_code_validation('A 12345'));
});

test('integration b/w functions and base validator works', function(assert) {
  var validator = this.subject();
  assert.equal(validator.validate(''), 'errors.address.postal_code');
  assert.equal(validator.validate('1234'), 'errors.address.postal_code');
  assert.equal(validator.validate('.1234'), 'errors.address.postal_code');
  assert.equal(validator.validate('(1234)'), 'errors.address.postal_code');
  assert.equal(validator.validate('12345'), true);
  assert.equal(validator.validate('a12345'), true);
  assert.equal(validator.validate('A12345'), true);
  assert.equal(validator.validate('A-12345'), true);
  assert.equal(validator.validate('A 12345'), true);
});
