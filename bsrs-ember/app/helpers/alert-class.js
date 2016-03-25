import Ember from 'ember';

export function alertClass(params, {translated}) {
  const className = translated.string ? translated.string.toLowerCase() : 'info';
  return `alert-${className}`;
}

export default Ember.Helper.helper(alertClass);
