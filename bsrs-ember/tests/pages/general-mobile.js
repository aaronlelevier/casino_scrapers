import { create, clickable } from 'ember-cli-page-object';

export default create({
  cancelFilterSort: clickable('.t-mobile-filter-first-btn'),
  submitFilterSort: clickable('.t-mobile-filter-second-btn'),
  nextPage: clickable('.t-next > a'),
  clickGridOne: clickable('.t-grid-data:eq(0)'),
});
