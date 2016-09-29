import Ember from 'ember';
import {test, module} from '../helpers/qunit';
import module_registry from '../helpers/module_registry';
import camel from 'bsrs-components/utils/camel';
import caps from 'bsrs-components/utils/caps';
import { belongs_to_rollback_simple } from 'bsrs-components/attr/belongs-to';

var store, user; 

module('unit: belongs test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:user', 'model:hat', 'model:issue', 'model:tag', 'model:shirt', 'model:user-status']);
  }
});

test('belongs to returns associated object or undefined and does not leak state', (assert) => {
  var user = store.push('user', {id: 1});
  store.push('hat', {id: 2, users: [1]});
  var hat = user.get('hat');
  assert.equal(hat.get('id'), 2);
  Ember.run(() => {
    store.push('hat', {id: 2, users: []});
  });
  assert.equal(user.get('hat'), undefined);
  var issue = store.push('issue', {id: 9});
  store.push('tag', {id: 8, issues: [9]});
  var tag = issue.get('tag');
  assert.equal(tag.get('id'), 8);
  assert.equal(user.get('hat'), undefined);
  Ember.run(() => {
    store.push('hat', {id: 2, users: [1]});
  });
  assert.equal(user.get('hat.id'), 2);
  tag = issue.get('tag');
  assert.equal(tag.get('id'), 8);
  var user_2 = store.push('user', {id: 2});
  store.push('hat', {id: 3, users: [2]});
  var hat_2 = user_2.get('hat');
  assert.equal(hat_2.get('id'), 3);
});

test('belongs_to computed is read only', (assert) => {
  assert.expect(3);
  store.push('hat', {id: 2, users: [1]});
  var user = store.push('user', {id: 1});
  assert.ok(user.get('hat'));
  try{
    user.set('hats', []);
  }catch(e) {
    assert.ok(e.message.indexOf('Cannot set read-only') > -1);
  }
  assert.ok(user.get('hat'));
});

test('hat property returns associated object or undefined', (assert) => {
  user = store.push('user', {id: 1});
  store.push('hat', {id: 2, users: [1]});
  let hat = user.get('hat');
  assert.equal(hat.get('id'), 2);
  Ember.run(() => {
    store.push('hat', {id: hat.get('id'), users: []});
  });
  hat = user.get('hat');
  assert.equal(hat, undefined);
});

test('users array can be undefined', function(assert) {
  let user = store.push('user', {id: 1});
  let hat = store.push('hat', {id: 2, users: undefined});
  assert.equal(user.get('hat'), undefined);
  user.change_hat(2);
  assert.deepEqual(hat.get('users'), [1]);
  assert.equal(user.get('hat.id'), 2);
  let hats = store.find('hat');
  assert.equal(hats.get('length'), 1);
});

test('change_hat will append user id to the (new) hat users array', function(assert) {
  let user = store.push('user', {id: 1});
  let hat = store.push('hat', {id: 2, users: [9, 8, 7]});
  assert.equal(user.get('hat'), undefined);
  user.change_hat(2);
  assert.deepEqual(hat.get('users'), [9, 8, 7, 1]);
  assert.equal(user.get('hat.id'), 2);
  let hats = store.find('hat');
  assert.equal(hats.get('length'), 1);
  let issue = store.push('issue', {id: 4});
  let tag = store.push('tag', {id: 5, issues: [19, 18, 17]});
  assert.equal(issue.get('tag'), undefined);
  issue.change_tag(5);
  assert.deepEqual(tag.get('issues'), [19, 18, 17, 4]);
  assert.equal(issue.get('tag.id'), 5);
  let tags = store.find('tag');
  assert.equal(tags.get('length'), 1);
});

test('change_shirt accepts js objects', function(assert) {
  let user = store.push('user', {id: 1});
  let js_shirt = {id: 2};
  assert.equal(user.get('shirt'), undefined);
  user.change_shirt(js_shirt);
  const shirt = store.find('shirt', js_shirt.id);
  assert.deepEqual(shirt.get('users'), [1]);
  assert.equal(user.get('shirt.id'), 2);
  let shirts = store.find('shirt');
  assert.equal(shirts.get('length'), 1);
});

test('change_shirt will save with updated properties', function(assert) {
  let user = store.push('user', {id: 1});
  let shirt_pushed = store.push('shirt', {id: 2, name: 'wat'});
  let js_shirt = {id: 2, name: 'who'};
  assert.equal(user.get('shirt'), undefined);
  user.change_shirt(js_shirt);
  const shirt = store.find('shirt', js_shirt.id);
  assert.deepEqual(shirt.get('users'), [1]);
  assert.equal(user.get('shirt.id'), 2);
  let shirts = store.find('shirt');
  assert.equal(shirts.get('length'), 1);
  assert.equal(shirt.get('name'), 'who');
  assert.ok(shirt.get('isNotDirtyOrRelatedNotDirty'));
});

test('change_shirt will not push in shirt if dirty', function(assert) {
  let user = store.push('user', {id: 1});
  const pushed_shirt = store.push('shirt', {id: 2});
  pushed_shirt.set('name', 'wat');
  assert.ok(pushed_shirt.get('isDirtyOrRelatedDirty'));
  let js_shirt = {id: 2};
  assert.equal(user.get('shirt'), undefined);
  user.change_shirt(js_shirt);
  const shirt = store.find('shirt', js_shirt.id);
  assert.deepEqual(shirt.get('users'), [1]);
  assert.equal(user.get('shirt.id'), 2);
  let shirts = store.find('shirt');
  assert.equal(shirts.get('name'), undefined);
  assert.ok(shirt.get('isDirtyOrRelatedDirty'));
});

test('change_shirt will accept null arguments', function(assert) {
  let user = store.push('user', {id: 1, shirt_fk: 2});
  let shirt = store.push('shirt', {id: 2, users: [9, 1, 7]});
  assert.equal(user.get('shirt.id'), 2);
  assert.ok(user.get('shirtIsNotDirty'));
  user.change_shirt(null);
  shirt = store.find('shirt', 2);
  assert.deepEqual(shirt.get('users'), [9, 7]);
  assert.equal(user.get('shirt'), undefined);
  assert.ok(shirt.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(user.get('shirtIsDirty'));
});

test('rollbackShirt will accept null arguments (store.find() checks if typeof and since null is `object`, it passes it in)', function(assert) {
  let user = store.push('user', {id: 1, shirt_fk: null});
  let shirt = store.push('shirt', {id: 2});
  assert.equal(user.get('shirt.id'), undefined);
  assert.ok(user.get('shirtIsNotDirty'));
  user.rollbackShirt();
  shirt = store.find('shirt', 2);
  assert.equal(user.get('shirt'), undefined);
  assert.ok(shirt.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(user.get('shirtIsNotDirty'));
});

test('change_hat will remove the user id from the current hats users array', function(assert) {
  let user = store.push('user', {id: 1});
  let hat = store.push('hat', {id: 2, users: [9, 1, 7]});
  store.push('hat', {id: 3, users: []});
  assert.equal(user.get('hat.id'), 2);
  user.change_hat(3);
  assert.deepEqual(hat.get('users'), [9, 7]);
  assert.equal(user.get('hat.id'), 3);
  let issue = store.push('issue', {id: 11});
  let tag = store.push('tag', {id: 12, issues: [19, 11, 17]});
  store.push('tag', {id: 13, issues: []});
  assert.equal(issue.get('tag.id'), 12);
  issue.change_tag(13);
  assert.deepEqual(tag.get('issues'), [19, 17]);
  assert.equal(issue.get('tag.id'), 13);
});

test('user is dirty or related is dirty when existing hat is altered', (assert) => {
  user = store.push('user', {id: 1, hat_fk: 2});
  store.push('hat', {id: 2, users: [1]});
  store.push('hat', {id: 3, users: []});
  assert.equal(user.get('hat.id'), 2);
  assert.ok(user.get('hatIsNotDirty'));
  user.change_hat(3);
  assert.equal(user.get('hat.id'), 3);
  assert.ok(user.get('hatIsDirty'));
});

test('user is dirty or related is dirty when existing hat is altered (starting w/ nothing)', (assert) => {
  user = store.push('user', {id: 1, hat_fk: undefined});
  store.push('hat', {id: 3, users: []});
  assert.equal(user.get('hat'), undefined);
  assert.ok(user.get('hatIsNotDirty'));
  user.change_hat(3);
  assert.equal(user.get('hat.id'), 3);
  assert.ok(user.get('hatIsDirty'));
});

test('rollback hat will revert and reboot the dirty hat to clean', (assert) => {
  user = store.push('user', {id: 1, hat_fk: 2});
  store.push('hat', {id: 2, users: [1]});
  store.push('hat', {id: 3, users: []});
  assert.equal(user.get('hat.id'), 2);
  assert.ok(user.get('hatIsNotDirty'));
  user.change_hat(3);
  assert.equal(user.get('hat.id'), 3);
  assert.ok(user.get('hatIsDirty'));
  user.rollbackHat();
  assert.equal(user.get('hat.id'), 2);
  assert.ok(user.get('hatIsNotDirty'));
  user.change_hat(3);
  assert.equal(user.get('hat.id'), 3);
  assert.ok(user.get('hatIsDirty'));
  user.saveHat();
  assert.equal(user.get('hat.id'), 3);
  assert.ok(user.get('hatIsNotDirty'));
});

test('rollback hat will revert and reboot the dirty hat to clean', (assert) => {
  user = store.push('user', {id: 1, hat_fk: 2});
  store.push('hat', {id: 2, users: [1]});
  store.push('hat', {id: 3, users: []});
  assert.equal(user.get('hat.id'), 2);
  assert.ok(user.get('hatIsNotDirty'));
  user.change_hat(3);
  assert.equal(user.get('hat.id'), 3);
  assert.ok(user.get('hatIsDirty'));
  user.rollbackHat();
  assert.equal(user.get('hat.id'), 2);
  assert.ok(user.get('hatIsNotDirty'));
  user.change_hat(3);
  assert.equal(user.get('hat.id'), 3);
  assert.ok(user.get('hatIsDirty'));
  user.saveHat();
  assert.equal(user.get('hat.id'), 3);
  assert.ok(user.get('hatIsNotDirty'));
});

test('rollback shirt will revert and reboot the dirty shirt to clean', (assert) => {
  user = store.push('user', {id: 1, shirt_fk: 2});
  store.push('shirt', {id: 2, users: [1]});
  const js_shirt = {id: 3, users: []};
  assert.equal(user.get('shirt.id'), 2);
  assert.ok(user.get('shirtIsNotDirty'));
  user.change_shirt(js_shirt);
  assert.equal(user.get('shirt.id'), 3);
  assert.ok(user.get('shirtIsDirty'));
  user.rollbackShirt();
  assert.equal(user.get('shirt.id'), 2);
  assert.ok(user.get('shirtIsNotDirty'));
  user.change_shirt(js_shirt);
  assert.equal(user.get('shirt.id'), 3);
  assert.ok(user.get('shirtIsDirty'));
  user.saveShirt();
  assert.equal(user.get('shirt.id'), 3);
  assert.ok(user.get('shirtIsNotDirty'));
});

test('rollback shirt will accept null arg', (assert) => {
  user = store.push('user', {id: 1, shirt_fk: 2});
  store.push('shirt', {id: 2, users: [1]});
  const js_shirt = {id: 3, users: []};
  assert.equal(user.get('shirt.id'), 2);
  assert.ok(user.get('shirtIsNotDirty'));
  user.change_shirt(null);
  assert.equal(user.get('shirt'), undefined);
  assert.ok(user.get('shirtIsDirty'));
  user.rollbackShirt();
  assert.equal(user.get('shirt.id'), 2);
  assert.ok(user.get('shirtIsNotDirty'));
  user.change_shirt(js_shirt);
  assert.equal(user.get('shirt.id'), 3);
  assert.ok(user.get('shirtIsDirty'));
  user.saveShirt();
  assert.equal(user.get('shirt.id'), 3);
  assert.ok(user.get('shirtIsNotDirty'));
});

test('rollback hat from null to smthn to null', (assert) => {
  user = store.push('user', {id: 1, hat_fk: undefined});
  store.push('hat', {id: 2, users: []});
  store.push('hat', {id: 3, users: []});
  assert.equal(user.get('hat.id'), undefined);
  assert.equal(user.get('hat_fk'), undefined);
  assert.ok(user.get('hatIsNotDirty'));
  user.change_hat(3);
  assert.equal(user.get('hat.id'), 3);
  assert.equal(user.get('hat_fk'), undefined);
  assert.ok(user.get('hatIsDirty'));
  user.rollbackHat();
  assert.equal(user.get('hat.id'), undefined);
  assert.equal(user.get('hat_fk'), undefined);
  assert.ok(user.get('hatIsNotDirty'));
});

test('rollback hat from smthn to null to smthn', (assert) => {
  user = store.push('user', {id: 1, hat_fk: 2});
  store.push('hat', {id: 2, users: [1]});
  store.push('hat', {id: 3, users: []});
  assert.equal(user.get('hat.id'), 2);
  assert.equal(user.get('hat_fk'), 2);
  assert.ok(user.get('hatIsNotDirty'));
  user.change_hat(null);
  assert.equal(user.get('hat.id'), null);
  assert.equal(user.get('hat_fk'), 2);
  assert.ok(user.get('hatIsDirty'));
  user.rollbackHat();
  assert.equal(user.get('hat.id'), 2);
  assert.equal(user.get('hat_fk'), 2);
  assert.ok(user.get('hatIsNotDirty'));
});

test('hat will save correctly as undefined', (assert) => {
  user = store.push('user', {id: 1, hat_fk: undefined});
  store.push('hat', {id: 2, users: []});
  user.saveHat();
  let hat = user.get('hat');
  assert.equal(user.get('hat_fk'), undefined);
});

test('hat will be set then removed and model is updated', (assert) => {
  user = store.push('user', {id: 1, hat_fk: 2});
  store.push('hat', {id: 2, users: [1]});
  user.saveHat();
  let hat = user.get('hat');
  assert.equal(user.get('hat.id'), hat.get('id'));
  assert.equal(user.get('hat_fk'), 2);
  user.change_hat(null);
  assert.equal(user.get('hat.id'), undefined);
  assert.equal(user.get('hat_fk'), 2);
  user.saveHat();
  assert.equal(user.get('hat_fk'), undefined);
});

test('change_hat to null', function(assert) {
  let user = store.push('user', {id: 1, hat_fk: 2});
  let hat = store.push('hat', {id: 2, users: [1]});
  assert.equal(user.get('hat.id'), 2);
  assert.ok(user.get('hatIsNotDirty'));
  user.change_hat(null);
  assert.equal(user.get('hat.id'), undefined);
  assert.ok(user.get('hatIsDirty'));
});

test('change_hat start with null hat, add, then remove', function(assert) {
  let user = store.push('user', {id: 1});
  assert.equal(user.get('hat.id'), undefined);
  assert.ok(user.get('hatIsNotDirty'));
  let hat = store.push('hat', {id: 2});
  user.change_hat(2);
  assert.equal(user.get('hat.id'), 2);
  assert.ok(user.get('hatIsDirty'));
  user.change_hat(null);
  assert.ok(user.get('hatIsNotDirty'));
});

test('user-status model connects status and user correctly', (assert) => {
  var user = store.push('user', {id: 1});
  store.push('user-status', {id: 2, users: [1]});
  var status = user.get('user_status');
  assert.equal(status.get('id'), 2);
  Ember.run(() => {
    store.push('user-status', {id: 2, users: []});
  });
  assert.equal(user.get('user_status'), undefined);
  var user_2 = store.push('user', {id: 2});
  store.push('user-status', {id: 3, users: [2]});
  var status_2 = user_2.get('user_status');
  assert.equal(status_2.get('id'), 3);
});

test('user-status can be changed', (assert) => {
  var user = store.push('user', {id: 1});
  store.push('user-status', {id: 2, users: [1]});
  store.push('user-status', {id: 3});
  var status = user.get('user_status');
  assert.equal(status.get('id'), 2);
  user.change_user_status(3);
  var status_2 = user.get('user_status');
  assert.equal(status_2.get('id'), 3);
});

test('ignore defining a property on a model if passed in on init (user-status model)', assert => {
  const user_status = store.push('user-status', {id: 2, users: [1]});
  assert.equal(user_status.change_hat(), 'wat');
  assert.equal(user_status.save(), 'wat');
  assert.equal(user_status.rollback(), 'wat');
  assert.equal(user_status.dirty(), 'wat');
  assert.equal(user_status.belongs_to(), 'wat');
});

test('exported function still able to use by overriding overrideOwnerName', assert => {
  let user = store.push('user', {id: 1});
  let hat = store.push('hat', {id: 2, users: undefined});
  let hat2 = store.push('hat', {id: 3, users: undefined});
  assert.equal(user.get('hat'), undefined);
  user.change_fk(2);
  assert.deepEqual(hat.get('users'), [1]);
  assert.equal(user.get('hat.id'), 2);
});

test('exported function still able to use by overriding overrideOwnerName', assert => {
  let user = store.push('user', {id: 1});
  let hat = {id: 2};
  assert.equal(user.get('hat'), undefined);
  user.change_full(hat);
  hat = store.find('hat', 2);
  assert.deepEqual(hat.get('users'), [1]);
  assert.equal(user.get('hat.id'), 2);
});

test('camel utility', assert => {
  let str = camel('location_level');
  assert.equal(str, 'locationLevel');
  str = camel('status');
  assert.equal(str, 'status');
  str = camel('billing_phone_number');
  assert.equal(str, 'billingPhoneNumber');
  str = camel('billing_phone_number_second');
  assert.equal(str, 'billingPhoneNumberSecond');
});

test('caps utility', assert => {
  let str = caps('location_level');
  assert.equal(str, 'LocationLevel');
  str = caps('status');
  assert.equal(str, 'Status');
});

test('caps utility - multiple underscores', assert => {
  let str = caps('billing_phone_number');
  assert.equal(str, 'BillingPhoneNumber');
  str = caps('billing_phone_number_second');
  assert.equal(str, 'BillingPhoneNumberSecond');
});

test('user has simpleStore', (assert) => {
  const user = store.push('user', {id: 5});
  assert.ok(user.get('simpleStore'));
});
