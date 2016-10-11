import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import filterset_regex from 'bsrs-ember/utilities/filterset-regex';

var GridViewController = Ember.Controller.extend({
  page: 1,
  page_size: undefined,
  sort: undefined,
  find: undefined,
  search: undefined,
  id_in: undefined,
  repositoryFilterset: inject('filterset'),
  queryParams: ['page', 'sort', 'search', 'find', 'id_in'],
  hasActiveFilterSet: Ember.computed('filtersets.[]', 'sort', 'find', 'search', function() {
    const { filtersets, sort, find, search, routeName } = this.getProperties('filtersets', 'sort', 'find', 'search', 'routeName');
    let active = sort || find || search;
    let result = true;
    filtersets.forEach((model) => {
      result = !model.filter_exists(routeName, {search: search, find: find, sort: sort}) && result;
    });
    return active && result;
  }).readOnly(),
  actions: {
    save_filterset(name) {
      const { routeName, repositoryFilterset } = this.getProperties('routeName', 'repositoryFilterset');
      let url = this.get('target.url');
      let params = filterset_regex(url);
      return repositoryFilterset.insert(params, routeName, name);
    }
  }
});

export default GridViewController;
