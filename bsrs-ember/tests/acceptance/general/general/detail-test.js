import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import SD from 'bsrs-ember/vendor/defaults/setting';
import SF from 'bsrs-ember/vendor/setting_fixtures';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import TF from 'bsrs-ember/vendor/tenant_fixtures';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import DTDF from 'bsrs-ember/vendor/dtd_fixtures';
import page from 'bsrs-ember/tests/pages/settings';
import generalPage from 'bsrs-ember/tests/pages/general';
import {setting_payload, setting_payload_other, setting_payload_only_change_dt_start} from 'bsrs-ember/tests/helpers/payloads/general-settings';
import {tenant_payload_other} from 'bsrs-ember/tests/helpers/payloads/tenant';
import BSRS_TRANSLATION_FACTORY from 'bsrs-ember/vendor/translation_fixtures';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';

const PREFIX = config.APP.NAMESPACE;
const ADMIN_URL = BASEURLS.base_admin_url;
const BASE_SETTINGS_URL = BASEURLS.base_setting_url;
const DETAIL_URL = BASE_SETTINGS_URL + '/' + SD.id;

var application, store, endpoint, tenant_data, detail_xhr, url, put_url, translations;

module('Acceptance | general settings', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('service:simpleStore');
    endpoint = PREFIX + '/admin/tenant/get/';
    tenant_data = TF.detail();
    detail_xhr = xhr(endpoint, 'GET', null, {}, 200, tenant_data);
    url = `${PREFIX}${DETAIL_URL}/`;
    put_url = `${PREFIX}/admin/tenant/put/`;
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
    assert.equal(page.titleText, t('admin.general.other'));
    assert.equal(page.companyNameValue, TD.company_name);
    assert.equal(page.companyCodeValue, TD.company_code);
    assert.equal(page.dashboardTextValue, TD.dashboard_text);
    assert.equal(page.testmodeChecked(), TD.test_mode);
    assert.equal(page.startDtdInput, TD.dt_start_key);
  });
  fillIn('.t-settings-company_code', TD.company_codeOther);
  fillIn('.t-settings-company_name', TD.company_nameOther);
  fillIn('.t-settings-dashboard_text', TD.dashboard_textOther);
  page.testmodeClick();
  andThen(() => {
    let setting = store.find('tenant', TD.id);
    assert.equal(page.companyNameValue, TD.company_nameOther);
    assert.equal(page.companyCodeValue, TD.company_codeOther);
    assert.equal(page.dashboardTextValue, TD.dashboard_textOther);
    assert.equal(page.testmodeChecked(), TD.test_modeOther);
    assert.equal(page.startDtdInput, TD.dt_start_key);
  });
  xhr(put_url, 'PUT', JSON.stringify(tenant_payload_other), {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), ADMIN_URL);
  });
});

/* jshint ignore:start */
test('change dt_start', async assert => {
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  assert.equal(page.startDtdInput, SD.dt_start_key);
  const param = '1';
  let listResponse = DTDF.list();
  xhr(`/api/dtds/?search=${param}`, 'GET', null, {}, 200, listResponse);
  selectSearch('.t-settings-dt_start-select', param);
  await page.startDtdClickOne();
  assert.equal(page.startDtdInput, listResponse.results[1].key);
  xhr(url, 'PUT', JSON.stringify(setting_payload_only_change_dt_start), {}, 200, {});
  await generalPage.save();
  assert.equal(currentURL(), ADMIN_URL);
  let setting = store.find('setting', SD.id);
  assert.ok(setting.get('isNotDirty'));
});
/* jshint ignore:end */

test('translations - for labels', assert => {
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
    assert.equal(getLabelText('dt_start_id'), translations['admin.setting.dt_start_key']);
  });
});

test('general settings are properly dirty tracked', assert => {
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

test('click cancel on modal, and submit no and will stay on page', assert => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  fillIn('.t-settings-company_code', SD.company_codeOther);
  andThen(() => {
    let setting = store.find('setting', SD.id);
    assert.ok(setting.get('isDirty'));
  });
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
    });
  });
  generalPage.clickModalCancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      let setting = store.find('setting', SD.id);
      assert.ok(setting.get('isDirty'));
    });
  });
});

test('click cancel on modal, and submit yes when dirty in order to rollback', assert => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  fillIn('.t-settings-company_code', SD.company_codeOther);
  andThen(() => {
    let setting = store.find('setting', SD.id);
    assert.ok(setting.get('isDirty'));
  });
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.ok(Ember.$('.ember-modal-dialog'));
    });
  });
  generalPage.clickModalRollback();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), ADMIN_URL);
      let setting = store.find('setting', SD.id);
      assert.ok(!setting.get('isDirty'));
    });
  });
});