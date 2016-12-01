import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import AAD from 'bsrs-ember/vendor/defaults/automation-action';
import PD from 'bsrs-ember/vendor/defaults/person';
import ATD from 'bsrs-ember/vendor/defaults/automation-action-type';

let store;

moduleFor('validator:action-assignee', 'Unit | Validator | action-assignee', {
  needs: ['validator:messages'],
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:automation-action', 'model:automation-action-type', 'model:person', 
      'model:related-person', 'validator:presence','validator:unique-username', 'validator:length', 'validator:format', 
      'validator:has-many', 'validator:automation-action-type', 'validator:belongs-to', 'validator:action-ticket-request']);
  }
});

test('it works by ensuring one assignee is selected with a fullname', function(assert) {
  let action;
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, assignee_fk: PD.idOne});
    store.push('automation-action-type', {id: ATD.idOne, key: ATD.keyOne, actions: [AAD.idOne]});
    store.push('related-person', {id: PD.idOne, fullname: PD.fullname, actions: [AAD.idOne]});
  });
  assert.equal(action.get('assignee').get('id'), PD.idOne);
  const validator = this.subject();
  let bool = validator.validate('', '', action);
  assert.equal(bool, true);
  action.change_type({id: ATD.idTwo});
  bool = validator.validate('', '', action);
  assert.equal(bool, true);
  action.change_type({id: ATD.idOne});
  assert.equal(bool, true);
  run(() => {
    store.push('related-person', {id: PD.idOne, fullname: undefined});
  });
  bool = validator.validate('', '', action);
  assert.equal(bool, 'errors.automation.assignee');
});
