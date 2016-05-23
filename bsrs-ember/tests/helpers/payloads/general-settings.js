import SD from 'bsrs-ember/vendor/defaults/setting';

var setting_payload = {
    id: SD.id,
    name: SD.name,
    title: SD.title,
    settings: {
        login_grace: SD.login_grace,
        dashboard_text: SD.dashboard_text,
        company_name: SD.company_name
    }
};

var setting_payload_other = {
    id: SD.id,
    name: SD.name,
    title: SD.title,
    settings: {
        login_grace: SD.login_graceOther,
        dashboard_text: SD.dashboard_textOther,
        company_name: SD.company_nameOther
    }
};

export {
    setting_payload, setting_payload_other
};