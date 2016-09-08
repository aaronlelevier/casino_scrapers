import { moduleFor, test } from 'ember-qunit';
import { address_name_validation } from 'bsrs-ember/validators/address-street';

moduleFor('validator:address-street', 'Unit | Validator | address-street', {
  needs: ['validator:messages']
});

test('should be a valid address', function(assert) {
  assert.ok(!address_name_validation(''));
  assert.ok(!address_name_validation('a'));
  assert.ok(!address_name_validation('ab'));
  assert.ok(!address_name_validation('a1'));
  assert.ok(!address_name_validation('High Street %'));
  assert.ok(!address_name_validation('High Street!'));
  assert.ok(!address_name_validation('High Street?'));
  assert.ok(!address_name_validation('High Street >'));
  assert.ok(!address_name_validation('High Street <'));
  assert.ok(!address_name_validation('High Street+'));
  assert.ok(!address_name_validation('123 Sky Park St. ^123'));
  assert.ok(!address_name_validation('123 Sky Park St. =123'));
  assert.ok(address_name_validation('skypark'));
  assert.ok(address_name_validation('Skypark'));
  assert.ok(address_name_validation('123 Skypark'));
  assert.ok(address_name_validation('123 Skypark (Local House)'));
  assert.ok(address_name_validation('123 Sky Park'));
  assert.ok(address_name_validation('123 Sky-Park'));
  assert.ok(address_name_validation('123 Sky Park #123'));
  assert.ok(address_name_validation('123 Sky Park St.'));
  assert.ok(address_name_validation('123 Sky Park St. [Corner]'));
  assert.ok(address_name_validation('123 Sky Park St. {Corner}'));
  assert.ok(address_name_validation('123 Sky Park St. *Corner'));
  assert.ok(address_name_validation('123 Sky Park St. @123'));
  assert.ok(address_name_validation('123, Sky Park St.'));
  assert.ok(address_name_validation('123 Sky Park St. & Baker Street'));
});

test('integration b/w functions and base validator works', function(assert) {
  var validator = this.subject();
  assert.equal(validator.validate(''), 'errors.address.address');
  assert.equal(validator.validate('a'), 'errors.address.address');
  assert.equal(validator.validate('ab'), 'errors.address.address');
  assert.equal(validator.validate('a1'), 'errors.address.address');
  assert.equal(validator.validate('skypark'), true);
  assert.equal(validator.validate('123 Skypark'), true);
  assert.equal(validator.validate('123 Skypark (LocalHouse)'), true);
  assert.equal(validator.validate('123 Sky Park'), true);
  assert.equal(validator.validate('123 Sky-Park'), true);
  assert.equal(validator.validate('123 Sky Park #123'), true);
  assert.equal(validator.validate('123 Sky Park St.'), true);
  assert.equal(validator.validate('123 Sky Park [Corner]'), true);
  assert.equal(validator.validate('123 Sky Park {Corner}'), true);
  assert.equal(validator.validate('123 Sky Park @123'), true);
  assert.equal(validator.validate('123 Sky Park *Corner'), true);
  assert.equal(validator.validate('123, Sky Park St.'), true);
  assert.equal(validator.validate('123, Sky Park St. & Baker Street'), true);
});
