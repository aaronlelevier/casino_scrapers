import Ember from 'ember';

/* Ember Helper
* @param {obj} column.field
* @param {array} sort - properties that grid is sorted on separated by a comma
* @return fa-icon showing down or up
*/
export default Ember.Helper.helper((params) => {
    var sort = Ember.$.isArray(params[1]) ? params[1][0] : params[1];
    var column = params[0];
    var query_params = sort && sort.length > 0 ? sort.split(',') : [];
    var found_asc = query_params.includes(column);
    var found_desc = query_params.includes('-' + column);
    if(!found_asc && !found_desc) {
        return 'fa-sort';
    }
    return found_asc ? 'fa-sort-asc' : 'fa-sort-desc';
});
