import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import PhoneNumber from 'bsrs-ember/models/phonenumber';
import PHONE_NUMBER_DEFAULTS from 'bsrs-ember/vendor/defaults/phone-number';

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

moduleForComponent('input-dynamic-filter', 'Unit | Component | input dynamic filter', {
  // needs: ['component:foo', 'helper:bar'],
  unit: true
});

test('will not fire off message when value is null', function(assert) {
  var done = assert.async();
  var stub = FakeService.create();
  var foo = Ember.Object.create();
  var subject = this.subject({ obj: foo, prop: 'bar', eventbus: stub });
  subject.set('value', null);
  setTimeout(function() {
      assert.equal(stub.hits(), 0);
      setTimeout(function() {
          assert.equal(stub.hits(), 0);
          done();
      }, 11);
  }, 290);
});
