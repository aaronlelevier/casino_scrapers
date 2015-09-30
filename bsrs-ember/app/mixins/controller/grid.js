import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

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
    defaultSort: Ember.computed(function() {
        let store = this.get('store');
        let routePath = this.get('routePath');
        let configuration = store.find('model-ordering', routePath);
        return configuration.get('order') || ['id'];
    }),
    actions: {
        save_filterset: function(name) {
            let path = this.get('routePath');
            let url = window.location.toString();
            let repository = this.get('repository');
            repository.insert(url, path, name);
        }
    }
});

export default GridViewController;
