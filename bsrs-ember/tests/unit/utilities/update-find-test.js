import Ember from 'ember';
import { test, module } from 'qunit';
import UpdateFind from 'bsrs-ember/mixins/update-find';

var FakeComponentTwo = Ember.Object.extend(UpdateFind, {
  run: function(column, value, finalFilter='') {
    return this.update_find_query(column, value, this.get('find'), finalFilter);
  }
});

module('update-find unit tests');

test('update will alter the find query param correctly (starting with null)', function(assert) {
  let subject = new FakeComponentTwo();
  let result = subject.run('username', 'abc');
  assert.equal(result, 'username:abc');
});

test('update will alter the find query param correctly (starting with single value)', function(assert) {
  let subject = new FakeComponentTwo();
  subject.set('find', 'username:xyz');
  let result = subject.run('username', 'abc');
  assert.equal(result, 'username:abc');
});

test('adds second query param correctly (starting with single value)', function(assert) {
  let subject = new FakeComponentTwo();
  subject.set('find', 'username:xyz');
  let result = subject.run('wat', 'abc');
  assert.equal(result, 'username:xyz,wat:abc');
});

test('adds two query params if no find query param correctly (starting with single value)', function(assert) {
  let subject = new FakeComponentTwo();
  subject.set('find', '');
  let result = subject.run('username', 'abc');
  result = subject.run('wat', 'abc', 'username:abc');
  assert.equal(result, ',wat:abc');
});

test('update will alter the find query param correctly after clearing out input field', function(assert) {
  let subject = new FakeComponentTwo();
  subject.set('find', 'username:');
  let result = subject.run('username', '');
  assert.equal(result, '');
});

test('update will alter the find query param correctly (when param in between 2 others)', function(assert) {
  let subject = new FakeComponentTwo();
  subject.set('find', 'foo:bar,username:xyz,bat:man');
  let result = subject.run('username', 'abc');
  assert.equal(result, 'foo:bar,username:abc,bat:man');
});

test('update will alter the find query param correctly (when param at the end but not single)', function(assert) {
  let subject = new FakeComponentTwo();
  subject.set('find', 'foo:bar,username:xyz');
  let result = subject.run('username', 'abc');
  assert.equal(result, 'foo:bar,username:abc');
});

test('update will alter the find query param correctly (when param at the front but not single)', function(assert) {
  let subject = new FakeComponentTwo();
  subject.set('find', 'username:xyz,bat:man');
  let result = subject.run('username', 'abc');
  assert.equal(result, 'username:abc,bat:man');
});

test('update will alter the find query param correctly (when param not yet included but others exist)', function(assert) {
  let subject = new FakeComponentTwo();
  subject.set('find', 'foo:bar,bat:man');
  let result = subject.run('username', 'abc');
  assert.equal(result, 'foo:bar,bat:man,username:abc');
});
