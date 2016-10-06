import Ember from 'ember';
const { run } = Ember;
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import { test } from 'qunit';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import TF from 'bsrs-ember/vendor/tenant_fixtures';
import CD from 'bsrs-ember/vendor/defaults/currency';
import CF from 'bsrs-ember/vendor/currency_fixtures';
import config from 'bsrs-ember/config/environment';
import page from 'bsrs-ember/tests/pages/tenant-mobile';
import tenantpage from 'bsrs-ember/tests/pages/tenant-mobile';
import generalMobilePage from 'bsrs-ember/tests/pages/general-mobile';
import generalPage from 'bsrs-ember/tests/pages/general';
import pageDrawer from 'bsrs-ember/tests/pages/nav-drawer';
import BASEURLS, { TENANT_URL, TENANT_LIST_URL, CURRENCIES_URL } from 'bsrs-ember/utilities/urls';

var store;

const BASE_URL = BASEURLS.BASE_TENANT_URL;
const DETAIL_URL = `${BASE_URL}/${TD.idOne}`;
const TENANT_PUT_URL = `${TENANT_URL}${TD.idOne}/`;
const Currency = '.t-tenant-currency-select';

// TODO: (ayl) there is no tenant-single/~layouts/mobile.hbs
// once it's added, add back these tests

// moduleForAcceptance('Acceptance | mobile tenant detail test', {
//   beforeEach() {
//     setWidth('mobile');
//     store = this.application.__container__.lookup('service:simpleStore');
//     xhr(`${TENANT_URL}?page=1`, 'GET', null, {}, 200, TF.list());
//     xhr(`${TENANT_URL}${TD.idOne}/`, 'GET', null, {}, 200, TF.detail(TD.idOne));
//   },
// });

// /* jshint ignore:start */

// test('can click from admin to tenant grid to detail', async assert => {
//   await generalPage.visitAdmin();
//   assert.equal(currentURL(), BASEURLS.base_admin_url);
//   await pageDrawer.clickDrawer();
//   await pageDrawer.clickAdmin();
//   // ensure this is added to general page object
//   await generalPage.clickTenants();
//   assert.equal(currentURL(), TENANT_LIST_URL);
//   await generalPage.gridItemZeroClick();
//   assert.equal(currentURL(), DETAIL_URL);
// });

// test('can click through component sections and save to redirect to index', async assert => {
//   await page.visitDetail();
//   assert.equal(currentURL(), DETAIL_URL);
//   await generalMobilePage.footerItemTwoClick();
//   assert.ok(Ember.$('.t-mobile-footer-item:eq(1)').hasClass('active'));
//   await generalMobilePage.footerItemOneClick();
//   assert.ok(Ember.$('.t-mobile-footer-item:eq(0)').hasClass('active'));
//   let payload = TF.put({id: TD.idOne});
//   xhr(TENANT_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
//   await generalMobilePage.mobileActionDropdownClick();
//   await generalPage.save();
//   assert.equal(currentURL(), TENANT_LIST_URL);
// });

// test('visit mobile detail and update all fields', async assert => {
//   await page.visitDetail();
//   assert.equal(currentURL(), DETAIL_URL);
//   assert.equal(tenantpage.companyNameValue, TD.companyNameOne);
//   assert.equal(tenantpage.currencyInput, TD.name);
//   // company_name
//   await tenantpage.companyNameFill(TD.companyNameTwo);
//   assert.equal(tenantpage.companyNameValue, TD.companyNameTwo);
//   // currency
//   let keyword = 'Boy1';
//   xhr(`${CURRENCIES_URL}currency__icontains=${keyword}/`, 'GET', null, {}, 200, CF.search_power_select());
//   await selectSearch('.t-tenant-currency-select', keyword);
//   await selectChoose('.t-tenant-currency-select', keyword);
//   assert.equal(tenantpage.currencyInput, CD.nameBoy);
//   xhr(TENANT_PUT_URL, 'PUT', TF.put({company_name: TD.companyNameTwo, currency: TD.currencySelectOne}), {}, 200, TF.list());
//   await generalMobilePage.mobileActionDropdownClick();
//   await generalPage.save()
//   assert.equal(currentURL(), TENANT_LIST_URL);
// });

// /* jshint ignore:end */
