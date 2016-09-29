
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
    const camelWord = related_model.replace(rgx, upperCaseLetter);
    if (camelWord.indexOf('_') > -1) {
      return camel(camelWord);
    }
    return camelWord;
  }
  return related_model;
};

export default camel;
