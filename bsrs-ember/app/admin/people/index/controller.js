import Ember from 'ember';

export default Ember.Controller.extend({
    queryParams: ['page', 'sort'],
    page: null,
    sort: null,
});
