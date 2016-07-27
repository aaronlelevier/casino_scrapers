import Ember from 'ember';
const { run } = Ember;
import { test, module } from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import assignmentD from 'bsrs-ember/vendor/defaults/assignment';
import assignmentF from 'bsrs-ember/vendor/assignment_fixtures';
import assignmentDeserializer from 'bsrs-ember/deserializers/assignment';
import AssignmentFilterD from 'bsrs-ember/vendor/defaults/assignmentfilter';
import assignmentJoinFilterD from 'bsrs-ember/vendor/defaults/assignment-join-filter';

var store, assignment, deserializer;

module('unit: assignment deserializer test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:assignment', 'model:assignment-list', 'model:person', 'model:assignment-join-filter', 'model:assignmentfilter', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
    deserializer = assignmentDeserializer.create({
      simpleStore: store
    });
    run(() => {
      assignment = store.push('assignment', { id: assignmentD.idOne });
    });
  }
});

test('deserialize single', assert => {
  const json = assignmentF.detail();
  run(() => {
    deserializer.deserialize(json, assignmentD.idOne);
  });
  assert.equal(assignment.get('id'), assignmentD.idOne);
  assert.equal(assignment.get('description'), assignmentD.descriptionOne);
  assert.equal(assignment.get('assignee_fk'), assignmentD.assigneeOne);
  assert.equal(assignment.get('assignee').get('id'), assignmentD.assigneeOne);
  assert.equal(assignment.get('assignee').get('username'), assignmentD.username);
});

// test('existing assignment w/ pf, and server returns no pf - want no pf b/c that is the most recent', assert => {
//   store.push('assignment-join-filter', {id: assignmentJoinFilterD.idOne, assignment_pk: assignmentD.idOne, assignmentfilter_pk: AssignmentFilterD.idOne});
//   assignment = store.push('assignment', {id: assignmentD.idOne, joinModel_associatedModelFks: [assignmentJoinFilterD.idOne]});
//   store.push('assignmentfilter', {id: AssignmentFilterD.idOne});
//   const pf = assignment.get('pf');
//   assert.equal(pf.get('length'), 1);
//   let json = assignmentF.detail();
//   json.filters = [];
//   run(() => {
//     deserializer.deserialize(json, assignmentD.idOne);
//   });
//   assignment = store.find('assignment', assignmentD.idOne);
//   assert.equal(assignment.get('pf').get('length'), 0);
//   assert.ok(assignment.get('isNotDirty'));
//   assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
// });

test('existing assignment w/ pf, and server returns w/ 1 extra pf', assert => {
  store.push('assignment-join-filter', {id: assignmentJoinFilterD.idOne, assignment_pk: assignmentD.idOne, assignmentfilter_pk: AssignmentFilterD.idOne});
  store.push('assignment', {id: assignmentD.idOne, joinModel_associatedModelFks: [assignmentJoinFilterD.idOne]});
  store.push('assignmentfilter', {id: AssignmentFilterD.idOne});
  let json = assignmentF.detail();
  json.filters.push({id: AssignmentFilterD.unusedId});
  run(() => {
    deserializer.deserialize(json, assignmentD.idOne);
  });
  assignment = store.find('assignment', assignmentD.idOne);
  assert.equal(assignment.get('pf').get('length'), 2);
  assert.ok(assignment.get('isNotDirty'));
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
});

test('existing assignment w/ pf and get same pf', assert => {
  store.push('assignment-join-filter', {id: assignmentJoinFilterD.idOne, assignment_pk: assignmentD.idOne, assignmentfilter_pk: AssignmentFilterD.idOne});
  store.push('assignment', {id: assignmentD.idOne, joinModel_associatedModelFks: [assignmentJoinFilterD.idOne]});
  store.push('assignmentfilter', {id: AssignmentFilterD.idOne});
  const json = assignmentF.detail();
  run(() => {
    deserializer.deserialize(json, assignmentD.idOne);
  });
  assignment = store.find('assignment', assignmentD.idOne);
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.ok(assignment.get('isNotDirty'));
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
});

test('deserialize list', assert => {
  let json = assignmentF.list();
  run(() => {
    deserializer.deserialize(json);
  });
  assert.equal(store.find('assignment-list').get('length'), 20);
  const i = 0;
  assignment = store.find('assignment-list').objectAt(i);
  assert.equal(assignment.get('id'), `${assignmentD.idOne.slice(0,-1)}${i}`);
  assert.equal(assignment.get('description'), `${assignmentD.descriptionOne}${i}`);
  assert.equal(assignment.get('assignee').id, `${assignmentD.assigneeOne.slice(0,-1)}${i}`);
  assert.equal(assignment.get('assignee').username, `${assignmentD.username}${i}`);
});
