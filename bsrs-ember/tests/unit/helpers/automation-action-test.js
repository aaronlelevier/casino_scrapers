import Ember from 'ember';
import { automationAction } from 'bsrs-ember/helpers/automation-action';
import { module, test } from 'qunit';

module('Unit | Helper | automation-action');

test('it works', function(assert) {
  let result = automationAction([Ember.Object.create({'key': 'automation.actions.ticket_assignee'})]);
  assert.equal(result, 'tickets/ticket-assignee-select');
  result = automationAction([Ember.Object.create({'key': 'automation.actions.ticket_priority'})]);
  assert.equal(result, 'tickets/ticket-priority-select-action');
  result = automationAction([Ember.Object.create({'key': 'automation.actions.ticket_status'})]);
  assert.equal(result, 'tickets/ticket-status-select-action');
  result = automationAction([Ember.Object.create({'key': 'automation.actions.send_email'})]);
  assert.equal(result, 'automations/sendemail-action');
  result = automationAction([Ember.Object.create({'key': 'automation.actions.send_sms'})]);
  assert.equal(result, 'automations/sendsms-action');
});

