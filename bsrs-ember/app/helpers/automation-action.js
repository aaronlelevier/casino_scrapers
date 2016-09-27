import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

export function automationAction(params/*, hash*/) {
  if (params[0]) {
    switch (params[0].get('key')) {
      case 'automation.actions.ticket_assignee':
        return 'tickets/ticket-assignee-select';
    }
  }
}

export default Ember.Helper.helper(automationAction);
