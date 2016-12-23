import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { ACTION_SEND_EMAIL, ACTION_SEND_SMS, ACTION_ASSIGNEE, ACTION_PRIORITY, ACTION_STATUS, ACTION_TICKET_REQUEST, ACTION_TICKET_CC } from 'bsrs-ember/models/automation-action';

export function automationAction(params/*, hash*/) {
  if (params[0]) {
    switch (params[0].get('key')) {
      case ACTION_ASSIGNEE:
        return 'tickets/ticket-assignee-select';
      case ACTION_PRIORITY:
        // selecting single priority select
        return 'tickets/ticket-priority-select-action';
      case ACTION_STATUS:
        // selecting single status select
        return 'tickets/ticket-status-select-action';
      case ACTION_SEND_EMAIL:
        return 'automations/sendemail-action';
      case ACTION_SEND_SMS:
        return 'automations/sendsms-action';
      case ACTION_TICKET_REQUEST:
        return 'tickets/ticket-request-select-action';
      case ACTION_TICKET_CC:
        return 'tickets/ticket-cc-select-action';
    }
  }
}

export default Ember.Helper.helper(automationAction);
