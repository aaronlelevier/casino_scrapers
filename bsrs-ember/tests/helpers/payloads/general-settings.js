import SD from 'bsrs-ember/vendor/defaults/setting';

var setting_payload = {
    id: SD.id,
    name: SD.name,
    title: SD.title,
    settings: SD.settings
};

var setting_payload_welcome_text = {
    id: SD.id,
    name: SD.name,
    title: SD.title,
    settings: {
        'login_grace': SD.settings.login_grace,
        'welcome_text': {
            'required': false,
            'type': 'str',
            'value': '1234'
        },
        'company_name': SD.settings.company_name,
        'create_all': SD.settings.create_all
    }
};

export {setting_payload, setting_payload_welcome_text};
