import SD from 'bsrs-ember/vendor/defaults/setting';

var role_settings = {
  settings: {
    dashboard_text: null,
    create_all: SD.create_all,
    accept_assign: SD.accept_assign,
    accept_notify: SD.accept_notify
  }
};

var role_settingsOther = {
  settings: {
    dashboard_text: SD.dashboard_textOther,
    create_all: SD.create_allOther,
    accept_assign: SD.accept_assignOther,
    accept_notify: SD.accept_notifyOther
  }
};

export {
  role_settings, role_settingsOther
};