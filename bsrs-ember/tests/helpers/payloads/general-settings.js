import SD from 'bsrs-ember/vendor/defaults/setting';

var setting_payload = {
    id: SD.id,
    name: SD.name,
    title: SD.title,
    settings: {
        login_grace: SD.login_grace,
        welcome_text: SD.welcome_text,
        company_name: SD.company_name,
        create_all: SD.create_all
    }
};

var setting_payload_other = {
    id: SD.id,
    name: SD.name,
    title: SD.title,
    settings: {
        login_grace: SD.login_graceOther,
        welcome_text: SD.welcome_textOther,
        company_name: SD.company_nameOther,
        create_all: SD.create_allOther
    }
};

export {
    setting_payload, setting_payload_other
};