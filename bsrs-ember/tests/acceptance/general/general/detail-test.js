import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/utilities/urls';
import CD from 'bsrs-ember/vendor/defaults/currencies';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import TF from 'bsrs-ember/vendor/tenant_fixtures';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import DTDF from 'bsrs-ember/vendor/dtd_fixtures';
import page from 'bsrs-ember/tests/pages/settings';
import generalPage from 'bsrs-ember/tests/pages/general';
import inputCurrencyPage from 'bsrs-ember/tests/pages/input-currency';
import {tenant_payload_other, tenant_payload_other_only_change_start} from 'bsrs-ember/tests/helpers/payloads/tenant';
import BSRS_TRANSLATION_FACTORY from 'bsrs-ember/vendor/translation_fixtures';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';

const PREFIX = config.APP.NAMESPACE;
const ADMIN_URL = BASEURLS.base_admin_url;
const BASE_SETTINGS_URL = BASEURLS.base_setting_url;
const DETAIL_URL = BASE_SETTINGS_URL + '/' + TD.id;

var application, store, tenant_data, detail_xhr, url, translations;

moduleForAcceptance('Acceptance | general settings (tenant)', {
  beforeEach() {
    
    store = this.application.__container__.lookup('service:simpleStore');
    url = `${PREFIX}/admin/tenant/${TD.id}/`;
    tenant_data = TF.detail();
    detail_xhr = xhr(url, 'GET', null, {}, 200, tenant_data);
    translations = BSRS_TRANSLATION_FACTORY.generate('en')['en'];
  },
  afterEach() {
    
  }
});

test('from admin click general-settings link, and go to general settings page', assert => {
  visit(BASEURLS.base_admin_url);
  andThen(() => {
    assert.equal(currentURL(), BASEURLS.base_admin_url);
  });
  generalPage.clickGeneralSettingsLink();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
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
    assert.equal(inputCurrencyPage.currencyCodeSelectText, CD.code);
  });
  fillIn('.t-settings-company_code', TD.company_codeOther);
  fillIn('.t-settings-company_name', TD.company_nameOther);
  fillIn('.t-settings-dashboard_text', TD.dashboard_textOther);
  page.testmodeClick();
  selectChoose('.t-currency-code', CD.codeCAD);
  andThen(() => {
    let setting = store.find('tenant', TD.id);
    assert.equal(page.companyNameValue, TD.company_nameOther);
    assert.equal(page.companyCodeValue, TD.company_codeOther);
    assert.equal(page.dashboardTextValue, TD.dashboard_textOther);
    assert.equal(page.testmodeChecked(), TD.test_modeOther);
    assert.equal(page.startDtdInput, TD.dt_start_key);
    assert.equal(inputCurrencyPage.currencyCodeSelectText, CD.codeCAD);
  });
  xhr(url, 'PUT', JSON.stringify(tenant_payload_other), {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), ADMIN_URL);
  });
});

/* jshint ignore:start */
test('change dt_start', async assert => {
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  assert.equal(page.startDtdInput, TD.dt_start_key);
  const param = '1';
  let listResponse = DTDF.list();
  xhr(`/api/dtds/?search=${param}`, 'GET', null, {}, 200, listResponse);
  selectSearch('.t-settings-dt_start-select', param);
  await page.startDtdClickOne();
  assert.equal(page.startDtdInput, listResponse.results[1].key);
  xhr(url, 'PUT', JSON.stringify(tenant_payload_other_only_change_start), {}, 200, {});
  await generalPage.save();
  assert.equal(currentURL(), ADMIN_URL);
});
/* jshint ignore:end */

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
  fillIn('.t-settings-company_code', TD.company_codeOther);
  andThen(() => {
    let tenant = store.find('tenant', TD.id);
    assert.ok(tenant.get('isDirty'));
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
      let tenant = store.find('tenant', TD.id);
      assert.ok(tenant.get('isDirty'));
    });
  });
});

test('click cancel on modal, and submit yes when dirty in order to rollback', assert => {
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
  fillIn('.t-settings-company_code', TD.company_codeOther);
  andThen(() => {
    let tenant = store.find('tenant', TD.id);
    assert.ok(tenant.get('isDirty'));
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
      let tenant = store.find('tenant', TD.id);
      assert.ok(!tenant.get('isDirty'));
    });
  });
});