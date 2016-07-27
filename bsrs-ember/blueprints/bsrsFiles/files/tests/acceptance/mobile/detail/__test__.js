import Ember from 'ember';
const { run } = Ember;
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import { test } from 'qunit';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import <%= camelizedModuleName %>D from 'bsrs-ember/vendor/defaults/<%= dasherizedModuleName %>';
import <%= camelizedModuleName %>F from 'bsrs-ember/vendor/<%= dasherizedModuleName %>_fixtures';
import <%= secondModelTitle %>F from 'bsrs-ember/vendor/<%= secondModelPlural %>_fixtures';
import config from 'bsrs-ember/config/environment';
import page from 'bsrs-ember/tests/pages/<%= dasherizedModuleName %>-mobile';
import generalMobilePage from 'bsrs-ember/tests/pages/general-mobile';
import generalPage from 'bsrs-ember/tests/pages/general';
import pageDrawer from 'bsrs-ember/tests/pages/nav-drawer';
import BASEURLS, { <%= CapitalizeModule %>_URL, <%= secondModelPluralCaps %>_URL } from 'bsrs-ember/utilities/urls';

var store;

const BASE_URL = BASEURLS.base_people_url;
const <%= CapitalizeModule %>_INDEX_URL = `${BASE_URL}/index`;
const DETAIL_URL = `${BASE_URL}/${<%= camelizedModuleName %>D.idOne}`;
const <%= CapitalizeModule %>_PUT_URL = `${<%= CapitalizeModule %>_URL}${<%= camelizedModuleName %>D.idOne}/`;
const <%= secondPropertyTitle %> = '.t-<%= dasherizedModuleName %>-<%= secondProperty %>-select';

moduleForAcceptance('Acceptance | mobile <%= dasherizedModuleName %> detail test', {
  beforeEach() {
    setWidth('mobile');
    store = this.application.__container__.lookup('service:simpleStore');
    xhr(`${<%= CapitalizeModule %>_URL}?page=1`, 'GET', null, {}, 200, <%= camelizedModuleName %>F.list());
    xhr(`${<%= CapitalizeModule %>_URL}${<%= camelizedModuleName %>D.idOne}/`, 'GET', null, {}, 200, <%= camelizedModuleName %>F.detail(<%= camelizedModuleName %>D.idOne));
  },
});

/* jshint ignore:start */

test('can click from admin to <%= dasherizedModuleName %> grid to detail', async assert => {
  await generalPage.visitAdmin();
  assert.equal(currentURL(), BASEURLS.base_admin_url);
  await pageDrawer.clickDrawer();
  await pageDrawer.clickAdmin();
  await generalPage.click<%= CapFirstLetterModuleName %>();
  assert.equal(currentURL(), <%= CapitalizeModule %>_INDEX_URL);
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
  let payload = <%= camelizedModuleName %>F.put({id: <%= camelizedModuleName %>D.idOne});
  xhr(<%= CapitalizeModule %>_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
  await generalMobilePage.mobileActionDropdownClick();
  await generalPage.save();
  assert.equal(currentURL(), <%= CapitalizeModule %>_INDEX_URL);
});

test('visit mobile detail and update all fields', async assert => {
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  assert.equal(page.<%= firstPropertyCamel %>Value, <%= camelizedModuleName %>D.<%= firstPropertyCamel %>One);
  assert.equal(page.<%= secondProperty %>Input, <%= camelizedModuleName %>D.<%= secondModelDisplaySnake %>);
  // <%= firstProperty %>
  await page.<%= firstPropertyCamel %>Fill(<%= camelizedModuleName %>D.<%= firstPropertyCamel %>Two);
  assert.equal(page.<%= firstPropertyCamel %>Value, <%= camelizedModuleName %>D.<%= firstPropertyCamel %>Two);
  // <%= secondProperty %>
  let keyword = 'boy1';
  xhr(`${<%= secondModelPluralCaps %>_URL}<%= secondModelSnake %>__icontains=${keyword}/`, 'GET', null, {}, 200, <%= secondModelTitle %>F.search_power_select());
  await selectSearch('.t-<%= dasherizedModuleName %>-<%= secondProperty %>-select', keyword);
  await selectChoose('.t-<%= dasherizedModuleName %>-<%= secondProperty %>-select', keyword);
  assert.equal(page.<%= secondProperty %>Input, keyword);
  xhr(API_DETAIL_URL, 'PUT', <%= camelizedModuleName %>F.put({<%= camelizedModuleName %>D.<%= firstPropertyCamel %>Two, <%= camelizedModuleName %>D.<%= secondPropertyCamel %>SelectOne}), {}, 200, <%= camelizedModuleName %>F.list());
  await generalMobilePage.mobileActionDropdownClick();
  await generalPage.save()
  assert.equal(currentURL(), LIST_URL);
});

/* jshint ignore:end */
