import TD from 'bsrs-ember/vendor/defaults/tenant';

var tenant_payload_other = {
  id: TD.id,
  company_name: TD.company_nameOther,
  company_code: TD.company_codeOther,
  dashboard_text: TD.dashboard_textOther,
  test_mode: TD.test_modeOther,
  dt_start_id: TD.dt_start_id,
  default_currency_id: TD.default_currency_idOther
};

var tenant_payload_other_only_change_start = {
  id: TD.id,
  company_name: TD.company_name,
  company_code: TD.company_code,
  dashboard_text: TD.dashboard_text,
  test_mode: TD.test_mode,
  dt_start_id: TD.dt_start_idOther,
  default_currency_id: TD.default_currency_id
};

export {
  tenant_payload_other, tenant_payload_other_only_change_start
};