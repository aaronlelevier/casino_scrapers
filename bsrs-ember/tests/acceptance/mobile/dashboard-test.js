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
    // run(() => {
    //   flexi.set('width', bp.huge);
    // });
    Ember.run(application, 'destroy');
  }
});

test('dashboard renders with welcome text and no sidebar', assert => {
  generalPage.visitDashboard();
  andThen(() => {
    assert.equal(find('.t-dashboard-text').text().trim(), 'Welcome');
    assert.equal(find('.t-dashboard-text h1').prop('tagName'), 'H1');
    assert.equal(find('.t-side-menu').length, 0);
  });
});

test('visiting dashboard can click on tray and show base modules', function(assert) {
  generalPage.visitDashboard();
  andThen(() => {
    assert.equal(currentURL(), BASEURLS.DASHBOARD_URL);
    assert.equal(find('label > i').attr('class').split(/-/)[2], 'reorder');
    assert.equal(find('li.nav-item:eq(0)').text(), t('modules.tickets.newTickets'));
    assert.equal(find('li.nav-item:eq(1)').text(), t('modules.tickets.openTickets'));
    assert.equal(find('li.nav-item:eq(2)').text(), t('modules.workOrders.overdue'));
    assert.equal(find('li.nav-item:eq(3)').text(), t('admin.approval.other'));
    assert.equal(find('li.nav-item:eq(5)').text(), t('modules.tickets.titleShort'));
    assert.equal(find('li.nav-item:eq(6)').text(), t('modules.workOrders.titleShort'));
    assert.equal(find('li.nav-item:eq(7)').text(), t('modules.invoices.titleShort'));
    assert.equal(find('li.nav-item:eq(8)').text(), t('admin.title'));
    assert.notOk(find('.t-nav-trigger').prop('checked'));
  });
  pageDrawer.clickDrawer();
  andThen(() => {
    assert.ok(find('.t-nav-trigger').prop('checked'));
  });
  pageDrawer.clickDrawer();
  andThen(() => {
    assert.notOk(find('.t-nav-trigger').prop('checked'));
  });
});
