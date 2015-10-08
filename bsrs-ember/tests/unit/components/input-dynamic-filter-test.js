import Ember from 'ember';
import {test, module} from 'qunit';
import PhoneNumber from 'bsrs-ember/models/phonenumber';
import PHONE_NUMBER_DEFAULTS from 'bsrs-ember/vendor/defaults/phone-number';
import InputDynamicFilter from 'bsrs-ember/components/input-dynamic-filter/component';

var FakeService = Ember.Object.extend({
    init: function() {
        this.count = 0;
    },
    publish: function() {
        this.count = this.count + 1;
    },
    hits: function() {
        return this.count;
    }
});

module('unit: input-dynamic-filter test');

test('will not fire off message when value is null', (assert) => {
  var done = assert.async();
  var stub = FakeService.create();
  var foo = Ember.Object.create();
  var subject = InputDynamicFilter.create({
    obj: foo,
    prop: 'bar',
    eventbus: stub
  });
  subject.set('value', null);
  setTimeout(function() {
      assert.equal(stub.hits(), 0);
      setTimeout(function() {
          assert.equal(stub.hits(), 0);
          done();
      }, 11);
  }, 290);
});
