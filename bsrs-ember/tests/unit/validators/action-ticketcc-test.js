import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import AAD from 'bsrs-ember/vendor/defaults/automation-action';
import PD from 'bsrs-ember/vendor/defaults/person';
import ATD from 'bsrs-ember/vendor/defaults/automation-action-type';

var store;

moduleFor('validator:action-ticketcc', 'Unit | Validator | action-ticketcc', {
  needs: ['validator:messages'],
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:automation-action', 'model:automation-action-type', 'model:generic-join-recipients', 'model:generic-join-recipients', 'model:person', 'model:ticket-priority', 'model:ticket-status', 'model:sendemail', 'model:sendsms', 'service:person-current', 'service:translations-fetcher','model:action-join-person', 'service:i18n', 'validator:presence','validator:unique-username', 'validator:length', 'validator:format', 'validator:has-many', 'validator:automation-action-type', 'validator:belongs-to', 'validator:action-ticket-request']);
  }
});

test('it works', function(assert) {
  let action;
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, automation_action_ticketcc_fks: [10]});
    store.push('automation-action-type', {id: ATD.idSeven, key: ATD.keySeven, actions: [AAD.idOne]});
    store.push('action-join-person', {id: 10, automation_action_pk: AAD.idOne, person_pk: PD.idOne});
    store.push('person', {id: PD.idOne, fullname: PD.fullname});
  });
  assert.equal(action.get('ticketcc').get('length'), 1);
  const validator = this.subject();
  const bool = validator.validate('', '', action);
  assert.equal(bool, true);
  // remove ticketcc
  action.remove_ticketcc(PD.idOne);
  const err = validator.validate('', '', action);
  assert.equal(action.get('ticketcc').get('length'), 0);
  assert.equal(err, 'errors.automation.ticketcc');
});
