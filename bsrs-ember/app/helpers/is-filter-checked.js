import Ember from 'ember';

export function isFilterChecked(params, { option, field, gridFilterParams }) {
  /*
  * { option: 'ticket.priority.emergency ', field: 'priority.translated_name', gridFilterParams: { 'priority.translated_name': 'ticket.priority.emergency' }}
  */
  if (field in gridFilterParams) {
    return option === gridFilterParams[field] ? true : false;
  }
  return false;
}

export default Ember.Helper.helper(isFilterChecked);
