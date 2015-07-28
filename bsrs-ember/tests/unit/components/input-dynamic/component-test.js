import Ember from 'ember';
import {test, module} from 'qunit';
import PhoneNumber from 'bsrs-ember/models/phonenumber';
import PHONE_NUMBER_DEFAULTS from 'bsrs-ember/vendor/defaults/phone-number';
import InputFieldComponent from "bsrs-ember/components/input-dynamic/component";

module('unit: input-dynamic test');

test('value is dynamic based on model and property value', (assert) => {
  var phone_number = PhoneNumber.create({
    number: PHONE_NUMBER_DEFAULTS.numberOne
  });
  var subject = InputFieldComponent.create({
    obj: phone_number,
    prop: 'number'
  });
  assert.equal(subject.get('value'), PHONE_NUMBER_DEFAULTS.numberOne);
});
