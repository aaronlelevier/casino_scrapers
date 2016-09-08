/*
 * - plural
 * - y --> ies
 * - s --> es
 * - default --> s
 * @param {string} many_model
 */
var plural = function(many_model) {
  const len = many_model.length;
  let last_letter = many_model.charAt(len-1);
  let word;
  if(last_letter === 'y') {
    last_letter = 'ies';
    word = many_model.substr(0, len-1) + last_letter;
  } else if (last_letter === 's'){
    last_letter = 's';
    word = many_model.substr(0, len) + 'e' + last_letter;
  } else {
    last_letter = 's';
    word = many_model.substr(0, len) + last_letter;
  }
  return word;
};

export default plural;



