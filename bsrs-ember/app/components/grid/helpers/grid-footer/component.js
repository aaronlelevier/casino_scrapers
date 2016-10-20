import Ember from 'ember';
import config from 'bsrs-ember/config/environment';

const PAGE_SIZE = config.APP.PAGE_SIZE;

/*
* page_size && plural component params not needed in mobile
*/
var GridFooter = Ember.Component.extend({
  page_sizes: ['10', '20', '50', '100', '150'],
  shown_pages: Ember.computed('pages', 'page', function() {
    const all = this.get('pages');
    const available = all.length;
    const current = parseInt(this.get('page'), 10);
    if(current > 6) {
      const max = current + 4;
      const min = current - 6;
      return max <= available ? all.slice(min, max) : all.slice(available - 10, available);
    }
    return all.slice(0, 10);
  }),
  pages: Ember.computed('model.count', function() {
    const pages = [];
    const page_size = this.get('page_size') || PAGE_SIZE;
    const total = this.get('model.count') / page_size || 1;
    for(let p=1; p <= Math.ceil(total); p++) {
      pages.push(p);
    }
    return pages;
  }),
  first: Ember.computed('page', function() {
    const current = parseInt(this.get('page'), 10);
    return current === 1 ? undefined : 1;
  }),
  last: Ember.computed('page', 'pages', function() {
    const available = this.get('pages').length;
    const current = parseInt(this.get('page'), 10);
    return current !== available ? available : undefined;
  }),
  next: Ember.computed('page', 'pages', function() {
    const available = this.get('pages').length;
    const current = parseInt(this.get('page'), 10);
    const next = current + 1;
    return next <= available ? next : undefined;
  }),
  previous: Ember.computed('page', function() {
    const previous = this.get('page') - 1;
    return previous > 0 ? previous : undefined;
  }),
  notNext: Ember.computed.not('next'),
  notPrevious: Ember.computed.not('previous'),
  notFirst: Ember.computed.not('first'),
  notLast: Ember.computed.not('last'),
  actions: {
    /* only used in desktop */
    togglePageSize(page_size) {
      this.setProperties({page: 1, page_size: page_size});
    },
    scrollTop() {
      Ember.$('section.docSection').scrollTop(0, 0);
    }
  }
});

export default GridFooter;
