import Ember from 'ember';

export default Ember.Controller.extend({
    queryParams: ['page', 'sort', 'search', 'find'],
    page: 1,
    sort: undefined,
    search: undefined,
    find: undefined
});
