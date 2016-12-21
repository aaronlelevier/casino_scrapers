
import { hasPermission } from 'bsrs-ember/helpers/has-permission';
import { module, test } from 'qunit';

module('Unit | Helper | has permission');

test('it returns true if permissions contain passed in strings', function(assert) {
  let result = hasPermission([], { permissions: ['view_ticket'], verb: 'view', resource: 'ticket'});
  assert.ok(result);
});

test('it returns false if permissions does not contain passed in strings', function(assert) {
  let result = hasPermission([], { permissions: ['view_person'], verb: 'view', resource: 'ticket'});
  assert.notOk(result);
});

test('if resource is admin, then checks permissions if contains all resources for view', function(assert) {
  let result = hasPermission([], { permissions: ['view_person', 'view_category', 'view_role', 'view_location', 
    'view_locationlevel'], verb: 'view', resource: 'admin'});
  assert.ok(result);
});

test('if resource is admin, then checks permissions if contains all resources for add', function(assert) {
  let result = hasPermission([], { permissions: ['add_person', 'add_category', 'add_role', 'add_location', 
    'add_locationlevel'], verb: 'add', resource: 'admin'});
  assert.ok(result);
});

test('passing a resource not covered returns true by default (tenant for example)', function(assert) {
  let result = hasPermission([], { permissions: ['view_role'], verb: 'add', resource: 'tenant'});
  assert.ok(result);
});

test('no permissions works as well', function(assert) {
  let result = hasPermission([], { permissions: [], verb: 'add', resource: 'admin'});
  assert.notOk(result);
});

test('passing a resource with dashes or underscore works', function(assert) {
  let result = hasPermission([], { permissions: ['view_locationlevel'], verb: 'view', resource: 'location-_level'});
  assert.ok(result);
});
