import Ember from 'ember';

export function extraParams(params/*, hash*/) {
  return { location_level: params[0] };
}

export default Ember.Helper.helper(extraParams);
