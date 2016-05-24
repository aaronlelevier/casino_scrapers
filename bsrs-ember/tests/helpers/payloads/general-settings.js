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

var setting_payload_other = {
    id: SD.id,
    name: SD.name,
    title: SD.title,
    settings: {
        company_name: SD.company_nameOther,
        company_code: SD.company_codeOther,
        dashboard_text: SD.dashboard_textOther,
        login_grace: SD.login_graceOther,
        exchange_rates: SD.exchange_ratesOther,
        modules: SD.modulesOther,
        test_mode: SD.test_modeOther,
        test_contractor_email: SD.test_contractor_emailOther,
        test_contractor_phone: SD.test_contractor_phoneOther,
        dt_start_key: SD.dt_start_keyOther
    }
};

export {
    setting_payload, setting_payload_other
};