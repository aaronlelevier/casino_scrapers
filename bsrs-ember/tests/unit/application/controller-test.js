import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';

const { run } = Ember;

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

test('offline event triggers application notice', function(assert) {
  let controller = this.subject();
  run(function() {
    let event = new window.Event('offline');
    window.dispatchEvent(event);
  });
  assert.equal(controller.get('message'), 'notices.offline', 'message set to notices.offline');
  assert.equal(controller.get('level'), 'warning', 'level set to warning');
  // manually dismiss
  controller.setProperties({'message': null, 'level': null});
});

test('online event triggers application notice', function(assert) {
  let controller = this.subject();
  run(function() {
    let event = new window.Event('online');
    window.dispatchEvent(event);
  });
  assert.equal(controller.get('message'), 'notices.online', 'message set to notices.online');
  assert.equal(controller.get('level'), 'info', 'level set to info');
  // manually dismiss
  controller.setProperties({'message': null, 'level': null});
});
