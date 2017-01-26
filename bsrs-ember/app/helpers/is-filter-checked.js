import Ember from 'ember';

export function isFilterChecked(params, { option, field, gridIdInParams }) {
  /*
  * { option: 'ticket.priority.emergency ', field: 'priority.name', gridFilterParams: { 'priority.name': 'ticket.priority.emergency' }}
  */
  if (field in gridIdInParams) {
    return gridIdInParams[field].includes(option) ? true : false;
  }
  return false;
}

export default Ember.Helper.helper(isFilterChecked);
