import Ember from 'ember';
const { run } = Ember;
import { test, module } from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import AD from 'bsrs-ember/vendor/defaults/assignment';
import AF from 'bsrs-ember/vendor/assignment_fixtures';
import assignmentDeserializer from 'bsrs-ember/deserializers/assignment';
import PFD from 'bsrs-ember/vendor/defaults/pfilter';
import AJFD from 'bsrs-ember/vendor/defaults/assignment-join-pfilter';
import PJCD from 'bsrs-ember/vendor/defaults/pfilter-join-criteria';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import LD from 'bsrs-ember/vendor/defaults/location';

var store, assignment, deserializer, pfilter, pfilter_unused;

module('unit: assignment deserializer test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:assignment', 'model:assignment-list', 'model:person', 'model:assignment-join-pfilter', 'model:pfilter', 'model:criteria', 'model:pfilter-join-criteria', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
    deserializer = assignmentDeserializer.create({ simpleStore: store });
    run(() => {
      assignment = store.push('assignment', { id: AD.idOne });
    });
  }
});

test('deserialize single', assert => {
  const json = AF.detail();
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assert.equal(assignment.get('id'), AD.idOne);
  assert.equal(assignment.get('description'), AD.descriptionOne);
  assert.equal(assignment.get('assignee_fk'), AD.assigneeOne);
  assert.equal(assignment.get('assignee').get('id'), AD.assigneeOne);
  assert.equal(assignment.get('assignee').get('fullname'), AD.fullname);
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.equal(assignment.get('pf').objectAt(0).get('id'), PFD.idOne);
  assert.equal(assignment.get('pf').objectAt(0).get('source_id'), PFD.sourceIdOne);
  assert.equal(assignment.get('pf').objectAt(0).get('criteria').get('length'), 1);
  assert.equal(assignment.get('pf').objectAt(0).get('criteria').objectAt(0).get('id'), TD.priorityOneId);
});

// test('existing assignment w/ pf, and server returns no pf - want no pf b/c that is the most recent', assert => {
//   store.push('assignment-join-pfilter', {id: AJFD.idOne, assignment_pk: AD.idOne, pfilter_pk: PFD.idOne});
//   assignment = store.push('assignment', {id: AD.idOne, assignment_pf_fks: [AJFD.idOne]});
//   store.push('pfilter', {id: PFD.idOne});
//   const pf = assignment.get('pf');
//   assert.equal(pf.get('length'), 1);
//   let json = AF.detail();
//   json.filters = [];
//   run(() => {
//     deserializer.deserialize(json, AD.idOne);
//   });
//   assignment = store.find('assignment', AD.idOne);
//   assert.equal(assignment.get('pf').get('length'), 0);
//   assert.ok(assignment.get('isNotDirty'));
//   assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
// });

// pfilter
test('existing assignment w/ pf, and server returns w/ 1 extra pf', assert => {
  store.push('assignment-join-pfilter', {id: AJFD.idOne, assignment_pk: AD.idOne, pfilter_pk: PFD.idOne});
  store.push('assignment', {id: AD.idOne, assignment_pf_fks: [AJFD.idOne]});
  store.push('pfilter', {id: PFD.idOne});
  let json = AF.detail();
  json.filters.push({id: PFD.unusedId, criteria: [{id: TD.priorityOneId}]});
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assignment = store.find('assignment', AD.idOne);
  assert.equal(assignment.get('pf').get('length'), 2);
  assert.ok(assignment.get('isNotDirty'));
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
});

test('existing assignment w/ pf and get same pf', assert => {
  store.push('assignment-join-pfilter', {id: AJFD.idOne, assignment_pk: AD.idOne, pfilter_pk: PFD.idOne});
  store.push('assignment', {id: AD.idOne, assignment_pf_fks: [AJFD.idOne]});
  store.push('pfilter', {id: PFD.idOne});
  const json = AF.detail();
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assignment = store.find('assignment', AD.idOne);
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.ok(assignment.get('isNotDirty'));
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
});

//criteria
test('existing pfilter w/ criteria, and server returns w/ 1 extra criteria', assert => {
  store.push('pfilter-join-criteria', {id: PJCD.idOne, pfilter_pk: PFD.idOne, criteria_pk: PFD.idOne});
  store.push('pfilter', {id: PFD.idOne, assignment_pf_fks: [PJCD.idOne], pfilter_criteria_fks: [PJCD.idOne]});
  store.push('criteria', {id: PFD.idOne});
  let json = AF.detail();
  json.filters.push({id: PFD.unusedId, criteria: [{id: TD.priorityOneId}, {id: TD.priorityTwoId}]});
  run(() => {
    deserializer.deserialize(json, PFD.idOne);
  });
  pfilter = store.find('pfilter', PFD.idOne);
  assert.equal(pfilter.get('criteria').get('length'), 1);
  pfilter_unused = store.find('pfilter', PFD.unusedId);
  assert.equal(pfilter_unused.get('criteria').get('length'), 2);
  assert.ok(pfilter.get('isNotDirty'));
  assert.ok(pfilter.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(pfilter_unused.get('isNotDirty'));
  assert.ok(pfilter_unused.get('isNotDirtyOrRelatedNotDirty'));
});

test('existing pfilter w/ criteria and get same criteria', assert => {
  store.push('pfilter-join-criteria', {id: PJCD.idOne, pfilter_pk: PFD.idOne, criteria_pk: PFD.idOne});
  store.push('pfilter', {id: PFD.idOne, assignment_pf_fks: [PJCD.idOne], pfilter_criteria_fks: [PJCD.idOne]});
  store.push('criteria', {id: PFD.idOne});
  const json = AF.detail();
  run(() => {
    deserializer.deserialize(json, PFD.idOne);
  });
  pfilter = store.find('pfilter', PFD.idOne);
  assert.equal(pfilter.get('criteria').get('length'), 1);
  assert.ok(pfilter.get('isNotDirty'));
  assert.ok(pfilter.get('isNotDirtyOrRelatedNotDirty'));
});

test('deserialize list', assert => {
  let json = AF.list();
  run(() => {
    deserializer.deserialize(json);
  });
  assert.equal(store.find('assignment-list').get('length'), 10);
  assignment = store.find('assignment-list').objectAt(0);
  assert.equal(assignment.get('id'), AD.idOne);
  assert.equal(assignment.get('description'), AD.descriptionOne+'1');
  assert.equal(assignment.get('assignee').id, AD.assigneeOne);
  assert.equal(assignment.get('assignee').fullname, AD.fullname+'1');
});

test('different assignments that have different criteria but the same available filter type', assert => {
  const json = AF.detail(AD.idOne);
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assert.equal(assignment.get('id'), AD.idOne);
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.equal(assignment.get('pf').objectAt(0).get('id'), PFD.idOne);
  assert.equal(assignment.get('pf').objectAt(0).get('source_id'), PFD.sourceIdOne);
  assert.equal(assignment.get('pf').objectAt(0).get('criteria').get('length'), 1);
  assert.equal(assignment.get('pf').objectAt(0).get('criteria').objectAt(0).get('id'), TD.priorityOneId);
  // two
  let json_two = AF.detail(AD.idTwo);
  json_two.filters[0].id = PFD.idTwo;
  json_two.filters[0].criteria = PFD.criteriaTwo;
  run(() => {
    deserializer.deserialize(json_two, AD.idOne);
  });
  let assignment_two = store.find('assignment', AD.idTwo);
  assert.equal(assignment_two.get('id'), AD.idTwo);
  assert.equal(assignment_two.get('pf').get('length'), 1);
  assert.equal(assignment_two.get('pf').objectAt(0).get('id'), PFD.idTwo);
  assert.equal(assignment_two.get('pf').objectAt(0).get('source_id'), PFD.sourceIdOne);
  assert.equal(assignment_two.get('pf').objectAt(0).get('criteria').get('length'), 1);
  assert.equal(assignment_two.get('pf').objectAt(0).get('criteria').objectAt(0).get('id'), LD.idOne);
});

test('2nd deserialize, criteria is a simple-store instance and not a POJO', assert => {
  // deserialize once
  const json = AF.detail();
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assert.equal(assignment.get('pf').objectAt(0).get('criteria').get('length'), 1);
  assert.equal(assignment.get('pf').objectAt(0).get('criteria').objectAt(0).get('id'), TD.priorityOneId);
  // 2nd deserialize
  const json_two = AF.detail();
  run(() => {
    deserializer.deserialize(json_two, AD.idOne);
  });
  assert.equal(assignment.get('pf').objectAt(0).get('criteria').get('length'), 1);
  assert.equal(assignment.get('pf').objectAt(0).get('criteria').objectAt(0).get('id'), TD.priorityOneId);
});
