import {test, module} from 'qunit';
import InputFieldComponent from "bsrs-ember/components/dynamic-input-field/component";
import Ember from 'ember';

module('unit: dynamic-input-field test');

test('value is dynamic based on model and property value', (assert) => {
  var too = Ember.Object.create({
    text: 'foobar'
  });
  var subject = InputFieldComponent.create({
    obj: too,
    prop: 'text'
  });

  assert.equal(subject.get('value'), 'foobar');

});
