import { create, clickable, isVisible } from 'ember-cli-page-object';

export default create({
  toggleFilter: clickable('.t-mobile-filter'),
  filterAndSort: isVisible('.t-mobile-filters')
});
