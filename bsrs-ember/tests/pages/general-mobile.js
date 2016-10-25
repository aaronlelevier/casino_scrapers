import { create, clickable, fillable, hasClass, visitable } from 'ember-cli-page-object';
import BASEURLS from 'bsrs-ember/utilities/urls';

export const mobileSearch = '.t-mobile-search-slideUp .t-grid-search-input';

export default create({
  visitAdmin: visitable(BASEURLS.ADMIN_MOBILE_URL),
  cancelFilterSort: clickable('.t-mobile-filter-first-btn'),
  submitFilterSort: clickable('.t-mobile-filter-second-btn'),
  nextPage: clickable('.t-next > a'),
  clickGridOne: clickable('.t-grid-data:eq(0)'),
  clickSearchGridOne: clickable('.t-grid-search-data:eq(0)'),
  mobileSearch: fillable(mobileSearch),
  filterInput: fillable('.t-filter-input'),
  filterInput2: fillable('.t-filter-input:eq(1)'),
  clickSearchIcon: clickable('.t-mobile-search'),
  clickFilterOpen: clickable('.t-mobile-filter'),
  saveFilterset: clickable('.t-mobile-save-filterset'),
  closeFiltersetInput: clickable('.t-mobile-save-filterset-component span'),
  backButtonClick: clickable('.t-detail-back'),
  mobileActionDropdownClick: clickable('.t-mobile-action-dropdown'),
  footerItemOneClick: clickable('.t-mobile-footer-item:eq(0)'),
  footerItemTwoClick: clickable('.t-mobile-footer-item:eq(1)'),
  footerItemThreeClick: clickable('.t-mobile-footer-item:eq(2)'),
  footerItemFourClick: clickable('.t-mobile-footer-item:eq(3)'),
  // footerItemOneActive: hasClass('t-mobile-footer-item:eq(0)', 'active'),
  // footerItemTwoActive: hasClass('t-mobile-footer-item', 'active', {multiple: true}),
});
