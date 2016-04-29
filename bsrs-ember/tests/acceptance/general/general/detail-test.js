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
import BSRS_TRANSLATION_FACTORY from 'bsrs-ember/vendor/translation_fixtures';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';

const PREFIX = config.APP.NAMESPACE;
const BASE_ADMIN_URL = 'admin';
const BASE_SETTINGS_URL = BASEURLS.base_setting_url;
const DETAIL_URL = BASE_SETTINGS_URL + '/' + SD.id;

var application, store, endpoint, setting_data, detail_xhr, url, translations;

module('Acceptance | general settings', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('service:simpleStore');
        endpoint = PREFIX + DETAIL_URL + '/';
        setting_data = SF.detail();
        detail_xhr = xhr(endpoint, 'GET', null, {}, 200, setting_data);
        url = `${PREFIX}${DETAIL_URL}/`;
        translations = BSRS_TRANSLATION_FACTORY.generate('en')['en'];
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
        assert.equal(find('.t-settings-welcome_text').val(), SD.welcome_text);
    });
    fillIn('.t-settings-welcome_text', SD.welcome_textOther);
    fillIn('.t-settings-login_grace', SD.login_graceOther);
    fillIn('.t-settings-company_name', SD.company_nameOther);
    andThen(() => {
        let setting = store.find('setting', SD.id);
        assert.equal(setting.get('welcome_text'), SD.welcome_textOther);
        assert.equal(setting.get('login_grace'), SD.login_graceOther);
        assert.equal(setting.get('company_name'), SD.company_nameOther);
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

test('translations - for labels', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(getLabelText('welcome_text'), translations['admin.setting.welcome_text']);
        assert.equal(getLabelText('login_grace'), translations['admin.setting.login_grace']);
        assert.equal(getLabelText('company_name'), translations['admin.setting.company_name']);
    });
});

test('general settings are properly dirty tracked', function(assert) {
    visit(DETAIL_URL);
    andThen(() => {
        let setting = store.find('setting', SD.id);
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-settings-login_grace').val(), SD.login_grace);
    });
    fillIn('.t-settings-login_grace', SD.login_graceOther);
    andThen(() => {
        let setting = store.find('setting', SD.id);
        assert.ok(setting.get('isDirty'));
    });
    fillIn('.t-settings-login_grace', SD.login_grace);
    andThen(() => {
        let setting = store.find('setting', SD.id);
        assert.ok(setting.get('isNotDirty'));
    });
});
