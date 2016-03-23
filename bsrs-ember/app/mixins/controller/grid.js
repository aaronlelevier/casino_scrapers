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
  application: Ember.inject.controller(),//SCOTT: what is this for? 
  queryParams: ['page', 'sort', 'search', 'find'],
  hasActiveFilterSet: Ember.computed('filtersets.[]', 'sort', 'find', 'search', function() {
    let filtersets = this.get('filtersets');
    let sort = this.get('sort');
    let find = this.get('find');
    let search = this.get('search');
    let active = sort || find || search;
    let path = this.get('routeName');
    let result = true;
    filtersets.forEach(function(model) {
      result = !model.filter_exists(path, {search: search, find: find, sort: sort}) && result;
    });
    return active && result;
  }),
  defaultSort: Ember.computed(function() {
    let store = this.get('store');
    let path = this.get('routeName');
    let configuration = store.find('model-ordering', path);
    return configuration.get('order') || ['id'];
  }),
  actions: {
    save_filterset(name) {
      let path = this.get('routeName');
      let url = this.get('target.url');
      let params = filterset_regex(url);
      let repository = this.get('repository');
      return repository.insert(params, path, name);
    }
  }
});

export default GridViewController;
