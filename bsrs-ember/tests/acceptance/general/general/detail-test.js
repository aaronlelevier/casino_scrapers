import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import SD from 'bsrs-ember/vendor/defaults/setting';
import SF from 'bsrs-ember/vendor/setting_fixtures';
import page from 'bsrs-ember/tests/pages/settings';
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
        assert.equal(find('.t-settings-company_name').val(), SD.company_name);
        assert.equal(find('.t-settings-company_code').val(), SD.company_code);
        assert.equal(find('.t-settings-dashboard_text').val(), SD.dashboard_text);
        assert.equal(find('.t-settings-login_grace').val(), SD.login_grace);
        assert.equal(find('.t-settings-modules').val(), SD.modules);
        assert.equal(find('.t-settings-test_mode').prop('checked'), SD.test_mode);
        assert.equal(find('.t-settings-test_contractor_email').val(), SD.test_contractor_email);
        assert.equal(find('.t-settings-test_contractor_phone').val(), SD.test_contractor_phone);
        assert.equal(find('.t-settings-dt_start_key').val(), SD.dt_start_key);
    });
    fillIn('.t-settings-company_code', SD.company_codeOther);
    fillIn('.t-settings-company_name', SD.company_nameOther);
    fillIn('.t-settings-dashboard_text', SD.dashboard_textOther);
    fillIn('.t-settings-login_grace', SD.login_graceOther);
    fillIn('.t-settings-modules', SD.modulesOther);
    page.test_modeClick();
    fillIn('.t-settings-test_contractor_email', SD.test_contractor_emailOther);
    fillIn('.t-settings-test_contractor_phone', SD.test_contractor_phoneOther);
    fillIn('.t-settings-dt_start_key', SD.dt_start_keyOther);
    andThen(() => {
        let setting = store.find('setting', SD.id);
        assert.equal(setting.get('company_name'), SD.company_nameOther);
        assert.equal(setting.get('company_code'), SD.company_codeOther);
        assert.equal(setting.get('dashboard_text'), SD.dashboard_textOther);
        assert.equal(setting.get('login_grace'), SD.login_graceOther);
        assert.equal(setting.get('modules'), SD.modulesOther);
        assert.equal(setting.get('test_mode'), SD.test_modeOther);
        assert.equal(setting.get('test_contractor_email'), SD.test_contractor_emailOther);
        assert.equal(setting.get('test_contractor_phone'), SD.test_contractor_phoneOther);
        assert.equal(setting.get('dt_start_key'), SD.dt_start_keyOther);
        // dirty tracking
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
        assert.equal(getLabelText('dashboard_text'), translations['admin.setting.dashboard_text']);
        assert.equal(getLabelText('login_grace'), translations['admin.setting.login_grace']);
        assert.equal(getLabelText('company_name'), translations['admin.setting.company_name']);
    });
});

test('general settings are properly dirty tracked', function(assert) {
    visit(DETAIL_URL);
    andThen(() => {
        let setting = store.find('setting', SD.id);
        assert.ok(setting.get('isNotDirty'));
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-settings-company_code').val(), SD.company_code);
    });
    fillIn('.t-settings-company_code', SD.company_codeOther);
    andThen(() => {
        assert.equal(find('.t-settings-company_code').val(), SD.company_codeOther);
        let setting = store.find('setting', SD.id);
        assert.ok(setting.get('isDirty'));
    });
    fillIn('.t-settings-company_code', SD.company_code);
    andThen(() => {
        let setting = store.find('setting', SD.id);
        assert.ok(setting.get('isNotDirty'));
    });
});
