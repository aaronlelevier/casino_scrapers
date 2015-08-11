import Ember from 'ember';

export default Ember.Controller.extend({
    queryParams: ['page', 'sort', 'search'],
    page: null,
    sort: null,
    search: null
});
