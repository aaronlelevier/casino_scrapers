import Ember from 'ember';

export function checkIfNum(params/*, hash*/) {
  return Number.isInteger(params[0]);
}

export default Ember.Helper.helper(checkIfNum);
