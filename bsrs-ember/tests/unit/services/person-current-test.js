import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import PERSON_CURRENT from 'bsrs-ember/vendor/defaults/person-current';
import { eachPermission } from 'bsrs-ember/utilities/permissions';
import { RESOURCES_WITH_PERMISSION } from 'bsrs-ember/utilities/constants';


moduleFor('service:person-current', 'Unit | Service | person current', {
  needs: ['model:person-current', 'service:simpleStore', 'service:translationsFetcher', 'service:i18n'],
  beforeEach() {
    this.store = this.container.lookup('service:simpleStore');
    this.store.push('person-current', PERSON_CURRENT.defaults());
  },
  afterEach() {
    delete this.store;
  },
});

test('vendor fixture data has user permissions list', function(assert) {
  let permissions = PERSON_CURRENT.defaults().permissions;
  assert.expect(permissions.length);
  eachPermission((resource, prefix) => {
    let perm = `${prefix}_${resource}`;
    assert.ok(permissions.includes(perm), `fixture permissions include: "${perm}"`);
  });
});

test('current person is found from the store', function(assert) {
  let service = this.subject();
  let model = service.get('model');
  let expected = PERSON_CURRENT.defaults();
  assert.equal(model.get('id'), expected.id, 'current person id is: ' + expected.id);
});

test('current person service includes permissions list', function(assert) {
  let permissions = PERSON_CURRENT.defaults().permissions;
  let service = this.subject();
  assert.equal(service.get('permissions').length, permissions.length, 'length is' + permissions.length);
  permissions = service.get('permissions');
  eachPermission((resource, prefix) => {
    let perm = `${prefix}_${resource}`;
    assert.ok(permissions.includes(perm), `person's permissions include: "${perm}"`);
  });
});

test('permissions list will return a different permissions list if the model underlying the person-current changes (app re-login)', function(assert) {
  // OLD PERSON
  let permissions = PERSON_CURRENT.defaults().permissions;
  let service = this.subject();
  assert.equal(service.get('permissions').length, permissions.length, 'length is' + permissions.length);
  permissions = service.get('permissions');
  eachPermission((resource, prefix) => {
    let perm = `${prefix}_${resource}`;
    assert.ok(permissions.includes(perm), `person's permissions include: "${perm}"`);
  });

  // NEW PERSON
  const NEW_PERSON_CURRENT = Object.assign(PERSON_CURRENT, {id: 'zyx321', permissions: []});
  let person_current;
  run(() => {
    this.store.clear('person-current');
    person_current = this.store.push('person-current', NEW_PERSON_CURRENT);
  });
  assert.equal(service.get('model').get('id'), 'zyx321');
  assert.equal(person_current.get('permissions').length, 0, 'updated person-current has no permissions');
  assert.equal(service.get('permissions').length, 0, 'permissions is removed from person current service');
});

test('has computed rights from the permissions list', function(assert) {
  let permissions = PERSON_CURRENT.defaults().permissions;
  let service = this.subject();
  eachPermission((resource, verb) => {
    let prop = `can_${verb}_${resource}`.camelize();
    let right = service.get(prop);
    assert.ok(typeof right === 'boolean', `${prop}:${right} is computed`);
  });
  RESOURCES_WITH_PERMISSION.forEach((resource) => {
    let prop = `is_read_only_${resource}`.camelize();
    let right = service.get(prop);
    assert.ok(typeof right === 'boolean', `${prop}:${right} is computed`);
  });
});
