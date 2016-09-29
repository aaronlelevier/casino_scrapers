/*
 * - caps will capitalize first letter and replace first letter after underscore with capital letter
 * - assumes only one underscore in related_model string
 * 
 * @param {string} related_model
 */
var caps = function(related_model) {
  if (related_model.includes('_')){
    const indx = related_model.indexOf('_');
    const character = related_model.charAt(indx+1);
    const upperCaseLetter = character.toUpperCase();
    const rgx = new RegExp(`_${character}`);
    const cappedWord = related_model.charAt(0).toUpperCase() + related_model.substr(1).replace(rgx, upperCaseLetter);
    if (cappedWord.indexOf('_') > -1) {
      return caps(cappedWord);
    }
    return cappedWord;
  }
  return related_model.charAt(0).toUpperCase() + related_model.substr(1);
};

export default caps;


