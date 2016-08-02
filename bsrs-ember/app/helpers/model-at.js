import Ember from 'ember';

export function modelAt(params/*, hash*/) {
  return params[0].objectAt(params[1]);
}

export default Ember.Helper.helper(modelAt);
