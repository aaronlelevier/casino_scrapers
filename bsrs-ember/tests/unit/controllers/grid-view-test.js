import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import GridViewController from 'bsrs-ember/mixins/controller/grid';

var store;

module('unit: grid-view-controller test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:filterset']);
  }
});

test('hasActiveFilterSet returns true when any sort, search, or find present', (assert) => {
  var subject = GridViewController.create({filtersets: []});
  assert.ok(!subject.get('hasActiveFilterSet'));
  subject.set('page', 2);
  assert.ok(!subject.get('hasActiveFilterSet'));
  subject.set('page', 1);
  assert.ok(!subject.get('hasActiveFilterSet'));
  subject.set('search', 'd');
  assert.ok(subject.get('hasActiveFilterSet'));
  subject.set('search', null);
  assert.ok(!subject.get('hasActiveFilterSet'));
  subject.set('search', '');
  assert.ok(!subject.get('hasActiveFilterSet'));
  subject.set('sort', 'name');
  assert.ok(subject.get('hasActiveFilterSet'));
  subject.set('sort', null);
  assert.ok(!subject.get('hasActiveFilterSet'));
  subject.set('sort', '');
  assert.ok(!subject.get('hasActiveFilterSet'));
  subject.set('find', 'name:x');
  assert.ok(subject.get('hasActiveFilterSet'));
  subject.set('find', null);
  assert.ok(!subject.get('hasActiveFilterSet'));
  subject.set('find', '');
  assert.ok(!subject.get('hasActiveFilterSet'));
  subject.set('page_size', '25');
  assert.ok(!subject.get('hasActiveFilterSet'));
  subject.set('page_size', null);
  assert.ok(!subject.get('hasActiveFilterSet'));
  subject.set('page_size', '');
  assert.ok(!subject.get('hasActiveFilterSet'));
});

test('hasActiveFilterSet returns true when the none of the filterset models matches the current params and routeName', (assert) => {
  var routeName = 'admin.roles.index';
  store.push('filterset', {id: 1, name: 'one', endpoint_name: routeName, endpoint_uri: '?find=fullname%3Atru&search=wa&sort=one'});
  store.push('filterset', {id: 2, name: 'two', endpoint_name: routeName, endpoint_uri: '?find=fullname%3Atru&search=wa&sort=two'});
  store.push('filterset', {id: 3, name: 'three', endpoint_name: routeName, endpoint_uri: '?find=fullname%3Atru&search=wa&sort=three'});
  var filtersets = store.find('filterset');
  var subject = GridViewController.create({routeName: routeName, filtersets: filtersets});
  subject.set('find', 'fullname:tru');
  subject.set('search', 'wa');
  subject.set('sort', undefined);
  assert.ok(subject.get('hasActiveFilterSet'));
});

test('hasActiveFilterSet returns false when the last filterset model matches the current params and routeName', (assert) => {
  var routeName = 'admin.roles.index';
  store.push('filterset', {id: 1, name: 'one', endpoint_name: routeName, endpoint_uri: '?find=fullname%3Atru&search=wa&sort=one'});
  store.push('filterset', {id: 2, name: 'two', endpoint_name: routeName, endpoint_uri: '?find=fullname%3Atru&search=wa&sort=two'});
  store.push('filterset', {id: 3, name: 'three', endpoint_name: routeName, endpoint_uri: '?find=fullname%3Atru&search=wa&sort=three'});
  var filtersets = store.find('filterset');
  var subject = GridViewController.create({routeName: routeName, filtersets: filtersets});
  subject.set('find', 'fullname:tru');
  subject.set('search', 'wa');
  subject.set('sort', 'three');
  assert.ok(!subject.get('hasActiveFilterSet'));
});

test('hasActiveFilterSet returns false when the middle filterset model matches the current params and routeName', (assert) => {
  var routeName = 'admin.roles.index';
  store.push('filterset', {id: 1, name: 'one', endpoint_name: routeName, endpoint_uri: '?find=fullname%3Atru&search=wa&sort=one'});
  store.push('filterset', {id: 2, name: 'two', endpoint_name: routeName, endpoint_uri: '?find=fullname%3Atru&search=wa&sort=two'});
  store.push('filterset', {id: 3, name: 'three', endpoint_name: routeName, endpoint_uri: '?find=fullname%3Atru&search=wa&sort=three'});
  var filtersets = store.find('filterset');
  var subject = GridViewController.create({routeName: routeName, filtersets: filtersets});
  subject.set('find', 'fullname:tru');
  subject.set('search', 'wa');
  subject.set('sort', 'two');
  assert.ok(!subject.get('hasActiveFilterSet'));
});

test('hasActiveFilterSet returns false when the first filterset model matches the current params and routeName', (assert) => {
  var routeName = 'admin.roles.index';
  store.push('filterset', {id: 1, name: 'one', endpoint_name: routeName, endpoint_uri: '?find=fullname%3Atru&search=wa&sort=one'});
  store.push('filterset', {id: 2, name: 'two', endpoint_name: routeName, endpoint_uri: '?find=fullname%3Atru&search=wa&sort=two'});
  store.push('filterset', {id: 3, name: 'three', endpoint_name: routeName, endpoint_uri: '?find=fullname%3Atru&search=wa&sort=three'});
  var filtersets = store.find('filterset');
  var subject = GridViewController.create({routeName: routeName, filtersets: filtersets});
  subject.set('find', 'fullname:tru');
  subject.set('search', 'wa');
  subject.set('sort', 'one');
  assert.ok(!subject.get('hasActiveFilterSet'));
});
