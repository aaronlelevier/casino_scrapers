import Ember from 'ember';
import { test, module } from 'qunit';
import phone_number_validation from 'bsrs-ember/validation/phone';

module('phone validation tests');

test('should be a valid us phone number', function(assert) {
    assert.ok(!phone_number_validation(''));
    assert.ok(!phone_number_validation('5'));
    assert.ok(!phone_number_validation('51'));
    assert.ok(!phone_number_validation('515'));
    assert.ok(!phone_number_validation('515-'));
    assert.ok(!phone_number_validation('515-1'));
    assert.ok(!phone_number_validation('515-12'));
    assert.ok(!phone_number_validation('515-123-'));
    assert.ok(!phone_number_validation('515-123-4'));
    assert.ok(!phone_number_validation('515-123-45'));
    assert.ok(!phone_number_validation('515-123-456'));
    assert.ok(phone_number_validation('515-123-4567'));
    assert.ok(!phone_number_validation('515-123-45678'));
    assert.ok(!phone_number_validation('5a5-123-4567'));
    assert.ok(!phone_number_validation('515-1b3-4567'));
    assert.ok(!phone_number_validation('515-123-4c67'));
});
