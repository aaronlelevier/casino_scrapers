import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import AD from 'bsrs-ember/vendor/defaults/automation';
import AAD from 'bsrs-ember/vendor/defaults/automation-action';
import ATD from 'bsrs-ember/vendor/defaults/automation-action-type';
import AJAD from 'bsrs-ember/vendor/defaults/automation-join-action';
import TPD from 'bsrs-ember/vendor/defaults/ticket-priority';
import TSD from 'bsrs-ember/vendor/defaults/ticket-status';
import repository from 'bsrs-ember/tests/helpers/repository';
import { clickTrigger, nativeMouseUp } from 'bsrs-ember/tests/helpers/ember-power-select';
import { ACTION_ASSIGNEE, ACTION_PRIORITY, ACTION_STATUS, ACTION_TICKET_REQUEST, ACTION_TICKET_CC } from 'bsrs-ember/models/automation-action';

let automation, action;

moduleForComponent('automations/action-section', 'Integration | Component | automations/action section', {
  integration: true,
  beforeEach() {
    this.store = module_registry(this.container, this.registry);
    run(() => {
      automation = this.store.push('automation', {id: AD.idOne, automation_action_fks: [AAD.idOne]});
      this.store.push('automation-join-action', {id: AJAD.idOne, automation_pk: AD.idOne, action_pk: AAD.idOne});
      action = this.store.push('automation-action', {id: AAD.idOne, priority_fk: ATD.idOne, type_fk: ATD.idOne});
      action.change_type({id: ATD.idTwo, key: ATD.keyTwo});
      this.store.push('ticket-priority', {id: TPD.idOne, name: TPD.nameOne, actions: [AAD.idOne]});
    });
    const automation_repo = repository.initialize(this.container, this.registry, 'automation');
    automation_repo.getActionTypes = function() {
      return new Ember.RSVP.Promise((resolve, reject) => {
        resolve({ results: [
          { id: ATD.idOne, key: ATD.keyOne },
          { id: ATD.idTwo, key: ATD.keyTwo },
          { id: ATD.idThree, key: ATD.keyThree },
          { id: ATD.idFour, key: ATD.keyFour },
          { id: ATD.idFive, key: ATD.keyFive },
          { id: ATD.idSix, key: ATD.keySix },
          { id: ATD.idSeven, key: ATD.keySeven },
        ]});
      });
    };
  }
});

test('if automation action priority has been selected then its removed from lists of action types', function(assert) {
  assert.expect(8);
  this.model = automation;
  this.render(hbs`{{automations/action-section model=model}}`);
  assert.equal(this.$('.t-add-action-btn').text().trim(), 'admin.automation.action.add');
  clickTrigger('.t-automation-action-type-select');  
  const options = document.getElementsByClassName('ember-power-select-option');
  Array.from(options).forEach((_elem, index) => {
    assert.notOk(options[index].innerText.includes(ACTION_PRIORITY));
  });
  assert.equal(Ember.$('.ember-power-select-option').length, 6);
});

test('if automation action status has been selected then its removed from lists of action types', function(assert) {
  assert.expect(7);
  action.change_type({id: ATD.idThree, key: ATD.keyThree});
  this.model = automation;
  this.render(hbs`{{automations/action-section model=model}}`);
  this.$('.t-add-action-btn').click();
  clickTrigger('.t-automation-action-type-select:eq(1)');  
  const options = document.getElementsByClassName('ember-power-select-option');
  Array.from(options).forEach((_elem, index) => {
    assert.notOk(options[index].innerText.includes(ACTION_STATUS));
  });
  assert.equal(Ember.$('.ember-power-select-option').length, 6);
});

test('if automation action assignee has been selected then its removed from lists of action types', function(assert) {
  assert.expect(7);
  action.change_type({id: ATD.idOne, key: ATD.keyOne});
  this.model = automation;
  this.render(hbs`{{automations/action-section model=model}}`);
  this.$('.t-add-action-btn').click();
  clickTrigger('.t-automation-action-type-select:eq(1)');  
  const options = document.getElementsByClassName('ember-power-select-option');
  Array.from(options).forEach((_elem, index) => {
    assert.notOk(options[index].innerText.includes(ACTION_ASSIGNEE));
  });
  assert.equal(Ember.$('.ember-power-select-option').length, 6);
});

test('if automation action ticket request has been selected then its removed from lists of action types', function(assert) {
  assert.expect(7);
  action.change_type({id: ATD.idSix, key: ATD.keySix});
  this.model = automation;
  this.render(hbs`{{automations/action-section model=model}}`);
  this.$('.t-add-action-btn').click();
  clickTrigger('.t-automation-action-type-select:eq(1)');  
  const options = document.getElementsByClassName('ember-power-select-option');
  Array.from(options).forEach((_elem, index) => {
    assert.notOk(options[index].innerText.includes(ACTION_TICKET_REQUEST));
  });
  assert.equal(Ember.$('.ember-power-select-option').length, 6);
});

test('if automation action ticket cc has been selected then its removed from lists of action types', function(assert) {
  assert.expect(7);
  action.change_type({id: ATD.idSeven, key: ATD.keySeven});
  this.model = automation;
  this.render(hbs`{{automations/action-section model=model}}`);
  this.$('.t-add-action-btn').click();
  clickTrigger('.t-automation-action-type-select:eq(1)');  
  const options = document.getElementsByClassName('ember-power-select-option');
  Array.from(options).forEach((_elem, index) => {
    assert.notOk(options[index].innerText.includes(ACTION_TICKET_CC));
  });
  assert.equal(Ember.$('.ember-power-select-option').length, 6);
});
