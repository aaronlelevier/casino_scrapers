import Ember from 'ember';

export function alertClass(params/*, hash*/) {
  const model = params[0];
  const translated = params[1];
  const className = translated.string ? translated.string.toLowerCase() : 'info';
  return `alert-${className}`;
}

export default Ember.Helper.helper(alertClass);
