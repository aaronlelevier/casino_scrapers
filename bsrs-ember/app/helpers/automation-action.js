import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

export function automationAction(params/*, hash*/) {
  if (params[0]) {
    switch (params[0].get('key')) {
      case 'automation.actions.ticket_assignee':
        return 'tickets/ticket-assignee-select';
      case 'automation.actions.ticket_priority':
        return 'tickets/ticket-priority-select-action';
      case 'automation.actions.ticket_status':
        return 'tickets/ticket-status-select-action';
      case 'automation.actions.send_email':
        return 'automations/sendemail-action';
      case 'automation.actions.send_sms':
        return 'automations/sendsms-action';
    }
  }
}

export default Ember.Helper.helper(automationAction);
