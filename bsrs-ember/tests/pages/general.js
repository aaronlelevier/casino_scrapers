import PageObject from '../page-object';
let { visitable, clickable } = PageObject;

var GeneralPage = PageObject.create({
  save: clickable('.t-save-btn'),
  cancel: clickable('.t-cancel-btn'),
  delete: clickable('.t-delete-btn'),
  submit: clickable('.submit_btn'),
  clickModalCancel: clickable('.t-modal-footer .t-modal-cancel-btn'),
  clickModalRollback: clickable('.t-modal-footer .t-modal-rollback-btn'),
  modalIsVisible: PageObject.isVisible('.t-modal'),
  modalIsHidden: PageObject.isHidden('.t-modal'),
});

export default GeneralPage;
