import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import SD from 'bsrs-ember/vendor/defaults/setting';
import SF from 'bsrs-ember/vendor/setting_fixtures';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import DTDF from 'bsrs-ember/vendor/dtd_fixtures';
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

test('general settings title and fields populated correctly', assert => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(page.titleText, t(setting_data.title));
        assert.equal(page.companyNameValue, SD.company_name);
        assert.equal(page.companyCodeValue, SD.company_code);
        assert.equal(page.dashboardTextValue, SD.dashboard_text);
        assert.equal(page.loginGraceValue, SD.login_grace);
        assert.equal(page.modulesTicketsChecked(), SD.modules.tickets);
        assert.equal(page.modulesWorkordersChecked(), SD.modules.work_orders);
        assert.equal(page.modulesInvoicesChecked(), SD.modules.invoices);
        assert.equal(page.testmodeChecked(), SD.test_mode);
        assert.equal(page.testContractorEmailValue, SD.test_contractor_email);
        assert.equal(page.testContractorPhoneValue, SD.test_contractor_phone);
        assert.equal(page.startDtdInput, SD.dt_start_key);
    });
    fillIn('.t-settings-company_code', SD.company_codeOther);
    fillIn('.t-settings-company_name', SD.company_nameOther);
    fillIn('.t-settings-dashboard_text', SD.dashboard_textOther);
    fillIn('.t-settings-login_grace', SD.login_graceOther);
    page.modulesTicketsClick();
    page.modulesWorkordersClick();
    page.modulesInvoicesClick();
    page.testmodeClick();
    fillIn('.t-settings-test_contractor_email', SD.test_contractor_emailOther);
    fillIn('.t-settings-test_contractor_phone', SD.test_contractor_phoneOther);
    const param = 's';
    xhr(`/api/dtds/?search=${param}`, 'GET', null, {}, 200, DTDF.list());
    page.startDtdClickDropdown();
    andThen(() => {
        fillIn('.ember-power-select-search input', param);
    });
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(page.startDtdTextOne, DTD.keyTwoGrid);
    });
    page.startDtdClickOne();
    andThen(() => {
        let setting = store.find('setting', SD.id);
        assert.equal(setting.get('company_name'), SD.company_nameOther);
        assert.equal(setting.get('company_code'), SD.company_codeOther);
        assert.equal(setting.get('dashboard_text'), SD.dashboard_textOther);
        assert.equal(setting.get('login_grace'), SD.login_graceOther);
        assert.equal(page.modulesTicketsChecked(), SD.modulesOther.tickets);
        assert.equal(page.modulesWorkordersChecked(), SD.modulesOther.work_orders);
        assert.equal(page.modulesInvoicesChecked(), SD.modulesOther.invoices);
        assert.equal(setting.get('test_mode'), SD.test_modeOther);
        assert.equal(setting.get('test_contractor_email'), SD.test_contractor_emailOther);
        assert.equal(setting.get('test_contractor_phone'), SD.test_contractor_phoneOther);
        assert.equal(page.startDtdInput, DTD.keyTwoGrid);
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
        assert.equal(getLabelText('company_name'), translations['admin.setting.company_name']);
        assert.equal(getLabelText('company_code'), translations['admin.setting.company_code']);
        assert.equal(getLabelText('dashboard_text'), translations['admin.setting.dashboard_text']);
        assert.equal(getLabelText('login_grace'), translations['admin.setting.login_grace']);
        assert.equal(getLabelText('modules'), translations['admin.setting.modules']);
        assert.equal(page.modulesTicketsLabelText, translations['admin.setting.modules.tickets']);
        assert.equal(page.modulesWorkordersLabelText, translations['admin.setting.modules.work_orders']);
        assert.equal(page.modulesInvoicesLabelText, translations['admin.setting.modules.invoices']);
        assert.equal(page.testmodelLableText, translations['admin.setting.test_mode']);
        assert.equal(getLabelText('test_contractor_email'), translations['admin.setting.test_contractor_email']);
        assert.equal(getLabelText('test_contractor_phone'), translations['admin.setting.test_contractor_phone']);
        assert.equal(getLabelText('dt_start_id'), translations['admin.setting.dt_start_id']);
    });
});

test('general settings are properly dirty tracked', function(assert) {
    visit(DETAIL_URL);
    andThen(() => {
        let setting = store.find('setting', SD.id);
        assert.ok(setting.get('isNotDirty'));
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(page.companyCodeValue, SD.company_code);
    });
    fillIn('.t-settings-company_code', SD.company_codeOther);
    andThen(() => {
        assert.equal(page.companyCodeValue, SD.company_codeOther);
        let setting = store.find('setting', SD.id);
        assert.ok(setting.get('isDirty'));
    });
    fillIn('.t-settings-company_code', SD.company_code);
    andThen(() => {
        let setting = store.find('setting', SD.id);
        assert.ok(setting.get('isNotDirty'));
    });
});

test('no delete button on dropdown', assert => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
    page.deleteDropdownClick();
    andThen(() => {
        assert.equal(find('.t-delete-btn').text(), "");
    });
});
