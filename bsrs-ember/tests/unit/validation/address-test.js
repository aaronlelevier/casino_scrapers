import Ember from 'ember';
import { test, module } from 'qunit';
import address_validation from 'bsrs-ember/validation/address_name';

module('address name validation tests');

test('should be a valid address', function(assert) {
    assert.ok(!address_validation(''));
    assert.ok(!address_validation('a'));
    assert.ok(!address_validation('ab'));
    assert.ok(!address_validation('a1'));
    assert.ok(!address_validation('High Street %'));
    assert.ok(!address_validation('High Street!'));
    assert.ok(!address_validation('High Street?'));
    assert.ok(!address_validation('High Street >'));
    assert.ok(!address_validation('High Street <'));
    assert.ok(!address_validation('High Street+'));
    assert.ok(!address_validation('123 Sky Park St. ^123'));
    assert.ok(!address_validation('123 Sky Park St. =123'));

    assert.ok(address_validation('skypark'));
    assert.ok(address_validation('Skypark'));
    assert.ok(address_validation('123 Skypark'));
    assert.ok(address_validation('123 Skypark (Local House)'));
    assert.ok(address_validation('123 Sky Park'));
    assert.ok(address_validation('123 Sky-Park'));
    assert.ok(address_validation('123 Sky Park #123'));
    assert.ok(address_validation('123 Sky Park St.'));
    assert.ok(address_validation('123 Sky Park St. [Corner]'));
    assert.ok(address_validation('123 Sky Park St. {Corner}'));
    assert.ok(address_validation('123 Sky Park St. *Corner'));
    assert.ok(address_validation('123 Sky Park St. @123'));
    assert.ok(address_validation('123, Sky Park St.'));
    assert.ok(address_validation('123 Sky Park St. & Baker Street'));
});

