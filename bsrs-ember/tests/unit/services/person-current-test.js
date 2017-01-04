import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test, skip } from 'ember-qunit';
import PersonDeserializer from 'bsrs-ember/deserializers/person';
import LocationDeserializer from 'bsrs-ember/deserializers/location';
import PERSON_CURRENT from 'bsrs-ember/vendor/defaults/person-current';
import { eachPermission } from 'bsrs-ember/utilities/permissions';
import { RESOURCES_WITH_PERMISSION } from 'bsrs-ember/utilities/constants';

const PC = PERSON_CURRENT.defaults();

let person_current, person_deserializer;

moduleFor('service:person-current', 'Unit | Service | person current', {
  needs: ['model:person-current', 'model:location-level', 'model:location', 'model:location-status', 'model:person-location', 
    'service:simpleStore', 'model:locale', 'model:person', 'model:status', 'service:translationsFetcher', 'service:i18n', 'validator:presence', 
    'validator:unique-username', 'validator:length', 'validator:format', 'validator:has-many'],
  beforeEach() {
    this.store = this.container.lookup('service:simpleStore');
    person_current = this.store.push('person-current', PC);

    //no-op deserialize function
    person_deserializer = PersonDeserializer.create();
    this.deserialize = person_deserializer.deserialize;
    person_deserializer.deserialize = () => {};
  },
  afterEach() {
    delete this.store;
    person_deserializer.deserialize = this.deserialize;
    delete this.deserialize;
  },
});

test('vendor fixture data has user permissions list', function(assert) {
  let permissions = PC.permissions;
  assert.expect(permissions.length);
  eachPermission((resource, prefix) => {
    let perm = `${prefix}_${resource}`;
    assert.ok(permissions.includes(perm), `fixture permissions include: "${perm}"`);
  });
});

test('current person is found from the store', function(assert) {
  let service = this.subject();
  let model = service.get('model');
  let expected = PC;
  assert.equal(model.get('id'), expected.id, 'current person id is: ' + expected.id);
});

test('current person service includes permissions list', function(assert) {
  let permissions = PC.permissions;
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
  let permissions = PC.permissions;
  let service = this.subject();
  assert.equal(service.get('permissions').length, permissions.length, 'length is' + permissions.length);
  permissions = service.get('permissions');
  eachPermission((resource, prefix) => {
    let perm = `${prefix}_${resource}`;
    assert.ok(permissions.includes(perm), `person's permissions include: "${perm}"`);
  });

  // NEW PERSON
  const NEW_PERSON_CURRENT = Object.assign(PERSON_CURRENT.defaults(), {id: 'zyx321', permissions: []});
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
  let permissions = PC.permissions;
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

test('pollPersonCurrent is recursive and deserializes a person in setupPersonCurrent', function(assert) {
  const done = assert.async();
  assert.expect(3);
  const setupPersonCurrent = function() {
    assert.ok(true);
  };
  const fetch = function() {
    assert.ok(true);
    counter++;
    if (counter === 2) {
      task.cancel();
      done();
    }
    return new Ember.RSVP.Promise(resolve => resolve());
  };
  const service = this.subject({setupPersonCurrent: setupPersonCurrent, fetch: fetch, PersonDeserializer: person_deserializer});
  let counter = 0;
  let task;
  run(() => {
    task = service.get('pollPersonCurrent').perform();
  });
});

test('setupPersonCurrent will call deserialize on a person', function(assert) {
  assert.expect(2);
  const person_deserializer = PersonDeserializer.create();
  //no-op deserialize function
  person_deserializer.deserialize = function() {
    assert.ok(true);
  };
  const service = this.subject({PersonDeserializer: person_deserializer});
  const people = this.store.find('person');
  assert.equal(people.get('length'), 0);
  run(() => {
    service.setupPersonCurrent(PC);
  });
});
