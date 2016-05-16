import Ember from 'ember';

export function isChecked(params, {option, model_id}) {
  return option.get('isChecked') ? true : option.get('isCheckedObj.dtd_id') === model_id ? true : false;
}

export default Ember.Helper.helper(isChecked);
