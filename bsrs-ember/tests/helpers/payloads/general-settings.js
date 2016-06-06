import SD from 'bsrs-ember/vendor/defaults/setting';

var setting_payload = {
  id: SD.id,
  name: SD.name,
  title: SD.title,
  settings: {
    company_name: SD.company_name,
    dashboard_text: SD.dashboard_text,
    login_grace: SD.login_grace
  }
};

// `dt_start_id` is the only param not changed here. It is changed
// in the following payload b/c couldn't test w/o using Js async/await
// syntax, so needed separate tests
var setting_payload_other = {
  id: SD.id,
  name: SD.name,
  title: SD.title,
  related_id: SD.related_id,
  settings: {
    company_name: SD.company_nameOther,
    company_code: SD.company_codeOther,
    dashboard_text: SD.dashboard_textOther,
    login_grace: SD.login_graceOther,
    tickets_module: SD.tickets_moduleOther,
    work_orders_module: SD.work_orders_moduleOther,
    invoices_module: SD.invoices_moduleOther,
    test_mode: SD.test_modeOther,
    test_contractor_email: SD.test_contractor_emailOther,
    test_contractor_phone: SD.test_contractor_phoneOther,
    dt_start_id: SD.dt_start_id
  }
};

var setting_payload_only_change_dt_start = {
  id: SD.id,
  name: SD.name,
  title: SD.title,
  related_id: SD.related_id,
  settings: {
    company_name: SD.company_name,
    company_code: SD.company_code,
    dashboard_text: SD.dashboard_text,
    login_grace: SD.login_grace,
    tickets_module: SD.tickets_module,
    work_orders_module: SD.work_orders_module,
    invoices_module: SD.invoices_module,
    test_mode: SD.test_mode,
    test_contractor_email: SD.test_contractor_email,
    test_contractor_phone: SD.test_contractor_phone,
    dt_start_id: SD.dt_start_idOther
  }
};

export {
  setting_payload, setting_payload_other, setting_payload_only_change_dt_start
};