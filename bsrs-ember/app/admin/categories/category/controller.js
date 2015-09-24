import Ember from 'ember';

var CategoryController = Ember.Controller.extend({
    queryParams: ['search'],
    search: undefined,
});

export default CategoryController;
