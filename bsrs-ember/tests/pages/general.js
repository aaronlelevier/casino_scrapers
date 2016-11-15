import Ember from 'ember';
import PageObject from 'bsrs-ember/tests/page-object';
let { visitable, clickable, text, hasClass, fillable } = PageObject;
import BASEURLS from 'bsrs-ember/utilities/urls';

const EMAIL_TYPES = '.t-email-type-select .ember-basic-dropdown-trigger';

var GeneralPage = PageObject.create({
  visitAdmin: visitable('/admin'),
  visitDashboard: visitable(BASEURLS.DASHBOARD_URL),
  save: clickable('.t-save-btn'),
  cancel: clickable('.t-cancel-btn'),
  delete: clickable('.t-delete-btn'),
  closeTab: clickable('.t-tab-close:eq(0)'),
  clickModalCancel: clickable('.t-modal-footer .t-modal-cancel-btn'),
  clickModalRollback: clickable('.t-modal-footer .t-modal-rollback-btn'),
  clickModalDelete: clickable('.t-modal-footer .t-modal-delete-btn'),
  clickModalCancelDelete: clickable('.t-modal-footer .t-modal-cancel-btn'),
  modalIsVisible: PageObject.isVisible('.ember-modal-dialog'),
  modalIsHidden: PageObject.isHidden('.t-modal'),
  clickAdmin: clickable('.t-nav-admin'),
  errorText: text('.t-error-message'),
  clickLaunchDTTicket: clickable('.t-launch-dt-ticket'),
  clickHomeModalShow: clickable('.t-home-modal-show'),
  isDirty: hasClass('dirty', 'i', {scope: '.t-tab-close'}),

  gridItemZeroClick: clickable('.t-grid-data:eq(0)'),
  gridItemOneClick: clickable('.t-grid-data:eq(1)'),
  gridTitle: text('.t-grid-title'),
  gridPageCountText: text('.t-page-count'),

  modalBodyValue: () => Ember.$('.t-modal-body').text().trim(),
  modalCancelBtnValue: () => Ember.$('.t-modal-cancel-btn').text().trim(),
  modalDeleteBtnValue: () => Ember.$('.t-modal-delete-btn').text().trim(),
  modalRollbackBtnValue: () => Ember.$('.t-modal-rollback-btn').text().trim(),
  modalTitleValue: () => Ember.$('.t-modal-title').text().trim(),

  //Admin Routes
  clickDashboard: clickable('.t-nav-dashboard'),
  clickDTD: clickable('.t-nav-admin-dtd'),
  clickAutomations: clickable('.t-nav-admin-automation-profiles'),
  clickCategories: clickable('.t-nav-admin-category'),
  clickPeople: clickable('.t-nav-admin-people'),
  clickLocations: clickable('.t-nav-admin-location'),
  clickLocationLevel: clickable('.t-nav-admin-location-level'),
  clickRoles: clickable('.t-nav-admin-role'),
  clickGeneralSettingsLink: clickable('.t-nav-general-settings'),
  clickTickets: clickable('.t-nav-tickets'),

  // validation
  clickAddEmail: clickable('.t-add-email-btn'),
  clickDeleteEmail: clickable('.t-del-email-btn:eq(0)'),
  emailTypeSelectedOne: text(`${EMAIL_TYPES}:eq(0)`),

  clickAddPhoneNumber: clickable('.t-add-phone-number-btn'),
  clickDeletePhoneNumber: clickable('.t-del-phone-number-btn:eq(0)'),

  clickAddAddress: clickable('.t-add-address-btn'),
  clickDeleteAddress: clickable('.t-del-address-btn:eq(0)'),

  phonenumberFillIn: fillable('.t-phonenumber-number0'),
  phonenumberThirdFillIn: fillable('.t-phonenumber-number2'),
  phonenumberRemoveSecond: clickable('.t-del-phone-number-btn:eq(1)'),
  emailFillIn: fillable('.t-email-email0'),
  emailThirdFillIn: fillable('.t-email-email2'),
  emailRemoveSecond: clickable('.t-del-email-btn:eq(1)'),

  phonenumberZeroValidationErrorVisible: hasClass('invalid', '.t-phonenumber-number-validator0'),
  phonenumberOneValidationErrorVisible: hasClass('invalid', '.t-phonenumber-number-validator1'),
  phonenumberTwoValidationErrorVisible: hasClass('invalid', '.t-phonenumber-number-validator2'),
  emailZeroValidationErrorVisible: hasClass('invalid', '.t-email-email-validator0'),
  emailOneValidationErrorVisible: hasClass('invalid', '.t-email-email-validator1'),
  emailTwoValidationErrorVisible: hasClass('invalid', '.t-email-email-validator2'),

  clickTenants: clickable('.t-nav-tenants'),
});

export default GeneralPage;
