import Ember from 'ember';
const { run } = Ember;
import { test, module } from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import AD from 'bsrs-ember/vendor/defaults/automation';
import AAD from 'bsrs-ember/vendor/defaults/automation-action';
import ATD from 'bsrs-ember/vendor/defaults/automation-action-type';
import AJAD from 'bsrs-ember/vendor/defaults/automation-join-action';
import ED from 'bsrs-ember/vendor/defaults/automation-event';
import AF from 'bsrs-ember/vendor/automation_fixtures';
import automationDeserializer from 'bsrs-ember/deserializers/automation';
import PFD from 'bsrs-ember/vendor/defaults/pfilter';
import AJFD from 'bsrs-ember/vendor/defaults/automation-join-pfilter';
import PJCD from 'bsrs-ember/vendor/defaults/pfilter-join-criteria';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import LD from 'bsrs-ember/vendor/defaults/location';
import PersonD from 'bsrs-ember/vendor/defaults/person';
import TPD from 'bsrs-ember/vendor/defaults/ticket-priority';
import TSD from 'bsrs-ember/vendor/defaults/ticket-status';
import SED from 'bsrs-ember/vendor/defaults/sendemail';
import SMSD from 'bsrs-ember/vendor/defaults/sendsms';
import SEJRD from 'bsrs-ember/vendor/defaults/generic-join-recipients';
import SMSJRD from 'bsrs-ember/vendor/defaults/generic-join-recipients';

var store, automation, deserializer, pfilter, pfilter_unused;

module('unit: automation deserializer test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:automation', 'model:automation-action', 'model:automation-action-type', 'model:automation-join-action', 'model:automation-event', 'model:automation-join-event', 'model:automation-list', 'model:person', 'model:automation-join-pfilter', 'model:pfilter', 'model:sendemail', 'model:generic-join-recipients', 'model:sendsms', 'model:generic-join-recipients', 'model:criteria', 'model:pfilter-join-criteria', 'model:ticket-priority', 'model:ticket-status', 'service:person-current', 'service:translations-fetcher', 'service:i18n', 'validator:presence', 'validator:length', 'validator:has-many']);
    deserializer = automationDeserializer.create({ simpleStore: store });
    run(() => {
      automation = store.push('automation', { id: AD.idOne });
    });
  }
});

test('deserialize single - no locale cache to start', assert => {
  const json = AF.detail();
  run(() => {
    store.clear('automation');
    deserializer.deserialize(json, AD.idOne);
  });
  automation = store.find('automation', AD.idOne);
  assert.equal(automation.get('id'), AD.idOne);
  assert.equal(automation.get('description'), AD.descriptionOne);
  // events
  assert.equal(automation.get('event').get('length'), 1);
  assert.equal(automation.get('event').objectAt(0).get('id'), ED.idOne);
  assert.equal(automation.get('event').objectAt(0).get('key'), ED.keyOne);
  // pfilters
  assert.equal(automation.get('pf').get('length'), 1);
  assert.equal(automation.get('pf').objectAt(0).get('id'), PFD.idOne);
  assert.equal(automation.get('pf').objectAt(0).get('source_id'), PFD.sourceIdOne);
  assert.equal(automation.get('pf').objectAt(0).get('criteria').get('length'), 1);
  assert.equal(automation.get('pf').objectAt(0).get('criteria').objectAt(0).get('id'), TD.priorityOneId);
  // actions
  assert.equal(automation.get('action').get('length'), 1);
  assert.equal(automation.get('action').objectAt(0).get('id'), AAD.idOne);
  // action-type
  assert.equal(automation.get('action').objectAt(0).get('type.id'), ATD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('type.key'), ATD.keyOne);
  // assignee
  assert.equal(automation.get('action').objectAt(0).get('assignee.id'), PersonD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('assignee.fullname'), PersonD.fullname);
});

test('deserialize single - status - no existing', assert => {
  const json = AF.detail();
  json.actions[0].status = { id: TSD.idOne, name: TSD.nameOne };
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assert.equal(automation.get('id'), AD.idOne);
  // actions
  assert.equal(automation.get('action').get('length'), 1);
  assert.equal(automation.get('action').objectAt(0).get('id'), AAD.idOne);
  // action-type
  assert.equal(automation.get('action').objectAt(0).get('type.id'), ATD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('type.key'), ATD.keyOne);
  // status
  assert.equal(automation.get('action').objectAt(0).get('status_fk'), TSD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('status').get('id'), TSD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('status').get('name'), TSD.nameOne);
});

test('deserialize single - status - existing with same id', assert => {
  // pre-deserialize
  run(() => {
    store.push('automation-action', {id: AAD.idOne, status_fk: TSD.idOne});
    store.push('automation-join-action', {id: AJAD.idOne, automation_pk: AD.idOne, action_pk: AAD.idOne});
    store.push('ticket-status', {id: TSD.idOne, name: TSD.nameOne, actions: [AAD.idOne]});
  });
  assert.equal(automation.get('id'), AD.idOne);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(automation.get('action').objectAt(0).get('status_fk'), TSD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('status').get('id'), TSD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('status').get('name'), TSD.nameOne);
  // deserialize
  const json = AF.detail();
  json.actions[0].status = { id: TSD.idOne, name: TSD.nameOne };
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assert.equal(automation.get('id'), AD.idOne);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  // actions
  assert.equal(automation.get('action').get('length'), 1);
  assert.equal(automation.get('action').objectAt(0).get('id'), AAD.idOne);
  // action-type
  assert.equal(automation.get('action').objectAt(0).get('type.id'), ATD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('type.key'), ATD.keyOne);
  // status
  assert.equal(automation.get('action').objectAt(0).get('status_fk'), TSD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('status').get('id'), TSD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('status').get('name'), TSD.nameOne);
});

test('deserialize single - status - different id', assert => {
  // pre-deserialize
  run(() => {
    store.push('automation-action', {id: AAD.idOne, status_fk: TSD.idOne});
    store.push('automation-join-action', {id: AJAD.idOne, automation_pk: AD.idOne, action_pk: AAD.idOne});
    store.push('ticket-status', {id: TSD.idOne, name: TSD.nameOne, actions: [AAD.idOne]});
  });
  assert.equal(automation.get('id'), AD.idOne);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(automation.get('action').objectAt(0).get('status_fk'), TSD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('status').get('id'), TSD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('status').get('name'), TSD.keyOne);
  // deserialize
  const json = AF.detail();
  json.actions[0].status = { id: TSD.idTwo, name: TSD.nameTwo };
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assert.equal(automation.get('id'), AD.idOne);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  // actions
  assert.equal(automation.get('action').get('length'), 1);
  assert.equal(automation.get('action').objectAt(0).get('id'), AAD.idOne);
  // action-type
  assert.equal(automation.get('action').objectAt(0).get('type.id'), ATD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('type.key'), ATD.keyOne);
  // status
  assert.equal(automation.get('action').objectAt(0).get('status_fk'), TSD.idTwo);
  assert.equal(automation.get('action').objectAt(0).get('status').get('id'), TSD.idTwo);
  assert.equal(automation.get('action').objectAt(0).get('status').get('name'), TSD.nameTwo);
});

test('deserialize single - sendemail - no existing', assert => {
  const json = AF.detail();
  json.actions[0].sendemail = { id: SED.idOne, subject: SED.subjectOne, body: SED.bodyOne, recipient: [{id: PersonD.idOne, fullname: PersonD.fullname}] };
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assert.equal(automation.get('id'), AD.idOne);
  // actions
  assert.equal(automation.get('action').get('length'), 1);
  assert.equal(automation.get('action').objectAt(0).get('id'), AAD.idOne);
  // action-type
  assert.equal(automation.get('action').objectAt(0).get('type.id'), ATD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('type.key'), ATD.keyOne);
  // sendemail
  assert.equal(automation.get('action').objectAt(0).get('sendemail_fk'), SED.idOne);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('id'), SED.idOne);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('subject'), SED.subjectOne);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('body'), SED.bodyOne);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('recipient').get('length'), 1);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('recipient').objectAt(0).get('id'), PersonD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('recipient').objectAt(0).get('fullname'), PersonD.fullname);
});

test('deserialize single - sendemail - existing with same id', assert => {
  // pre-deserialize
  run(() => {
    store.push('automation-action', {id: AAD.idOne, sendemail_fk: SED.idOne});
    store.push('automation-join-action', {id: AJAD.idOne, automation_pk: AD.idOne, action_pk: AAD.idOne});
    store.push('sendemail', {id: SED.idOne, subject: SED.subjectOne, body: SED.bodyOne, generic_recipient_fks: [SEJRD.idOne], actions: [AAD.idOne]});
    store.push('person', {id: PersonD.idOne});
    store.push('generic-join-recipients', {id: SEJRD.idOne, generic_pk: SED.idOne, recipient_pk: PersonD.idOne});
 });
  assert.equal(automation.get('id'), AD.idOne);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(automation.get('action').objectAt(0).get('sendemail_fk'), SED.idOne);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('id'), SED.idOne);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('name'), SED.keyOne);
  // deserialize
  const json = AF.detail();
  json.actions[0].sendemail = { id: SED.idOne, subject: SED.subjectOne, recipient: [{id: PersonD.idOne, fullname: PersonD.fullname}] };
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assert.equal(automation.get('id'), AD.idOne);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  // actions
  assert.equal(automation.get('action').get('length'), 1);
  assert.equal(automation.get('action').objectAt(0).get('id'), AAD.idOne);
  // action-type
  assert.equal(automation.get('action').objectAt(0).get('type.id'), ATD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('type.key'), ATD.keyOne);
  // sendemail
  assert.equal(automation.get('action').objectAt(0).get('sendemail_fk'), SED.idOne);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('id'), SED.idOne);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('subject'), SED.subjectOne);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('body'), SED.bodyOne);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('recipient').objectAt(0).get('id'), PersonD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('recipient').objectAt(0).get('fullname'), PersonD.fullname);
});

test('deserialize single - sendemail - different id', assert => {
  // pre-deserialize
  run(() => {
    store.push('automation-action', {id: AAD.idOne, sendemail_fk: SED.idOne});
    store.push('automation-join-action', {id: AJAD.idOne, automation_pk: AD.idOne, action_pk: AAD.idOne});
    store.push('sendemail', {id: SED.idOne, subject: SED.subjectOne, body: SED.bodyOne, generic_recipient_fks: [SEJRD.idOne], actions: [AAD.idOne]});
    store.push('person', {id: PersonD.idOne, fullname: PersonD.fullname});
    store.push('generic-join-recipients', {id: SEJRD.idOne, generic_pk: SED.idOne, recipient_pk: PersonD.idOne});
  });
  assert.equal(automation.get('id'), AD.idOne);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(automation.get('action').objectAt(0).get('sendemail_fk'), SED.idOne);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('id'), SED.idOne);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('name'), SED.keyOne);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('recipient').objectAt(0).get('id'), PersonD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('recipient').objectAt(0).get('fullname'), PersonD.fullname);
  // deserialize
  const json = AF.detail();
  json.actions[0].sendemail = { id: SED.idTwo, subject: SED.subjectTwo, body: SED.bodyTwo, recipient: [{id: PersonD.idOne, fullname: PersonD.fullname}] };
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assert.equal(automation.get('id'), AD.idOne);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  // actions
  assert.equal(automation.get('action').get('length'), 1);
  assert.equal(automation.get('action').objectAt(0).get('id'), AAD.idOne);
  // action-type
  assert.equal(automation.get('action').objectAt(0).get('type.id'), ATD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('type.key'), ATD.keyOne);
  // sendemail
  assert.equal(automation.get('action').objectAt(0).get('sendemail_fk'), SED.idTwo);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('id'), SED.idTwo);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('subject'), SED.subjectTwo);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('body'), SED.bodyTwo);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('recipient').objectAt(0).get('id'), PersonD.idOne);
  // assert.equal(automation.get('action').objectAt(0).get('sendemail').get('recipient').objectAt(0).get('fullname'), PersonD.fullname);
});

test('deserialize single - sendemail - different recipient', assert => {
  // pre-deserialize
  run(() => {
    store.push('automation-action', {id: AAD.idOne, sendemail_fk: SED.idOne});
    store.push('automation-join-action', {id: AJAD.idOne, automation_pk: AD.idOne, action_pk: AAD.idOne});
    store.push('sendemail', {id: SED.idOne, subject: SED.subjectOne, body: SED.bodyOne, generic_recipient_fks: [SEJRD.idOne], actions: [AAD.idOne]});
    store.push('person', {id: PersonD.idOne});
    store.push('generic-join-recipients', {id: SEJRD.idOne, generic_pk: SED.idOne, recipient_pk: PersonD.idOne});
  });
  assert.equal(automation.get('id'), AD.idOne);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(automation.get('action').objectAt(0).get('sendemail_fk'), SED.idOne);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('id'), SED.idOne);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('name'), SED.keyOne);
  // deserialize
  const json = AF.detail();
  json.actions[0].sendemail = { id: SED.idTwo, subject: SED.subjectTwo, body: SED.bodyTwo, recipient: [{id: PersonD.idTwo, fullname: PersonD.fullname}] };
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assert.equal(automation.get('id'), AD.idOne);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  // actions
  assert.equal(automation.get('action').get('length'), 1);
  assert.equal(automation.get('action').objectAt(0).get('id'), AAD.idOne);
  // action-type
  assert.equal(automation.get('action').objectAt(0).get('type.id'), ATD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('type.key'), ATD.keyOne);
  // sendemail
  assert.equal(automation.get('action').objectAt(0).get('sendemail_fk'), SED.idTwo);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('id'), SED.idTwo);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('subject'), SED.subjectTwo);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('body'), SED.bodyTwo);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('recipient').objectAt(0).get('id'), PersonD.idTwo);
  assert.equal(automation.get('action').objectAt(0).get('sendemail').get('recipient').objectAt(0).get('fullname'), PersonD.fullname);
});

// sendsms

test('deserialize single - sendsms - no existing', assert => {
  const json = AF.detail();
  json.actions[0].sendsms = { id: SMSD.idOne, message: SMSD.messageOne, recipient: [{id: PersonD.idOne, fullname: PersonD.fullname}] };
  assert.equal(automation.get('isNotDirtyOrRelatedNotDirty'), true);
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assert.equal(automation.get('isNotDirtyOrRelatedNotDirty'), true);
  assert.equal(automation.get('actionIsDirty'), false);
  assert.equal(automation.get('actionIsDirtyContainer'), false);
  assert.equal(automation.get('action').objectAt(0).get('sendsmsIsDirtyContainer'), false);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('isDirty'), false);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('isDirtyOrRelatedDirty'), false);
  assert.deepEqual(automation.get('action').objectAt(0).get('sendsms').get('generic_recipient_fks').length, 1);
  assert.deepEqual(automation.get('action').objectAt(0).get('sendsms').get('generic_recipient_ids').length, 1);
  assert.equal(automation.get('id'), AD.idOne);
  // actions
  assert.equal(automation.get('action').get('length'), 1);
  assert.equal(automation.get('action').objectAt(0).get('id'), AAD.idOne);
  // action-type
  assert.equal(automation.get('action').objectAt(0).get('type.id'), ATD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('type.key'), ATD.keyOne);
  // sendsms
  assert.equal(automation.get('action').objectAt(0).get('sendsms_fk'), SMSD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('id'), SMSD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('message'), SMSD.messageOne);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('recipient').get('length'), 1);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('recipient').objectAt(0).get('id'), PersonD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('recipient').objectAt(0).get('fullname'), PersonD.fullname);
});

test('deserialize single - sendsms- existing with same id', assert => {
  // pre-deserialize
  run(() => {
    store.push('automation-action', {id: AAD.idOne, sendsms_fk: SMSD.idOne });
    store.push('automation-join-action', {id: AJAD.idOne, automation_pk: AD.idOne, action_pk: AAD.idOne});
    store.push('sendsms', {id: SMSD.idOne, message: SMSD.messageOne, generic_recipient_fks: [SMSJRD.idOne], actions: [AAD.idOne]});
    store.push('person', {id: PersonD.idOne});
    store.push('generic-join-recipients', {id: SMSJRD.idOne, generic_pk: SMSD.idOne, recipient_pk: PersonD.idOne});
  });
  assert.equal(automation.get('id'), AD.idOne);
  assert.equal(automation.get('isNotDirtyOrRelatedNotDirty'), true);
  assert.equal(automation.get('actionIsDirty'), false);
  assert.equal(automation.get('actionIsDirtyContainer'), false);
  assert.equal(automation.get('action').objectAt(0).get('sendsmsIsDirtyContainer'), false);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('isDirty'), false);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('isDirtyOrRelatedDirty'), false);
  assert.equal(automation.get('action').objectAt(0).get('sendsms_fk'), SMSD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('id'), SMSD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('message'), SMSD.messageOne);
  // deserialize
  const json = AF.detail();
  json.actions[0].sendsms = { id: SMSD.idOne, message: SMSD.messageOne, recipient: [{id: PersonD.idOne, fullname: PersonD.fullname}] };
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assert.equal(automation.get('id'), AD.idOne);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  // actions
  assert.equal(automation.get('action').get('length'), 1);
  assert.equal(automation.get('action').objectAt(0).get('id'), AAD.idOne);
  // action-type
  assert.equal(automation.get('action').objectAt(0).get('type.id'), ATD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('type.key'), ATD.keyOne);
  // sendsms
  assert.equal(automation.get('action').objectAt(0).get('sendsms_fk'), SMSD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('id'), SMSD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('message'), SMSD.messageOne);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('recipient').objectAt(0).get('id'), PersonD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('recipient').objectAt(0).get('fullname'), PersonD.fullname);
});

test('deserialize single - sendsms- different id', assert => {
  // pre-deserialize
  run(() => {
    store.push('automation-action', {id: AAD.idOne, sendsms_fk: SMSD.idOne});
    store.push('automation-join-action', {id: AJAD.idOne, automation_pk: AD.idOne, action_pk: AAD.idOne});
    store.push('sendsms', {id: SMSD.idOne, message: SMSD.messageOne, generic_recipient_fks: [SMSJRD.idOne], actions: [AAD.idOne]});
    store.push('person', {id: PersonD.idOne});
    store.push('generic-join-recipients', {id: SMSJRD.idOne, generic_pk: SMSD.idOne, recipient_pk: PersonD.idOne});
  });
  assert.equal(automation.get('id'), AD.idOne);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(automation.get('action').objectAt(0).get('sendsms_fk'), SMSD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('id'), SMSD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('message'), SMSD.messageOne);
  // deserialize
  const json = AF.detail();
  json.actions[0].sendsms= { id: SMSD.idTwo, message: SMSD.messageTwo, recipient: [{id: PersonD.idTwo, fullname: PersonD.fullname}] };
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assert.equal(automation.get('id'), AD.idOne);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  // actions
  assert.equal(automation.get('action').get('length'), 1);
  assert.equal(automation.get('action').objectAt(0).get('id'), AAD.idOne);
  // action-type
  assert.equal(automation.get('action').objectAt(0).get('type.id'), ATD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('type.key'), ATD.keyOne);
  // sensms
  assert.equal(automation.get('action').objectAt(0).get('sendsms_fk'), SMSD.idTwo);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('id'), SMSD.idTwo);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('message'), SMSD.messageTwo);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('recipient').objectAt(0).get('id'), PersonD.idTwo);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('recipient').objectAt(0).get('fullname'), PersonD.fullname);
});

test('deserialize single - sendsms - different recipient', assert => {
  // pre-deserialize
  run(() => {
    store.push('automation-action', {id: AAD.idOne, sendsms_fk: SED.idOne});
    store.push('automation-join-action', {id: AJAD.idOne, automation_pk: AD.idOne, action_pk: AAD.idOne});
    store.push('sendsms', {id: SED.idOne, subject: SED.subjectOne, body: SED.bodyOne, generic_recipient_fks: [SEJRD.idOne], actions: [AAD.idOne]});
    store.push('person', {id: PersonD.idOne});
    store.push('generic-join-recipients', {id: SEJRD.idOne, generic_pk: SED.idOne, recipient_pk: PersonD.idOne});
  });
  assert.equal(automation.get('id'), AD.idOne);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(automation.get('action').objectAt(0).get('sendsms_fk'), SED.idOne);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('id'), SED.idOne);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('name'), SED.keyOne);
  // deserialize
  const json = AF.detail();
  json.actions[0].sendsms = { id: SED.idTwo, subject: SED.subjectTwo, body: SED.bodyTwo, recipient: [{id: PersonD.idTwo, fullname: PersonD.fullname}] };
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assert.equal(automation.get('id'), AD.idOne);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  // actions
  assert.equal(automation.get('action').get('length'), 1);
  assert.equal(automation.get('action').objectAt(0).get('id'), AAD.idOne);
  // action-type
  assert.equal(automation.get('action').objectAt(0).get('type.id'), ATD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('type.key'), ATD.keyOne);
  // sendsms
  assert.equal(automation.get('action').objectAt(0).get('sendsms_fk'), SED.idTwo);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('id'), SED.idTwo);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('subject'), SED.subjectTwo);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('body'), SED.bodyTwo);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('recipient').objectAt(0).get('id'), PersonD.idTwo);
  assert.equal(automation.get('action').objectAt(0).get('sendsms').get('recipient').objectAt(0).get('fullname'), PersonD.fullname);
});

// assignee
test('deserialize single - action has no assignee', assert => {
  let json = AF.detail();
  json.actions[0].assignee = undefined;
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assert.equal(automation.get('id'), AD.idOne);
  assert.equal(automation.get('action').get('length'), 1);
  assert.equal(automation.get('action').objectAt(0).get('assignee'), undefined);
});   

test('deserialize single - assignee - no existing', assert => {
  const json = AF.detail();
  json.actions[0].assignee = { id: PersonD.id, fullname: PersonD.fullname };
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assert.equal(automation.get('id'), AD.idOne);
  // actions
  assert.equal(automation.get('action').get('length'), 1);
  assert.equal(automation.get('action').objectAt(0).get('id'), AAD.idOne);
  // action-type
  assert.equal(automation.get('action').objectAt(0).get('type.id'), ATD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('type.key'), ATD.keyOne);
  // sendsms
  assert.equal(automation.get('action').objectAt(0).get('assignee_fk'), PersonD.id);
  assert.equal(automation.get('action').objectAt(0).get('assignee').get('id'), PersonD.id);
  assert.equal(automation.get('action').objectAt(0).get('assignee').get('fullname'), PersonD.fullname);
});

test('deserialize single - assignee- existing with same id', assert => {
  // pre-deserialize
  run(() => {
    store.push('automation-action', {id: AAD.idOne, assignee_fk: PersonD.id });
    store.push('automation-join-action', {id: AJAD.idOne, automation_pk: AD.idOne, action_pk: AAD.idOne});
    store.push('person', {id: PersonD.id, fullname: PersonD.fullname, actions: [AAD.idOne]});
  });
  assert.equal(automation.get('id'), AD.idOne);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(automation.get('action').objectAt(0).get('assignee_fk'), PersonD.id);
  assert.equal(automation.get('action').objectAt(0).get('assignee').get('id'), PersonD.id);
  assert.equal(automation.get('action').objectAt(0).get('assignee').get('fullname'), PersonD.fullname);
  // deserialize
  const json = AF.detail();
  json.actions[0].assignee = { id: PersonD.id, fullname: PersonD.fullname };
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assert.equal(automation.get('id'), AD.idOne);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  // actions
  assert.equal(automation.get('action').get('length'), 1);
  assert.equal(automation.get('action').objectAt(0).get('id'), AAD.idOne);
  // action-type
  assert.equal(automation.get('action').objectAt(0).get('type.id'), ATD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('type.key'), ATD.keyOne);
  // assignee
  assert.equal(automation.get('action').objectAt(0).get('assignee_fk'), PersonD.id);
  assert.equal(automation.get('action').objectAt(0).get('assignee').get('id'), PersonD.id);
  assert.equal(automation.get('action').objectAt(0).get('assignee').get('fullname'), PersonD.fullname);
});

test('deserialize single - assignee- different id', assert => {
  // pre-deserialize
  run(() => {
    store.push('automation-action', {id: AAD.idOne, assignee_fk: PersonD.id});
    store.push('automation-join-action', {id: AJAD.idOne, automation_pk: AD.idOne, action_pk: AAD.idOne});
    store.push('person', {id: PersonD.id, fullname: PersonD.fullname, actions: [AAD.idOne]});
  });
  assert.equal(automation.get('id'), AD.idOne);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(automation.get('action').objectAt(0).get('assignee_fk'), PersonD.id);
  assert.equal(automation.get('action').objectAt(0).get('assignee').get('id'), PersonD.id);
  assert.equal(automation.get('action').objectAt(0).get('assignee').get('fullname'), PersonD.fullname);
  // deserialize
  const json = AF.detail();
  json.actions[0].assignee = { id: PersonD.idTwo, fullname: PersonD.fullname };
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assert.equal(automation.get('id'), AD.idOne);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  // actions
  assert.equal(automation.get('action').get('length'), 1);
  assert.equal(automation.get('action').objectAt(0).get('id'), AAD.idOne);
  // action-type
  assert.equal(automation.get('action').objectAt(0).get('type.id'), ATD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('type.key'), ATD.keyOne);
  // sensms
  assert.equal(automation.get('action').objectAt(0).get('assignee_fk'), PersonD.idTwo);
  assert.equal(automation.get('action').objectAt(0).get('assignee').get('id'), PersonD.idTwo);
  assert.equal(automation.get('action').objectAt(0).get('assignee').get('fullname'), PersonD.fullname);
});

// test('existing automation w/ pf, and server returns no pf - want no pf b/c that is the most recent', assert => {
//   store.push('automation-join-pfilter', {id: AJFD.idOne, automation_pk: AD.idOne, pfilter_pk: PFD.idOne});
//   automation = store.push('automation', {id: AD.idOne, automation_pf_fks: [AJFD.idOne]});
//   store.push('pfilter', {id: PFD.idOne});
//   const pf = automation.get('pf');
//   assert.equal(pf.get('length'), 1);
//   let json = AF.detail();
//   json.filters = [];
//   run(() => {
//     deserializer.deserialize(json, AD.idOne);
//   });
//   automation = store.find('automation', AD.idOne);
//   assert.equal(automation.get('pf').get('length'), 0);
//   assert.ok(automation.get('isNotDirty'));
//   assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
// });

// pfilter
test('existing automation w/ pf, and server returns w/ 1 extra pf', assert => {
  store.push('automation-join-pfilter', {id: AJFD.idOne, automation_pk: AD.idOne, pfilter_pk: PFD.idOne});
  store.push('automation', {id: AD.idOne, automation_pf_fks: [AJFD.idOne]});
  store.push('pfilter', {id: PFD.idOne});
  let json = AF.detail();
  json.filters.push({id: PFD.unusedId, criteria: [{id: TD.priorityOneId}]});
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  automation = store.find('automation', AD.idOne);
  assert.equal(automation.get('pf').get('length'), 2);
  assert.ok(automation.get('isNotDirty'));
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
});

test('existing automation w/ pf and get same pf', assert => {
  store.push('automation-join-pfilter', {id: AJFD.idOne, automation_pk: AD.idOne, pfilter_pk: PFD.idOne});
  store.push('automation', {id: AD.idOne, automation_pf_fks: [AJFD.idOne]});
  store.push('pfilter', {id: PFD.idOne});
  const json = AF.detail();
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  automation = store.find('automation', AD.idOne);
  assert.equal(automation.get('pf').get('length'), 1);
  assert.ok(automation.get('isNotDirty'));
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
});

test('deserialize single - priority - no existing', assert => {
  const json = AF.detail();
  json.actions[0].priority = { id: TPD.idOne, name: TPD.nameOne };
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assert.equal(automation.get('id'), AD.idOne);
  // // actions
  assert.equal(automation.get('action').get('length'), 1);
  assert.equal(automation.get('action').objectAt(0).get('id'), AAD.idOne);
  // // action-type
  assert.equal(automation.get('action').objectAt(0).get('type.id'), ATD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('type.key'), ATD.keyOne);
  // // priority
  assert.equal(automation.get('action').objectAt(0).get('priority_fk'), TPD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('priority').get('id'), TPD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('priority').get('name'), TPD.nameOne);
});

test('deserialize single - priority - existing with same id', assert => {
  // pre-deserialize
  run(() => {
    store.push('automation-action', {id: AAD.idOne, priority_fk: TPD.idOne});
    store.push('automation-join-action', {id: AJAD.idOne, automation_pk: AD.idOne, action_pk: AAD.idOne});
    store.push('ticket-priority', {id: TPD.idOne, name: TPD.nameOne, actions: [AAD.idOne]});
  });
  assert.equal(automation.get('id'), AD.idOne);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(automation.get('action').objectAt(0).get('priority_fk'), TPD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('priority').get('id'), TPD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('priority').get('name'), TPD.nameOne);
  // deserialize
  const json = AF.detail();
  json.actions[0].priority = { id: TPD.idOne, name: TPD.nameOne };
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assert.equal(automation.get('id'), AD.idOne);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  // actions
  assert.equal(automation.get('action').get('length'), 1);
  assert.equal(automation.get('action').objectAt(0).get('id'), AAD.idOne);
  // action-type
  assert.equal(automation.get('action').objectAt(0).get('type.id'), ATD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('type.key'), ATD.keyOne);
  // priority
  assert.equal(automation.get('action').objectAt(0).get('priority_fk'), TPD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('priority').get('id'), TPD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('priority').get('name'), TPD.nameOne);
});

test('deserialize single - priority - different id', assert => {
  // pre-deserialize
  run(() => {
    store.push('automation-action', {id: AAD.idOne, priority_fk: TPD.idOne});
    store.push('automation-join-action', {id: AJAD.idOne, automation_pk: AD.idOne, action_pk: AAD.idOne});
    store.push('ticket-priority', {id: TPD.idOne, name: TPD.nameOne, actions: [AAD.idOne]});
  });
  assert.equal(automation.get('id'), AD.idOne);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(automation.get('action').objectAt(0).get('priority_fk'), TPD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('priority').get('id'), TPD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('priority').get('name'), TPD.keyOne);
  // deserialize
  const json = AF.detail();
  json.actions[0].priority = { id: TPD.idTwo, name: TPD.nameTwo };
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assert.equal(automation.get('id'), AD.idOne);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  // actions
  assert.equal(automation.get('action').get('length'), 1);
  assert.equal(automation.get('action').objectAt(0).get('id'), AAD.idOne);
  // action-type
  assert.equal(automation.get('action').objectAt(0).get('type.id'), ATD.idOne);
  assert.equal(automation.get('action').objectAt(0).get('type.key'), ATD.keyOne);
  // priority
  assert.equal(automation.get('action').objectAt(0).get('priority_fk'), TPD.idTwo);
  assert.equal(automation.get('action').objectAt(0).get('priority').get('id'), TPD.idTwo);
  assert.equal(automation.get('action').objectAt(0).get('priority').get('name'), TPD.nameTwo);
});

//criteria
test('existing pfilter w/ criteria, and server returns w/ 1 extra criteria', assert => {
  store.push('pfilter-join-criteria', {id: PJCD.idOne, pfilter_pk: PFD.idOne, criteria_pk: PFD.idOne});
  store.push('pfilter', {id: PFD.idOne, automation_pf_fks: [PJCD.idOne], pfilter_criteria_fks: [PJCD.idOne]});
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
  store.push('pfilter', {id: PFD.idOne, automation_pf_fks: [PJCD.idOne], pfilter_criteria_fks: [PJCD.idOne]});
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
  assert.equal(store.find('automation-list').get('length'), 10);
  automation = store.find('automation-list').objectAt(0);
  assert.equal(automation.get('id'), AD.idOne);
  assert.equal(automation.get('description'), AD.descriptionOne+'1');
  // events
  assert.equal(automation.get('events').length, 1);
  assert.equal(automation.get('events')[0].id, ED.idOne+'1');
  assert.equal(automation.get('events')[0].key, ED.keyOne+'1');
});

test('different automations that have different criteria but the same available filter type', assert => {
  const json = AF.detail(AD.idOne);
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assert.equal(automation.get('id'), AD.idOne);
  assert.equal(automation.get('pf').get('length'), 1);
  assert.equal(automation.get('pf').objectAt(0).get('id'), PFD.idOne);
  assert.equal(automation.get('pf').objectAt(0).get('source_id'), PFD.sourceIdOne);
  assert.equal(automation.get('pf').objectAt(0).get('criteria').get('length'), 1);
  assert.equal(automation.get('pf').objectAt(0).get('criteria').objectAt(0).get('id'), TD.priorityOneId);
  // two
  let json_two = AF.detail(AD.idTwo);
  json_two.filters[0].id = PFD.idTwo;
  json_two.filters[0].criteria = PFD.criteriaTwo;
  run(() => {
    deserializer.deserialize(json_two, AD.idOne);
  });
  let automation_two = store.find('automation', AD.idTwo);
  assert.equal(automation_two.get('id'), AD.idTwo);
  assert.equal(automation_two.get('pf').get('length'), 1);
  assert.equal(automation_two.get('pf').objectAt(0).get('id'), PFD.idTwo);
  assert.equal(automation_two.get('pf').objectAt(0).get('source_id'), PFD.sourceIdOne);
  assert.equal(automation_two.get('pf').objectAt(0).get('criteria').get('length'), 1);
  assert.equal(automation_two.get('pf').objectAt(0).get('criteria').objectAt(0).get('id'), LD.idOne);
});

test('2nd deserialize, criteria is a simple-store instance and not a POJO', assert => {
  // deserialize once
  const json = AF.detail();
  run(() => {
    deserializer.deserialize(json, AD.idOne);
  });
  assert.equal(automation.get('pf').objectAt(0).get('criteria').get('length'), 1);
  assert.equal(automation.get('pf').objectAt(0).get('criteria').objectAt(0).get('id'), TD.priorityOneId);
  // 2nd deserialize
  const json_two = AF.detail();
  run(() => {
    deserializer.deserialize(json_two, AD.idOne);
  });
  assert.equal(automation.get('pf').objectAt(0).get('criteria').get('length'), 1);
  assert.equal(automation.get('pf').objectAt(0).get('criteria').objectAt(0).get('id'), TD.priorityOneId);
});
