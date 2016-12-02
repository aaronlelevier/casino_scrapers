import Ember from 'ember';
const { Helper } = Ember;

export function add(params) {
  if(params.length < 2) {
    Ember.assert('Two items are required', params.length === 2);
  }
  return params.reduce((a, b) => a + b);
}

export default Helper.helper(add);
