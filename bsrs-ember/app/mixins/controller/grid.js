import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

var GridViewController = Ember.Controller.extend({
    page: 1,
    sort: undefined,
    find: undefined,
    search: undefined,
    store: inject('main'),
    application: Ember.inject.controller(),
    queryParams: ['page', 'sort', 'search', 'find'],
    routePath: Ember.computed.alias('application.currentRouteName'),
    defaultSort: Ember.computed(function() {
        let store = this.get('store');
        let routePath = this.get('routePath');
        let configuration = store.find('model-ordering', routePath);
        return configuration.get('order') || ['id'];
    })
});

export default GridViewController;
