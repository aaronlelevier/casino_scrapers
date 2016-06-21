import { create, clickable, fillable } from 'ember-cli-page-object';

export const mobileSearch = '.t-mobile-search-slideUp .t-grid-search-input';

export default create({
  cancelFilterSort: clickable('.t-mobile-filter-first-btn'),
  submitFilterSort: clickable('.t-mobile-filter-second-btn'),
  nextPage: clickable('.t-next > a'),
  clickGridOne: clickable('.t-grid-data:eq(0)'),
  mobileSearch: fillable(mobileSearch),
  clickSearchIcon: clickable('.t-mobile-search'),
  clickFilterOpen: clickable('.t-mobile-filter'),
});
