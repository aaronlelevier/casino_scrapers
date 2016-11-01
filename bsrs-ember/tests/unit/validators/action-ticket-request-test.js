import { moduleFor, test } from 'ember-qunit';

moduleFor('validator:action-ticket-request', 'Unit | Validator | action-ticket-request', {
  needs: ['validator:messages']
});

test('it works', function(assert) {
  var validator = this.subject();
  assert.ok(validator);
});
