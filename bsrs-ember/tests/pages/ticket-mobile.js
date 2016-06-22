import { create, clickable, isVisible } from 'ember-cli-page-object';

export default create({
  toggleFilter: clickable('.t-mobile-filter'),
  filterAndSort: isVisible('.t-mobile-filters'),
  clickFilterRequest: clickable('.t-filter-request'),
  clickFilterPriority: clickable('.t-filter-priority-translated-name'),
});
