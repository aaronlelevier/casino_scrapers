import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

export function automationFilter(params/*, hash*/) {
  if (params[0]) {
    switch (params[0]) {
      case 'priority':
        return 'tickets/ticket-priority-select';
      case 'location':
        return 'tickets/ticket-location-select';
      case 'categories':
        return 'tickets/ticket-category-select';
      case 'state':
        return 'tickets/ticket-state-select';
      case 'country':
        return 'tickets/ticket-country-select';
    }
  }
}

export default Ember.Helper.helper(automationFilter);
