import Ember from 'ember';

export default Ember.Helper.helper((params) => {
    var sort = params[1];
    var column = params[0];
    var query_params = sort && sort.length > 0 ? sort.split(',') : [];
    var found_asc = Ember.$.inArray(column, query_params) > -1;
    var found_desc = Ember.$.inArray('-' + column, query_params) > -1;
    if(!found_asc && !found_desc) {
        return 'fa-sort';
    }
    return found_asc ? 'fa-sort-asc' : 'fa-sort-desc';
});
