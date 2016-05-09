import Ember from 'ember';

export function isChecked(params, {option}) {
  return option.get('isChecked') ? true : false;
}

export default Ember.Helper.helper(isChecked);
