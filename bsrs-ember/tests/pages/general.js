import PageObject from 'bsrs-ember/tests/page-object';
let { visitable, clickable, text } = PageObject;
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

const ADMIN_URL = BASEURLS.dashboard_url;

var GeneralPage = PageObject.create({
  save: clickable('.t-save-btn'),
  cancel: clickable('.t-cancel-btn'),
  delete: clickable('.t-delete-btn'),
  submit: clickable('.submit_btn'),
  closeTab: clickable('.t-tab-close:eq(0)'),
  clickModalCancel: clickable('.t-modal-footer .t-modal-cancel-btn'),
  clickModalRollback: clickable('.t-modal-footer .t-modal-rollback-btn'),
  modalIsVisible: PageObject.isVisible('.t-modal'),
  modalIsHidden: PageObject.isHidden('.t-modal'),
  visitDashboard: visitable(ADMIN_URL),
  clickAdmin: clickable('.t-nav-admin'),
  clickDTD: clickable('.t-nav-admin-dtd'),
  errorText: text('.t-error-message')
});

export default GeneralPage;
