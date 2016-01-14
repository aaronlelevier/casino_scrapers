import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import filterset_regex from 'bsrs-ember/utilities/filterset-regex';

var GridViewController = Ember.Controller.extend({
    page: 1,
    page_size: undefined,
    sort: undefined,
    find: undefined,
    search: undefined,
    repository: inject('filterset'),
    application: Ember.inject.controller(),
    queryParams: ['page', 'sort', 'search', 'find'],
    routePath: Ember.computed.alias('application.currentRouteName'),
    hasActiveFilterSet: Ember.computed('sort', 'find', 'search', function() {
        let sort = this.get('sort');
        let find = this.get('find');
        let search = this.get('search');
        return sort || find || search;
    }),
    defaultSort: Ember.computed(function() {
        let store = this.get('store');
        let routePath = this.get('routePath');
        let configuration = store.find('model-ordering', routePath);
        return configuration.get('order') || ['id'];
    }),
    actions: {
        save_filterset(name) {
            let path = this.get('routePath');
            let url = this.get('target.url');
            let params = filterset_regex(url);
            let repository = this.get('repository');
            repository.insert(params, path, name);
        }
    }
});

export default GridViewController;
