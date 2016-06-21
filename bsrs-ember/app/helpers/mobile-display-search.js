import Ember from 'ember';
/*
* @param {array} result - passed is-array truth helper
* @param {object} searchConfigProperty
*/
export function mobileDisplaySearch(params, { result, searchConfigProperty }) {
  /* assuming result is of property 'categories' */
  const names = result.sortBy('level').map((category) => {
      return category[searchConfigProperty];
  }).join(' &#8226 ');
  return Ember.String.htmlSafe(names);
}

export default Ember.Helper.helper(mobileDisplaySearch);
