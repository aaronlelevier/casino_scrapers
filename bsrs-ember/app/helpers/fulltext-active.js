import Ember from 'ember';

export default Ember.Helper.helper((params) => {
    var find = params[1];
    var column = params[0];
    var fulltext_search = [];
    var query_params = find && find.length > 0 ? find.split(',') : [];
    query_params.forEach((pair) => {
        let attrs = pair.split(':');
        let value = attrs[1] || '';
        if(value.trim().length > 0) {
            fulltext_search.push(attrs[0]);
        }
    });
    return fulltext_search.includes(column);
});
