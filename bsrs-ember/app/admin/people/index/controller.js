import Ember from 'ember';

export default Ember.Controller.extend({
    queryParams: ['page', 'sort', 'search'],
    page: 1,
    sort: undefined,
    search: undefined
});
