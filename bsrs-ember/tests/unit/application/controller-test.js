import { moduleFor, test } from 'ember-qunit';

moduleFor('controller:application', 'Unit | Controller | application');

test('dismiss_errors action removes error and level properties', function(assert) {
  let controller = this.subject();
  controller.setProperties({'message': 'i18n-key', 'level': 'error'});
  assert.equal(controller.get('message'), 'i18n-key', 'message set to i18n-key');
  assert.equal(controller.get('level'), 'error', 'level set to error');
  controller.send('dismiss_errors');
  assert.equal(controller.get('message'), null, 'message upset');
  assert.equal(controller.get('level'), null, 'level upset');
});
