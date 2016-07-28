import Ember from 'ember';
const { run } = Ember;
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import { test } from 'qunit';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import <%= FirstCharacterModuleName %>D from 'bsrs-ember/vendor/defaults/<%= dasherizedModuleName %>';
import <%= FirstCharacterModuleName %>F from 'bsrs-ember/vendor/<%= dasherizedModuleName %>_fixtures';
import <%= SecondModelSingleCharacter %>F from 'bsrs-ember/vendor/<%= secondModel %>_fixtures';
import config from 'bsrs-ember/config/environment';
import page from 'bsrs-ember/tests/pages/<%= dasherizedModuleName %>-mobile';
import <%= camelizedModuleName %>page from 'bsrs-ember/tests/pages/<%= dasherizedModuleName %>-mobile';
import generalMobilePage from 'bsrs-ember/tests/pages/general-mobile';
import generalPage from 'bsrs-ember/tests/pages/general';
import pageDrawer from 'bsrs-ember/tests/pages/nav-drawer';
import BASEURLS, { <%= CapitalizeModule %>_URL, <%= CapitalizeModule %>_LIST_URL,, <%= secondModelPluralCaps %>_URL } from 'bsrs-ember/utilities/urls';

var store;

const BASE_URL = BASEURLS.BASE_<%= CapitalizeModule %>_URL;
const DETAIL_URL = `${BASE_URL}/${<%= FirstCharacterModuleName %>D.idOne}`;
const <%= CapitalizeModule %>_PUT_URL = `${<%= CapitalizeModule %>_URL}${<%= FirstCharacterModuleName %>D.idOne}/`;
const <%= secondPropertyTitle %> = '.t-<%= dasherizedModuleName %>-<%= secondProperty %>-select';

moduleForAcceptance('Acceptance | mobile <%= dasherizedModuleName %> detail test', {
  beforeEach() {
    setWidth('mobile');
    store = this.application.__container__.lookup('service:simpleStore');
    xhr(`${<%= CapitalizeModule %>_URL}?page=1`, 'GET', null, {}, 200, <%= FirstCharacterModuleName %>F.list());
    xhr(`${<%= CapitalizeModule %>_URL}${<%= FirstCharacterModuleName %>D.idOne}/`, 'GET', null, {}, 200, <%= FirstCharacterModuleName %>F.detail(<%= FirstCharacterModuleName %>D.idOne));
  },
});

/* jshint ignore:start */

test('can click from admin to <%= dasherizedModuleName %> grid to detail', async assert => {
  await generalPage.visitAdmin();
  assert.equal(currentURL(), BASEURLS.base_admin_url);
  await pageDrawer.clickDrawer();
  await pageDrawer.clickAdmin();
  // ensure this is added to general page object
  await generalPage.click<%= CapFirstLetterModuleName %>s();
  assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
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
  let payload = <%= FirstCharacterModuleName %>F.put({id: <%= FirstCharacterModuleName %>D.idOne});
  xhr(<%= CapitalizeModule %>_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
  await generalMobilePage.mobileActionDropdownClick();
  await generalPage.save();
  assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
});

test('visit mobile detail and update all fields', async assert => {
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  assert.equal(<%= camelizedModuleName %>page.<%= firstPropertyCamel %>Value, <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>One);
  assert.equal(<%= camelizedModuleName %>page.<%= secondProperty %>Input, <%= FirstCharacterModuleName %>D.<%= secondModelDisplaySnake %>);
  // <%= firstProperty %>
  await <%= camelizedModuleName %>page.<%= firstPropertyCamel %>Fill(<%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>Two);
  assert.equal(<%= camelizedModuleName %>page.<%= firstPropertyCamel %>Value, <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>Two);
  // <%= secondProperty %>
  let keyword = 'boy1';
  xhr(`${<%= secondModelPluralCaps %>_URL}<%= secondModelSnake %>__icontains=${keyword}/`, 'GET', null, {}, 200, <%= SecondModelSingleCharacter %>F.search_power_select());
  await selectSearch('.t-<%= dasherizedModuleName %>-<%= secondProperty %>-select', keyword);
  await selectChoose('.t-<%= dasherizedModuleName %>-<%= secondProperty %>-select', keyword);
  assert.equal(<%= camelizedModuleName %>page.<%= secondProperty %>Input, keyword);
  xhr(<%= CapitalizeModule %>_PUT_URL, 'PUT', <%= FirstCharacterModuleName %>F.put({<%= firstPropertySnake %>: <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>Two, <%= secondPropertySnake %>: <%= FirstCharacterModuleName %>D.<%= secondPropertyCamel %>SelectOne}), {}, 200, <%= FirstCharacterModuleName %>F.list());
  await generalMobilePage.mobileActionDropdownClick();
  await generalPage.save()
  assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
});

/* jshint ignore:end */
