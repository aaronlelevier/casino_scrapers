import PageObject from '../page-object';
let { visitable, clickable } = PageObject;

var GeneralPage = PageObject.build({
  save: clickable('.t-save-btn'),
  cancel: clickable('.t-cancel-btn'),
  delete: clickable('.t-delete-btn'),
  submit: clickable('.submit_btn'),
});

export default GeneralPage;
