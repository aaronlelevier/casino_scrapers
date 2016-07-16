import Ember from 'ember';
const { run } = Ember;
import module from 'bsrs-ember/tests/helpers/module';
import { test } from 'qunit';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import TENANT_DEFAULTS from 'bsrs-ember/vendor/defaults/tenant';
import generalPage from 'bsrs-ember/tests/pages/general';
import pageDrawer from 'bsrs-ember/tests/pages/nav-drawer';
import BASEURLS, { DASHBOARD_URL } from 'bsrs-ember/utilities/urls';

var application, store, dashboard_xhr, flexi, bp;

const NAVBAR = '.t-navbar-items';

module('Acceptance | mobile dashboard test', {
  beforeEach() {
    /* SETUP */
    application = startApp();
    store = application.__container__.lookup('service:simpleStore');
    dashboard_xhr = xhr(`${DASHBOARD_URL}`, 'GET', null, {}, 200, {settings: {dashboard_text: TENANT_DEFAULTS.dashboard_text}});
    /* MOBILE RENDER */
    setWidth('mobile');
  },
  afterEach() {
    Ember.run(application, 'destroy');
  }
});

/* jshint ignore:start */

test('dashboard renders with welcome text and no sidebar', async assert => {
  await generalPage.visitDashboard();
  assert.equal(find('.t-dashboard-text').text().trim(), 'Welcome');
  assert.equal(find('.t-dashboard-text h1').prop('tagName'), 'H1');
  assert.equal(find('.t-side-menu').length, 0);
});

test('visiting dashboard can click on tray and show base modules', async assert => {
  await generalPage.visitDashboard();
  assert.notOk(find('.t-nav-trigger').prop('checked'));
  await pageDrawer.clickDrawer();
  assert.ok(find('.t-nav-trigger').prop('checked'));
  assert.equal(currentURL(), BASEURLS.DASHBOARD_URL);
  assert.equal(find('label > i').attr('class').split(/-/)[2], 'reorder');
  assert.equal(find('li.t-nav-mobile-tray-item:eq(0)').text(), t('modules.tickets.newTickets'));
  assert.equal(find('li.t-nav-mobile-tray-item:eq(1)').text(), t('modules.tickets.openTickets'));
  assert.equal(find('li.t-nav-mobile-tray-item:eq(2)').text(), t('modules.workOrders.overdue'));
  assert.equal(find('li.t-nav-mobile-tray-item:eq(3)').text(), t('admin.approval.other'));
  assert.equal(find('li.t-nav-mobile-tray-item:eq(5)').text(), t('modules.tickets.titleShort'));
  assert.equal(find('li.t-nav-mobile-tray-item:eq(6)').text(), t('modules.workOrders.titleShort'));
  assert.equal(find('li.t-nav-mobile-tray-item:eq(7)').text(), t('modules.invoices.titleShort'));
  assert.equal(find('li.t-nav-mobile-tray-item:eq(8)').text(), t('admin.title'));
  await pageDrawer.clickDrawer();
  assert.notOk(find('.t-nav-trigger').prop('checked'));
});

test('visiting admin-mobile', async assert => {
  await generalPage.visitDashboard();
  assert.notOk(find('.t-nav-trigger').prop('checked'));
  await pageDrawer.clickDrawer();
  assert.ok(find('.t-nav-trigger').prop('checked'));
  await pageDrawer.clickAdmin();
  assert.equal(currentURL(), BASEURLS.ADMIN_MOBILE_URL);
  assert.notOk(find('.t-nav-trigger').prop('checked'));
});

/* jshint ignore:end */
