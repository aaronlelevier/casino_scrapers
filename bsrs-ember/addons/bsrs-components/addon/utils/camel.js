
/*
 * - camel will replace first letter after underscore with capital letter
 * - assumes only one underscore in related_model string
 *
 * @param {string} related_model
 */
var camel = function(related_model) {
  if (related_model.includes('_')){
    const indx = related_model.indexOf('_');
    const character = related_model.charAt(indx+1);
    const upperCaseLetter = character.toUpperCase();
    const rgx = new RegExp(`_${character}`);
    return related_model.replace(rgx, upperCaseLetter);
  }
  return related_model;
};

export default camel;
