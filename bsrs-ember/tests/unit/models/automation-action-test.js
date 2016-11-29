import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import AD from 'bsrs-ember/vendor/defaults/automation';
import AAD from 'bsrs-ember/vendor/defaults/automation-action';
import ATD from 'bsrs-ember/vendor/defaults/automation-action-type';
import AJAD from 'bsrs-ember/vendor/defaults/automation-join-action';
import PD from 'bsrs-ember/vendor/defaults/person';
import TPD from 'bsrs-ember/vendor/defaults/ticket-priority';
import TSD from 'bsrs-ember/vendor/defaults/ticket-status';
import SED from 'bsrs-ember/vendor/defaults/sendemail';
import SMSD from 'bsrs-ember/vendor/defaults/sendsms';
import SMSJRD from 'bsrs-ember/vendor/defaults/generic-join-recipients';
import SEDJRD from 'bsrs-ember/vendor/defaults/generic-join-recipients';

import page from 'bsrs-ember/tests/pages/automation';

var store, action, actionType, type, assignee, priority, sendEmail, sendsms, ticketcc;

moduleFor('model:automation-action', 'Unit | Model |  automation-action', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:automation-action', 'model:automation-action-type', 'model:generic-join-recipients', 'model:generic-join-recipients', 'model:person', 'model:related-person', 'model:ticket-priority', 'model:ticket-status', 'model:sendemail', 'model:sendsms', 'service:person-current', 'service:translations-fetcher','model:action-join-person', 'service:i18n', 'validator:presence','validator:unique-username', 'validator:length', 'validator:format', 'validator:has-many', 'validator:automation-action-type', 'validator:belongs-to', 'validator:action-ticket-request', 'validator:action-ticketcc', 'validator:action-assignee']);
  }
});

// Action - sendsms

test('action has a related ticket sendsms', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, sendsms_fk: SMSD.idOne});
    store.push('sendsms', {id: SMSD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('sendsms').get('id'), SMSD.idOne);
});

test('change_sendsms and dirty tracking', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, sendsms_fk: SMSD.idOne});
    store.push('sendsms', {id: SMSD.idOne, name: SMSD.nameOne, actions: [AAD.idOne]});
  });
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(action.get('sendsmsIsNotDirty'));
  action.change_sendsms({id: SMSD.idTwo});
  assert.equal(action.get('sendsms').get('id'), SMSD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  assert.ok(action.get('sendsmsIsDirty'));
});

test('rollback sendsms will revert and reboot the dirty type to clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, sendsms_fk: SMSD.idOne});
    store.push('sendsms', {id: SMSD.idOne, name: SMSD.nameOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('sendsms').get('id'), SMSD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_sendsms({id: SMSD.idTwo});
  assert.equal(action.get('sendsms').get('id'), SMSD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.rollback();
  assert.equal(action.get('sendsms').get('id'), SMSD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated action sendsms to save model and make it clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, sendsms_fk: SMSD.idOne});
    store.push('sendsms', {id: SMSD.idOne, name: SMSD.nameOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('sendsms').get('id'), SMSD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_sendsms({id: SMSD.idTwo});
  assert.equal(action.get('sendsms').get('id'), SMSD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.saveRelated();
  assert.equal(action.get('sendsms').get('id'), SMSD.idTwo);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

test('action is dirty if recipients change on sendsms model', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, sendsms_fk: SMSD.idOne});
    sendsms = store.push('sendsms', {id: SMSD.idOne, name: SMSD.nameOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('sendsms').get('id'), SMSD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  sendsms.add_recipient({id: PD.idOne});
  assert.equal(sendsms.get('recipient').objectAt(0).get('id'), PD.idOne);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  assert.ok(sendsms.get('isDirtyOrRelatedDirty'));
  // saveRelated from the point of the action should clean all
  action.saveRelated();
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

//TODO: add dirty if none exists before


// Action - sendemail

test('action has a related ticket sendemail', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, sendemail_fk: SED.idOne});
    store.push('sendemail', {id: SED.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('sendemail').get('id'), SED.idOne);
});

test('change_sendemail and dirty tracking', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, sendemail_fk: SED.idOne});
    store.push('sendemail', {id: SED.idOne, name: SED.nameOne, actions: [AAD.idOne]});
  });
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(action.get('sendemailIsNotDirty'));
  action.change_sendemail({id: SED.idTwo});
  assert.equal(action.get('sendemail').get('id'), SED.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  assert.ok(action.get('sendemailIsDirty'));
});

test('rollback sendemail will revert and reboot the dirty type to clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, sendemail_fk: SED.idOne});
    store.push('sendemail', {id: SED.idOne, name: SED.nameOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('sendemail').get('id'), SED.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_sendemail({id: SED.idTwo});
  assert.equal(action.get('sendemail').get('id'), SED.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.rollback();
  assert.equal(action.get('sendemail').get('id'), SED.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated action sendemail to save model and make it clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, sendemail_fk: SED.idOne});
    store.push('sendemail', {id: SED.idOne, name: SED.nameOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('sendemail').get('id'), SED.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_sendemail({id: SED.idTwo});
  assert.equal(action.get('sendemail').get('id'), SED.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.saveRelated();
  assert.equal(action.get('sendemail').get('id'), SED.idTwo);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

test('action is dirty if recipients change on sendemail model', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, sendemail_fk: SED.idOne});
    sendEmail = store.push('sendemail', {id: SED.idOne, name: SED.nameOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('sendemail').get('id'), SED.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  sendEmail.add_recipient({id: PD.idOne});
  assert.equal(sendEmail.get('recipient').objectAt(0).get('id'), PD.idOne);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  assert.ok(sendEmail.get('isDirtyOrRelatedDirty'));
  // saveRelated from the point of the action should clean all
  action.saveRelated();
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

// Action - Ticket status

test('action has a related ticket status', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, status_fk: TSD.idOne});
    store.push('ticket-status', {id: TSD.idOne, name: TSD.nameOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('status').get('id'), TSD.idOne);
  assert.equal(action.get('status.name'), TSD.nameOne);
});

test('change_status and dirty tracking', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, status_fk: TSD.idOne});
    store.push('ticket-status', {id: TSD.idOne, name: TSD.nameOne, actions: [AAD.idOne]});
  });
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(action.get('statusIsNotDirty'));
  action.change_status({id: TSD.idTwo});
  assert.equal(action.get('status').get('id'), TSD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  assert.ok(action.get('statusIsDirty'));
});

test('rollback status will revert and reboot the dirty type to clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, status_fk: TSD.idOne});
    store.push('ticket-status', {id: TSD.idOne, name: TSD.nameOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('status').get('id'), TSD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_status({id: TSD.idTwo});
  assert.equal(action.get('status').get('id'), TSD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.rollback();
  assert.equal(action.get('status').get('id'), TSD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated action status to save model and make it clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, status_fk: TSD.idOne});
    store.push('ticket-status', {id: TSD.idOne, name: TSD.nameOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('status').get('id'), TSD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_status({id: TSD.idTwo});
  assert.equal(action.get('status').get('id'), TSD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.saveRelated();
  assert.equal(action.get('status').get('id'), TSD.idTwo);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

// Action - ActionType

test('action has a related action type', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, type_fk: ATD.idOne});
    store.push('automation-action-type', {id: ATD.idOne, key: ATD.keyOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('type').get('id'), ATD.idOne);
  assert.equal(action.get('type.key'), ATD.keyOne);
});

test('change_type and dirty tracking', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, type_fk: ATD.idOne});
    store.push('automation-action-type', {id: ATD.idOne, actions: [AAD.idOne]});
  });
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(action.get('typeIsNotDirty'));
  action.change_type({id: ATD.idTwo});
  assert.equal(action.get('type').get('id'), ATD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  assert.ok(action.get('typeIsDirty'));
});

test('rollback type will revert and reboot the dirty type to clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, type_fk: ATD.idOne});
    store.push('automation-action-type', {id: ATD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('type').get('id'), ATD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_type({id: ATD.idTwo});
  assert.equal(action.get('type').get('id'), ATD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.rollback();
  assert.equal(action.get('type').get('id'), ATD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated action type to save model and make it clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, type_fk: ATD.idOne});
    store.push('automation-action-type', {id: ATD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('type').get('id'), ATD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_type({id: ATD.idTwo});
  assert.equal(action.get('type').get('id'), ATD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.saveRelated();
  assert.equal(action.get('type').get('id'), ATD.idTwo);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

test('remove_type - removes the action type from the action', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, type_fk: ATD.idOne});
    actionType = store.push('automation-action-type', {id: ATD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('type').get('id'), ATD.idOne);
  action.remove_type(ATD.idOne);
  assert.deepEqual(actionType.get('actions'), []);
  assert.equal(action.get('type'), undefined);
});

// Action - ticketcc
test('automation action has a related ticketcc', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, automation_action_ticketcc_fks: [10]});
    store.push('action-join-person', {id: 10, automation_action_pk: AAD.idOne, related_person_pk: PD.idOne});
    store.push('related-person', {id: PD.idOne, fullname: PD.fullname});
  });
  assert.equal(action.get('ticketcc').get('length'), 1);
  assert.equal(action.get('ticketcc').objectAt(0).get('id'), PD.idOne);
  assert.equal(action.get('ticketcc').objectAt(0).get('fullname'), PD.fullname);
});

test('add_ticketcc and dirty tracking', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, automation_action_ticketcc_fks: [10]});
    store.push('action-join-person', {id: 10, automation_action_pk: AAD.idOne, related_person_pk: PD.idOne});
    store.push('related-person', {id: PD.idOne, fullname: PD.fullname});
  });
  assert.equal(action.get('ticketcc').get('length'), 1);
  assert.equal(action.get('isNotDirtyOrRelatedNotDirty'), true);
  assert.equal(action.get('ticketccIsNotDirty'), true);
  action.add_ticketcc({id: PD.idTwo});
  assert.equal(action.get('ticketcc').get('length'), 2);
  assert.equal(action.get('isNotDirtyOrRelatedNotDirty'), false);
  assert.equal(action.get('ticketccIsNotDirty'), false);
});

test('ticketcc property will update when the m2m array suddenly removes the person', (assert) => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, automation_action_cc_fks: [10]});
    store.push('action-join-person', {id: 10, automation_action_pk: AAD.idOne, related_person_pk: PD.idOne});
    store.push('related-person', {id: PD.idOne, fullname: PD.fullname});
  });
  assert.equal(action.get('ticketcc').get('length'), 1);
  action.remove_ticketcc(PD.idOne);
  assert.equal(action.get('ticketcc').get('length'), 0);
});

test('rollback cc will revert and reboot the dirty ticketcc to clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, automation_action_ticketcc_fks: [10]});
    store.push('action-join-person', {id: 10, automation_action_pk: AAD.idOne, related_person_pk: PD.idOne});
    store.push('related-person', {id: PD.idOne, fullname: PD.fullname});
  });
  assert.ok(action.get('ticketcc').objectAt(0).get('id'), PD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.add_ticketcc({id: PD.idTwo});
  assert.ok(action.get('ticketcc').objectAt(0).get('id'), PD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.rollback();
  assert.equal(action.get('ticketcc').objectAt(0).get('id'), PD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated for ticketcc to save model and make it clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, automation_action_ticketcc_fks: [10]});
    store.push('action-join-person', {id: 10, automation_action_pk: AAD.idOne, related_person_pk: PD.idOne});
    store.push('related-person', {id: PD.idOne, fullname: PD.fullname});
  });
  assert.ok(action.get('ticketcc').objectAt(0).get('id'), PD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.add_ticketcc({id: PD.idTwo});
  assert.ok(action.get('ticketcc').objectAt(0).get('id'), PD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.saveRelated();
  assert.equal(action.get('ticketcc').objectAt(0).get('id'), PD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

// Action - Assignee

test('action has a related assignee', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, type_fk: ATD.idOne});
    store.push('related-person', {id: PD.idOne, fullname: PD.fullname, actions: [AAD.idOne]});
  });
  assert.equal(action.get('assignee').get('id'), PD.idOne);
  assert.equal(action.get('assignee.fullname'), PD.fullname);
});

test('change_assignee and dirty tracking', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne});
    assignee = store.push('related-person', {id: PD.idOne});
  });
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(action.get('assigneeIsNotDirty'));
  action.change_assignee({id: PD.idOne});
  assert.equal(action.get('assignee').get('id'), PD.idOne);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  assert.ok(action.get('assigneeIsDirty'));
  assert.ok(assignee.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback assignee will revert and reboot the dirty assignee to clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, assignee_fk: PD.idOne});
    store.push('related-person', {id: PD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('assignee').get('id'), PD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_assignee({id: PD.idTwo});
  assert.equal(action.get('assignee').get('id'), PD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.rollback();
  assert.equal(action.get('assignee').get('id'), PD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated for assignee to save model and make it clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, assignee_fk: PD.idOne});
    store.push('related-person', {id: PD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('assignee').get('id'), PD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_assignee({id: PD.idTwo});
  assert.equal(action.get('assignee').get('id'), PD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.saveRelated();
  assert.equal(action.get('assignee').get('id'), PD.idTwo);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

// validations

test('type validation - action must have a type to be valid', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, foo: 'bar'});
  });
  assert.equal(action.get('validations.isValid'), false);
  action.change_type({id: ATD.idOne});
  assert.equal(action.get('validations.isValid'), true);
});

test('type validation - assignee - if the type is assignee, a related assignee is required', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne});
  });
  assert.equal(action.get('validations.isValid'), false);
  action.change_type({id: ATD.idOne, key: ATD.keyOne});
  assert.equal(action.get('type').get('id'), ATD.idOne);
  assert.equal(action.get('validations.isValid'), false);
  action.change_assignee({id: PD.idOne, fullname: ''});
  assert.equal(action.get('validations.isValid'), false);
  action.change_assignee({id: PD.idOne, fullname: 'wat'});
  assert.equal(action.get('validations.isValid'), true);
});

test('type validation - priority - if the type is priority, a related priority is required', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne});
  });
  assert.equal(action.get('validations.isValid'), false);
  action.change_type({id: ATD.idTwo, key: ATD.keyTwo});
  action.change_priority({id: TPD.idOne});
  assert.equal(action.get('validations.isValid'), true);
});

test('type validation - sendemail - if the type is sendemail, a related sendemail is required', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne});
  });
  assert.equal(action.get('validations.isValid'), false);
  action.change_type({id: ATD.idTwo, key: ATD.keyFour});
  action.change_sendemail({id: SED.idOne});
  assert.equal(action.get('validations.isValid'), false);   
  const sendemail = store.find('sendemail', SED.idOne);
  sendemail.set('body', 'watter');
  assert.equal(action.get('validations.isValid'), false);   
  sendemail.set('subject', 'watter');
  assert.equal(action.get('validations.isValid'), false);   
  sendemail.add_recipient({id: PD.idOne});
  assert.equal(action.get('validations.isValid'), true);   
});

test('type validation -sendsms - if the tyoe is sendsms, a related sendsms is required', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne});
  });
  assert.equal(action.get('validations.isValid'), false);
  action.change_type({id: ATD.idTwo, key: ATD.keyFive});
  action.change_sendsms({id: SMSD.idOne});
  assert.equal(action.get('validations.isValid'), false);   
  const sendsms = store.find('sendsms', SMSD.idOne);
  sendsms.set('body', 'body section');
  assert.equal(action.get('validations.isValid'), false);   
  sendsms.add_recipient({id: PD.idOne});
  assert.equal(action.get('validations.isValid'), true);   
});

test('type validation - ticketcc - if the type is ticketcc, a related ticketcc is required', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne});
  });
  assert.equal(action.get('validations.isValid'), false);
  action.change_type({id: ATD.idOne, key: ATD.keySeven});
  assert.equal(action.get('validations.isValid'), false);
  action.add_ticketcc({id: PD.idOne, fullname: ''});
  assert.equal(action.get('validations.isValid'), false);
  action.add_ticketcc({id: PD.idOne, fullname: 'wat'});
  assert.equal(action.get('validations.isValid'), true);
});

// Action - sendemail

test('action has a related priority', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, priority_fk: ATD.idOne});
    store.push('ticket-priority', {id: TPD.idOne, key: TPD.keyOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('priority').get('id'), TPD.idOne);
  assert.equal(action.get('priority.key'), TPD.keyOne);
});

test('change_priority and dirty tracking', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne});
    priority = store.push('ticket-priority', {id: TPD.idOne});
  });
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(action.get('priorityIsNotDirty'));
  action.change_priority({id: TPD.idOne});
  assert.equal(action.get('priority').get('id'), TPD.idOne);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  assert.ok(action.get('priorityIsDirty'));
});

test('rollback priority will revert and reboot the dirty priority to clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, priority_fk: TPD.idOne});
    store.push('ticket-priority', {id: TPD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('priority').get('id'), TPD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_priority({id: TPD.idTwo});
  assert.equal(action.get('priority').get('id'), TPD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.rollback();
  assert.equal(action.get('priority').get('id'), TPD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated for priority to save model and make it clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, priority_fk: TPD.idOne});
    store.push('ticket-priority', {id: TPD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('priority').get('id'), TPD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_priority({id: TPD.idTwo});
  assert.equal(action.get('priority').get('id'), TPD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.saveRelated();
  assert.equal(action.get('priority').get('id'), TPD.idTwo);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

test('serialize - should only send the content fields that are relevant based on the type', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, request: AAD.requestOne});
    store.push('generic-join-recipients', {id: SEDJRD.idOne, generic_pk: SED.idOne, recipient_pk: PD.idOne});
    store.push('generic-join-recipients', {id: SMSJRD.idTwo, generic_pk: SMSD.idOne, recipient_pk: PD.idTwo});
    store.push('related-person', {id: PD.idOne, type: 'person'});
    store.push('related-person', {id: PD.idTwo, type: 'role'});
    store.push('sendemail', {id: SED.idOne, subject: SED.subjectTwo, body: SED.bodyTwo,  generic_recipient_fks: [SEDJRD.idOne], actions: [AAD.idOne]});
    store.push('sendsms', {id: SMSD.idOne, body: SMSD.bodyTwo, generic_recipient_fks: [SMSJRD.idTwo], actions: [AAD.idOne]});
  });
  action.change_assignee({id: PD.idOne});
  action.change_priority({id: TPD.idOne});
  action.change_status({id: TSD.idOne});
  action.change_sendemail({id: SED.idOne});
  action.change_sendsms({id: SMSD.idOne});

  action.change_type({id: ATD.idOne, key: ATD.keyOne});
  assert.deepEqual(action.serialize().content, {assignee: PD.idOne});
  action.change_type({id: ATD.idTwo, key: ATD.keyTwo});
  assert.deepEqual(action.serialize().content, {priority: TPD.idOne});
  action.change_type({id: ATD.idThree, key: ATD.keyThree});
  assert.deepEqual(action.serialize().content, {status: TSD.idOne});
  action.change_type({id: ATD.idFour, key: ATD.keyFour});
  assert.equal(action.get('sendemail').get('recipient.length'), 1);
  assert.deepEqual(action.serialize().content, { body: SED.bodyTwo, recipients: [{id: PD.idOne, type: 'person'}], subject: SED.subjectTwo });
  action.change_type({id: ATD.idFive, key: ATD.keyFive});
  assert.equal(action.get('sendsms').get('id'), SMSD.idOne);
  assert.deepEqual(action.get('sendsms').get('recipient').mapBy('id'), [PD.idTwo]);
  assert.deepEqual(action.serialize().content, { body: SMSD.bodyTwo, recipients: [{id: PD.idTwo, type: 'role'}] });
  action.change_type({id: ATD.idSix, key: ATD.keySix});
  assert.equal(action.get('type').get('key'), ATD.keySix);
  assert.deepEqual(action.serialize().content, {request: AAD.requestOne});
});

test('remove_related will remove the current belongs_to or m2m', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, priority_fk: TPD.idOne, type_fk: ATD.idTwo});
    store.push('automation-action-type', {id: ATD.idTwo, key: ATD.keyTwo, actions: [AAD.idOne]});
    store.push('ticket-priority', {id: TPD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('priority').get('id'), TPD.idOne);
  assert.equal(action.get('type').get('key'), ATD.keyTwo);
  action.remove_related();
  assert.equal(action.get('priority'), undefined);
  assert.equal(action.get('priority'), undefined);
  assert.equal(action.get('priority_fk'), undefined);

  action.remove_type(ATD.idTwo);
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, status_fk: TSD.idOne, type_fk: ATD.idThree});
    store.push('automation-action-type', {id: ATD.idThree, key: ATD.keyThree, actions: [AAD.idOne]});
    store.push('ticket-status', {id: TSD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('status').get('id'), TSD.idOne);
  assert.equal(action.get('type').get('key'), ATD.keyThree);
  action.remove_related();
  assert.equal(action.get('status'), undefined);
  assert.equal(action.get('status_fk'), undefined);


  action.remove_type(ATD.idThree);
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, assignee_fk: PD.idOne, type_fk: ATD.idOne});
    store.push('automation-action-type', {id: ATD.idOne, key: ATD.keyOne, actions: [AAD.idOne]});
    store.push('related-person', {id: PD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('assignee').get('id'), PD.idOne);
  assert.equal(action.get('type').get('key'), ATD.keyOne);
  action.remove_related();
  assert.equal(action.get('assignee'), undefined);
  assert.equal(action.get('assignee_fk'), undefined);
  
  action.remove_type(ATD.idOne);
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, sendsms_fk: SMSD.idOne, type_fk: ATD.idFive});
    store.push('automation-action-type', {id: ATD.idFive, key: ATD.keyFive, actions: [AAD.idOne]});
    store.push('sendsms', {id: SMSD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('sendsms').get('id'), SMSD.idOne);
  assert.equal(action.get('type').get('key'), ATD.keyFive);
  action.remove_related();
  assert.equal(action.get('sendsms'), undefined);
  assert.equal(action.get('sendsms_fk'), undefined);

  action.remove_type(ATD.idFive);
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, sendemail_fk: SED.idOne, type_fk: ATD.idFour});
    store.push('automation-action-type', {id: ATD.idFour, key: ATD.keyFour, actions: [AAD.idOne]});
    store.push('sendemail', {id: SED.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('sendemail').get('id'), SED.idOne);
  assert.equal(action.get('type').get('key'), ATD.keyFour);
  action.remove_related();
  assert.equal(action.get('sendemail'), undefined);
  assert.equal(action.get('sendemail_fk'), undefined);

  action.remove_type(ATD.idFour);
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, automation_action_ticketcc_fks: [10], type_fk: ATD.idSeven});
    store.push('automation-action-type', {id: ATD.idSeven, key: ATD.keySeven, actions: [AAD.idOne]});
    store.push('action-join-person', {id: 10, automation_action_pk: AAD.idOne, related_person_pk: PD.idOne});
    store.push('related-person', {id: PD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('ticketcc').objectAt(0).get('id'), PD.idOne);
  assert.equal(action.get('type').get('key'), ATD.keySeven);
  action.remove_related();
  assert.equal(action.get('ticketcc').get('length'), 0);
});
