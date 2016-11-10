import Ember from 'ember';
const { run } = Ember;
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import { test } from 'qunit';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import { waitFor } from 'bsrs-ember/tests/helpers/utilities';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import TF from 'bsrs-ember/vendor/tenant_fixtures';
import CD from 'bsrs-ember/vendor/defaults/currency';
import CF from 'bsrs-ember/vendor/currency_fixtures';
import config from 'bsrs-ember/config/environment';
import page from 'bsrs-ember/tests/pages/tenant-mobile';
import tenantPage from 'bsrs-ember/tests/pages/tenant';
import generalMobilePage from 'bsrs-ember/tests/pages/general-mobile';
import generalPage from 'bsrs-ember/tests/pages/general';
import pageDrawer from 'bsrs-ember/tests/pages/nav-drawer';
import BASEURLS, { TENANT_URL, TENANT_LIST_URL, CURRENCIES_URL } from 'bsrs-ember/utilities/urls';

var store, list_xhr;

const BASE_URL = BASEURLS.BASE_TENANT_URL;
const DETAIL_URL = `${BASE_URL}/${TD.idOne}`;
const TENANT_PUT_URL = `${TENANT_URL}${TD.idOne}/`;
const Currency = '.t-tenant-currency-select';

moduleForAcceptance('Acceptance | general mobile tenant detail test', {
  beforeEach() {
    setWidth('mobile');
    store = this.application.__container__.lookup('service:simpleStore');
    list_xhr = xhr(`${TENANT_URL}?page=1`, 'GET', null, {}, 200, TF.list());
    xhr(`${TENANT_URL}${TD.idOne}/`, 'GET', null, {}, 200, TF.detail(TD.idOne));
  },
});

/* jshint ignore:start */

test('can click from admin to tenant grid to detail', async assert => {
  await generalPage.visitAdmin();
  assert.equal(currentURL(), BASEURLS.base_admin_url);
  await pageDrawer.clickDrawer();
  await pageDrawer.clickAdmin();
  // ensure this is added to general page object
  await generalPage.clickTenants();
  assert.equal(currentURL(), TENANT_LIST_URL);
  await generalPage.gridItemZeroClick();
  assert.equal(currentURL(), DETAIL_URL);
});

test('can click through component sections and save to redirect to index', async assert => {
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  await generalMobilePage.footerItemTwoClick();
  assert.ok(Ember.$('.t-mobile-footer-item:eq(1)').hasClass('active'));
  await generalMobilePage.footerItemOneClick();
  assert.ok(Ember.$('.t-mobile-footer-item:eq(0)').hasClass('active'));
  let payload = TF.put({id: TD.idOne});
  xhr(TENANT_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
  await generalPage.save();
  assert.equal(currentURL(), TENANT_LIST_URL);
});

test('visit mobile detail and update all fields', async assert => {
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  assert.equal(tenantPage.companyNameValue, TD.companyNameOne);
  assert.equal(tenantPage.currencyInput, TD.name);
  // company_name
  await tenantPage.companyNameFill(TD.companyNameTwo);
  assert.equal(tenantPage.companyNameValue, TD.companyNameTwo);
  // currency
  await selectChoose('.t-currency-select', CD.nameEuro);
  assert.equal(tenantPage.currencyInput, CD.nameEuro);
  xhr(TENANT_PUT_URL, 'PUT', TF.put({company_name: TD.companyNameTwo, default_currency: CD.idEuro}), {}, 200, TF.list());
  await generalPage.save()
  assert.equal(currentURL(), TENANT_LIST_URL);
});

test('when user changes an attribute and clicks cancel, we prompt them with a modal and they hit cancel', async assert => {
  clearxhr(list_xhr);
  await page.visitDetail();
  await tenantPage.companyNameFill(TD.companyNameTwo);
  assert.equal(tenantPage.companyNameValue, TD.companyNameTwo);
  await generalMobilePage.backButtonClick();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
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
      assert.equal(tenantPage.companyNameValue, TD.companyNameTwo);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('when user changes an attribute and clicks cancel, we prompt them with a modal and they hit rollback', async assert => {
  await page.visitDetail();
  await tenantPage.companyNameFill(TD.companyNameTwo);
  assert.equal(tenantPage.companyNameValue, TD.companyNameTwo);
  await generalMobilePage.backButtonClick();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
    });
  });
  generalPage.clickModalRollback();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), TENANT_LIST_URL);
      const tenant = store.find('tenant', TD.idOne);
      assert.notEqual(tenant.get('company_name'), 'wat');
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

// /* jshint ignore:end */
