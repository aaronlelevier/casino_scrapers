import Ember from 'ember';
const { run } = Ember;
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import { test } from 'qunit';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import TENANT_DEFAULTS from 'bsrs-ember/vendor/defaults/tenant';
import generalPage from 'bsrs-ember/tests/pages/general';
import pageDrawer from 'bsrs-ember/tests/pages/nav-drawer';
import BASEURLS, { DASHBOARD_URL } from 'bsrs-ember/utilities/urls';

var store, dashboard_xhr;

const NAVBAR = '.t-navbar-items';

moduleForAcceptance('Acceptance | general mobile dashboard test', {
  beforeEach() {
    setWidth('mobile');
    dashboard_xhr = xhr(`${DASHBOARD_URL}`, 'GET', null, {}, 200, {settings: {dashboard_text: TENANT_DEFAULTS.dashboard_text}});
  },
});

/* jshint ignore:start */

test('dashboard renders with welcome text and no sidebar', async function(assert) {
  await generalPage.visitDashboard();
  assert.equal(find('.t-dashboard-text').text().trim(), 'Welcome');
  assert.equal(find('.t-dashboard-text h1').prop('tagName'), 'H1');
  assert.equal(find('.t-side-menu').length, 0);
});

test('visiting dashboard can click on tray and show base modules', async function(assert) {
  await generalPage.visitDashboard();
  assert.notOk(find('.t-bs-mobile').hasClass('mobile-tray-open'));
  await pageDrawer.clickDrawer();
  assert.ok(find('.t-bs-mobile').hasClass('mobile-tray-open'));
  assert.equal(currentURL(), BASEURLS.DASHBOARD_URL);
  assert.equal(find('li.t-nav-mobile-tray-item:eq(0)').text(), t('modules.tickets.newTickets'));
  assert.equal(find('li.t-nav-mobile-tray-item:eq(1)').text(), t('modules.tickets.openTickets'));
  assert.equal(find('li.t-nav-mobile-tray-item:eq(2)').text(), t('modules.workOrders.overdue'));
  assert.equal(find('li.t-nav-mobile-tray-item:eq(3)').text(), t('admin.approval.other'));
  assert.equal(find('li.t-nav-mobile-tray-item:eq(5)').text(), t('modules.tickets.titleShort'));
  assert.equal(find('li.t-nav-mobile-tray-item:eq(6)').text(), t('modules.workOrders.titleShort'));
  assert.equal(find('li.t-nav-mobile-tray-item:eq(7)').text(), t('modules.invoices.titleShort'));
  assert.equal(find('li.t-nav-mobile-tray-item:eq(8)').text(), t('admin.title'));
  await pageDrawer.clickDrawer();
  assert.notOk(find('.t-bs-mobile').hasClass('mobile-tray-open'));
});

test('visiting admin-mobile', async function(assert) {
  await generalPage.visitDashboard();
  assert.notOk(find('.t-bs-mobile').hasClass('mobile-tray-open'));
  await pageDrawer.clickDrawer();
  assert.ok(find('.t-bs-mobile').hasClass('mobile-tray-open'));
  await pageDrawer.clickAdmin();
  assert.equal(currentURL(), BASEURLS.ADMIN_MOBILE_URL);
  assert.notOk(find('.t-bs-mobile').hasClass('mobile-tray-open'));
});

/* jshint ignore:end */
