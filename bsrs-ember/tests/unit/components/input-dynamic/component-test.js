import { moduleForComponent, test } from 'ember-qunit';
import PhoneNumber from 'bsrs-ember/models/phonenumber';
import PHONE_NUMBER_DEFAULTS from 'bsrs-ember/vendor/defaults/phone-number';

moduleForComponent('input-dynamic', 'Unit | Component | input dynamic', {
  unit: true,
});

test('value is dynamic based on model and property value', function(assert) {
  var phone_number = PhoneNumber.create({
    number: PHONE_NUMBER_DEFAULTS.numberOne
  });
  var subject = this.subject({ obj: phone_number, prop: 'number' });
  assert.equal(subject.get('value'), PHONE_NUMBER_DEFAULTS.numberOne);
});
