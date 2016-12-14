import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import SMSD from 'bsrs-ember/vendor/defaults/sendsms';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import SMSJRD from 'bsrs-ember/vendor/defaults/generic-join-recipients';

const PD = PERSON_DEFAULTS.defaults();

let store, sendSms;

moduleFor('model:sendsms', 'Unit | Model | sendSms', {
  needs: ['validator:presence', 'validator:unique-username', 'validator:length', 'validator:format', 'validator:has-many'],
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:sendsms', 'model:generic-join-recipients', 'model:person', 'model:related-person', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
    run(() => {
      sendSms = store.push('sendsms', {id: SMSD.idOne});
    });
  }
});

test('dirty test | body', assert => {
  assert.equal(sendSms.get('isDirty'), false);
  assert.equal(sendSms.get('isDirtyOrRelatedDirty'), false);
  sendSms.set('body', 'wat');
  assert.equal(sendSms.get('isDirty'), true);
  assert.equal(sendSms.get('isDirtyOrRelatedDirty'), true);
  sendSms.set('body', '');
  assert.equal(sendSms.get('isDirty'), false);
  assert.equal(sendSms.get('isDirtyOrRelatedDirty'), false);
});

/* sendSms & recipients: Start */

test('recipient property should return all associated recipients, and also confirm related and join model attr values', (assert) => {
  run(() => {
    store.push('generic-join-recipients', {id: SMSJRD.idOne, generic_pk: SMSD.idOne, recipient_pk: PD.idOne});
    sendSms = store.push('sendsms', {id: SMSD.idOne, generic_recipient_fks: [SMSJRD.idOne]});
    store.push('related-person', {id: PD.idOne});
  });
  let recipient = sendSms.get('recipient');
  assert.equal(recipient.get('length'), 1);
  assert.deepEqual(sendSms.get('recipient_ids'), [PD.idOne]);
  assert.deepEqual(sendSms.get('generic_recipient_ids'), [SMSJRD.idOne]);
  assert.equal(recipient.objectAt(0).get('id'), PD.idOne);
  assert.ok(sendSms.get('isNotDirtyOrRelatedNotDirty'));
});

test('remove_recipient - will remove join model and mark model as dirty', (assert) => {
  run(() => {
    store.push('generic-join-recipients', {id: SMSJRD.idOne, generic_pk: SMSD.idOne, recipient_pk: PD.idOne});
    store.push('related-person', {id: PD.idOne});
    sendSms = store.push('sendsms', {id: SMSD.idOne, generic_recipient_fks: [SMSJRD.idOne]});
  });
  assert.equal(sendSms.get('recipient').get('length'), 1);
  assert.equal(sendSms.get('generic_recipient_ids').length, 1);
  assert.equal(sendSms.get('generic_recipient_fks').length, 1);
  assert.ok(sendSms.get('recipientIsNotDirty'));
  assert.ok(sendSms.get('isNotDirtyOrRelatedNotDirty'));
  sendSms.remove_recipient(PD.idOne);
  assert.equal(sendSms.get('recipient').get('length'), 0);
  assert.equal(sendSms.get('generic_recipient_ids').length, 0);
  assert.equal(sendSms.get('generic_recipient_fks').length, 1);
  assert.ok(sendSms.get('recipientIsDirty'));
  assert.ok(sendSms.get('isDirtyOrRelatedDirty'));
});

test('add_recipient - will create join model and mark model dirty', (assert) => {
  run(() => {
    store.push('generic-join-recipients', {id: SMSJRD.idOne, generic_pk: SMSD.idOne, recipient_pk: PD.idOne});
    store.push('related-person', {id: PD.idOne});
    sendSms = store.push('sendsms', {id: SMSD.idOne, generic_recipient_fks: [SMSJRD.idOne]});
  });
  assert.equal(sendSms.get('recipient').get('length'), 1);
  assert.equal(sendSms.get('generic_recipient_ids').length, 1);
  assert.equal(sendSms.get('generic_recipient_fks').length, 1);
  assert.deepEqual(sendSms.get('recipient_ids'), [PD.idOne]);
  assert.ok(sendSms.get('recipientIsNotDirty'));
  assert.ok(sendSms.get('isNotDirtyOrRelatedNotDirty'));
  sendSms.add_recipient({id: PD.idTwo});
  assert.equal(sendSms.get('recipient').get('length'), 2);
  assert.equal(sendSms.get('generic_recipient_ids').length, 2);
  assert.equal(sendSms.get('generic_recipient_fks').length, 1);
  assert.deepEqual(sendSms.get('recipient_ids'), [PD.idOne, PD.idTwo]);
  assert.equal(sendSms.get('recipient').objectAt(0).get('id'), PD.idOne);
  assert.equal(sendSms.get('recipient').objectAt(1).get('id'), PD.idTwo);
});

test('rollback - recipient', assert => {
  assert.equal(sendSms.get('recipient').get('length'), 0);
  assert.ok(sendSms.get('isNotDirtyOrRelatedNotDirty'));
  sendSms.add_recipient({id: PD.idOne});
  assert.equal(sendSms.get('recipient').get('length'), 1);
  assert.ok(sendSms.get('isDirtyOrRelatedDirty'));
  sendSms.rollback();
  assert.equal(sendSms.get('recipient').get('length'), 0);
  assert.ok(sendSms.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback - primitive', assert => {
  assert.equal(sendSms.get('body'), undefined);
  assert.equal(sendSms.get('isDirty'), false);
  assert.equal(sendSms.get('isDirtyOrRelatedDirty'), false);
  sendSms.set('body', 'wat');
  assert.equal(sendSms.get('isDirty'), true);
  assert.equal(sendSms.get('isDirtyOrRelatedDirty'), true);
  sendSms.rollback();
  assert.equal(sendSms.get('body'), undefined);
  assert.equal(sendSms.get('isDirty'), false);
  assert.equal(sendSms.get('isDirtyOrRelatedDirty'), false);
});

test('saveRelated - saveRelated should persist the changed recipient and model should be clean', (assert) => {
  assert.equal(sendSms.get('recipient').get('length'), 0);
  assert.ok(sendSms.get('isNotDirtyOrRelatedNotDirty'));
  sendSms.add_recipient({id: PD.idOne});
  assert.equal(sendSms.get('recipient').get('length'), 1);
  assert.ok(sendSms.get('recipientIsDirty'));
  assert.ok(sendSms.get('isDirtyOrRelatedDirty'));
  sendSms.saveRelated();
  assert.equal(sendSms.get('recipient').get('length'), 1);
  assert.ok(sendSms.get('recipientIsNotDirty'));
  assert.ok(sendSms.get('isNotDirtyOrRelatedNotDirty'));
});

/* sendSms & recipients: End */

