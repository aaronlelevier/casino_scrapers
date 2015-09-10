import Ember from 'ember';

export default Ember.Helper.helper((params) => {
    var query_params = params[1] && params[1].length > 0 ? params[1].split(',') : [];
    return Ember.$.inArray(params[0], query_params) > -1;
});
