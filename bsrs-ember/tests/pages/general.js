import PageObject from 'bsrs-ember/tests/page-object';
let { visitable, clickable, text, hasClass } = PageObject;
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

const DASHBOARD_URL = BASEURLS.dashboard_url;

var GeneralPage = PageObject.create({
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
  visitDashboard: visitable(DASHBOARD_URL),
  clickAdmin: clickable('.t-nav-admin'),
  clickDTD: clickable('.t-nav-admin-dtd'),
  errorText: text('.t-error-message'),
  clickLaunchDTTicket: clickable('.t-launch-dt-ticket'),
  clickHomeModalShow: clickable('.t-home-modal-show'),
  isDirty: hasClass('dirty', 'i', {scope: '.t-tab-close'}),
});

export default GeneralPage;
