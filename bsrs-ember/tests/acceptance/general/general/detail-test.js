import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import SD from 'bsrs-ember/vendor/defaults/setting';
import SF from 'bsrs-ember/vendor/setting_fixtures';
import generalPage from 'bsrs-ember/tests/pages/general';
import {setting_payload, setting_payload_other} from 'bsrs-ember/tests/helpers/payloads/general-settings';


const PREFIX = config.APP.NAMESPACE;
const BASE_ADMIN_URL = 'admin';
const BASE_SETTINGS_URL = BASEURLS.base_setting_url;
const DETAIL_URL = BASE_SETTINGS_URL + '/' + SD.id;

var application, store, endpoint, setting_data, detail_xhr, url;

module('Acceptance | general settings', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + DETAIL_URL + '/';
        setting_data = SF.detail();
        detail_xhr = xhr(endpoint, 'GET', null, {}, 200, setting_data);
        url = `${PREFIX}${DETAIL_URL}/`;
    },
    afterEach() {
       Ember.run(application, 'destroy');
    }
});

test('general settings title and fields populated correctly', function(assert) {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-settings-title').text().trim(), t(setting_data.title));
        assert.equal(find('.t-settings-welcome').val(), SD.welcome_text);
    });
    fillIn('.t-settings-welcome', SD.welcome_textOther);
    fillIn('.t-settings-login_grace', SD.login_graceOther);
    fillIn('.t-settings-company_name', SD.company_nameOther);
    click('.t-settings-create_all');
    andThen(() => {
        let setting = store.find('setting', SD.id);
        assert.equal(setting.get('welcome_text'), SD.welcome_textOther);
        assert.equal(setting.get('login_grace'), SD.login_graceOther);
        assert.equal(setting.get('company_name'), SD.company_nameOther);
        assert.equal(setting.get('create_all'), SD.create_allOther);
        assert.ok(setting.get('isDirty'));
        assert.ok(setting.get('isDirtyOrRelatedDirty'));
    });
    xhr(url, 'PUT', JSON.stringify(setting_payload_other), {}, 200, {});
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), '/' + BASE_ADMIN_URL);
        let setting = store.find('setting', SD.id);
        assert.ok(setting.get('isNotDirty'));
    });
});
