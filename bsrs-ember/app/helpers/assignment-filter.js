import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

export function assignmentFilter(params/*, hash*/) {
  if (params[0]) {
    switch (params[0].get('key')) {
      case 'admin.placeholder.ticket_priority':
        return 'tickets/ticket-priority-select';
    }
  }
}

export default Ember.Helper.helper(assignmentFilter);
