import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

/**
 * - used to render a component based on the pfliter's criteria
 * - component helper passes in the pfilter model
 * - all components render multi power select
 * @function automationFilter
 * @param {Array} params - array with pfilter.field in it
 */
export function automationFilter(_params, { type }) {
  if (type) {
    switch (type) {
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
