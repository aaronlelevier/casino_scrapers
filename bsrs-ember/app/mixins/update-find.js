import Ember from 'ember';

/* @method update_find_query
* @param {string} column - 'location.name'
* @param {string} value - 'newwat'
* @param {string} find - 'location.name:wat,status.translated_name:foo'
* pure function that does not mutate state
* possible for mobile that find is empty; however, second filter on a find column, thus need to handle both by relying on finalFilter string as well
* @return {string} newFind - `find` string 'location.name:newwat,status.translated_name:foo' for that one column (desktop - saving-filter component, mobile - grid-head)
*/
var UpdateFind = Ember.Mixin.create({
  update_find_query: function(column, value, find, finalFilter) {
    find = find || '';
    let newFind = '';
    let hash = column + ':' + value;
    /* array of existing filter keys from find queryParam */
    let keysOnlyArray = find.split(',').map((criteria) => {
      return criteria.split(':')[0];
    });
    /* if not in array, append column and new column:value.  If already a finalFilter (mobile), then need to append comma b/c finalFilter not reflected in find query yet */
    if(!keysOnlyArray.includes(column)) {
      newFind = (find && find.length > 0) || finalFilter ? find + ',' + hash : hash;
    } else {
      /* otherwise build RegExp object (/location.name:\w*,?/) and clear it out or replace the existing with new hash */
      let regex = new RegExp(column +':\\w*,?');
      let replacedFind = value === '' ? find.replace(regex, '') : find.replace(regex, hash + ',');
      /* trailing comma needs to be removed */
      newFind = replacedFind.replace(/,+$/, '');
    }
    return newFind;
  }
});

export default UpdateFind;
