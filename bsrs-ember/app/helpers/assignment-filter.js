import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

export function assignmentFilter(params/*, hash*/) {
  if (params[0]) {
    switch (params[0].get('field')) {
      case 'priority':
        return 'tickets/ticket-priority-select';
      case 'location':
        return 'tickets/ticket-location-select';
    }
  }
}

export default Ember.Helper.helper(assignmentFilter);
