import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import SortBy from 'bsrs-ember/mixins/sort-by';
import FilterBy from 'bsrs-ember/mixins/filter-by';
import regex_property from 'bsrs-ember/utilities/regex-property';

const { Component, computed } = Ember;
const PAGE_SIZE = config.APP.PAGE_SIZE;

var GridViewComponent = Component.extend(SortBy, FilterBy, {
  toggleFilter: false,

  /**
   * @property found_content
   */
  found_content: computed('find', 'sort', 'page', 'search', 'model.[]', function() {
    const find = this.get('find') || '';
    const searched_content = this.get('model');
    const params = find.split(',');
    if(params[0].trim() !== '') {
      let filter = params.map((option) => {
        const property = option.split(':')[0];
        const propertyValue = option.split(':')[1];
        const regex = new RegExp(propertyValue, 'i');
        return this.get('model').filter((object) => {
          return regex_property(object, property, regex);
        });
      }.bind(this));
      return filter.reduce((a,b) => {
        const one_match = a.filter(item => b.mapBy('id').includes(item.get('id')));
        const two_match = b.filter(item => a.mapBy('id').includes(item.get('id')));
        return one_match.concat(two_match);
      }).uniq();
    }
    return searched_content;
  }).readOnly(),

  /**
   * requested is an ArrayProxy from the pagination service
   * page_size is a queryParam
   * @property paginated_content
   */
  paginated_content: computed('found_content.[]', function() {
    const requested = this.get('requested');
    const page = parseInt(this.get('page')) || 1;
    const page_size = parseInt(this.get('page_size')) || PAGE_SIZE;
    const pages = requested.toArray().sort((a,b) => { return a-b; }).uniq();
    const max = (pages.indexOf(page) + 1) * page_size;
    const found_content = this.get('found_content');
    return found_content.slice(0, Math.max(page_size, 10));
  }).readOnly(),

  /**
   * @property paginated_content_mobile
   */
  paginated_content_mobile: computed('found_content.[]', function() {
    const requested = this.get('requested');
    const page = parseInt(this.get('page')) || 1;
    const page_size = parseInt(this.get('page_size')) || PAGE_SIZE;
    const pages = requested.toArray().sort((a,b) => { return a-b; }).uniq();
    const max = (pages.indexOf(page) + 1) * page_size;
    const found_content = this.get('found_content');
    return found_content;
  }).readOnly(),

  actions: {
    keyup(search) {
      Ember.run.scheduleOnce('actions', this, function() {
        this.set('page', 1);
        this.set('search', search);
      }.bind(this));
    },
    sortBy(column) {
      const current = this.get('sort');
      const sorted = this.reorder(current, column);
      this.setProperties({page: 1, sort: sorted, isLoading: true});
    },
    toggleFilterModal(column) {
      /* Filter By mixin */
      this.toggle(column);
    },
    resetGrid() {
      this.setProperties({page: 1, sort: undefined, find: undefined, search: undefined, isLoading: undefined});
    }
  }
});

export default GridViewComponent;
