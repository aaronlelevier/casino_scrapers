import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import AAD from 'bsrs-ember/vendor/defaults/automation-action';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import ATD from 'bsrs-ember/vendor/defaults/automation-action-type';

const PD = PERSON_DEFAULTS.defaults();

let store;

moduleFor('validator:action-ticketcc', 'Unit | Validator | action-ticketcc', {
  needs: ['validator:messages'],
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:automation-action', 'model:automation-action-type', 
      'model:generic-join-recipients', 'model:generic-join-recipients', 'model:related-person',
      'model:action-join-person', 'validator:presence','validator:unique-username', 'validator:length', 
      'validator:format', 'validator:has-many', 'validator:automation-action-type', 'validator:belongs-to']);
  }
});

test('it works by ensuring that one ticketcc is selected', function(assert) {
  let action;
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, automation_action_ticketcc_fks: [10]});
    store.push('automation-action-type', {id: ATD.idSeven, key: ATD.keySeven, actions: [AAD.idOne]});
    store.push('action-join-person', {id: 10, automation_action_pk: AAD.idOne, related_person_pk: PD.idOne});
    store.push('related-person', {id: PD.idOne, fullname: PD.fullname});
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
