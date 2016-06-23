import Ember from 'ember';

export function isFilterChecked(params, { field, gridFilterParams }) {
  /*
  * { 'priority.translated_name': 'ticket.priority.emergency'}
  */
  if (field in gridFilterParams) {
    return true;
  }
  return false;
}

export default Ember.Helper.helper(isFilterChecked);
