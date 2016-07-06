import Ember from 'ember';
import { test } from 'qunit';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import module from 'bsrs-ember/tests/helpers/module';
import config from 'bsrs-ember/config/environment';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import RD from 'bsrs-ember/vendor/defaults/role';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import pageDrawer from 'bsrs-ember/tests/pages/nav-drawer';

const PREFIX = config.APP.NAMESPACE;
const HOME_URL = '/';
const NAVBAR = '.t-navbar-items';
const DASHBOARD_URL = BASEURLS.dashboard_url;

let application;

module('aaron Acceptance | application layout mobile test', {
  beforeEach(assert) {
    application = startApp();
    assert.deviceLayout = application.__container__.lookup('service:device/layout');
    let breakpoints = assert.deviceLayout.get('breakpoints');
    let bp = {};
    breakpoints.forEach((point) => {
      bp[point.name] = point.begin + 5;
    });
    assert.deviceLayout.set('width', bp.mobile);
    xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET', null, {}, 200, {settings: {dashboard_text: TD.dashboard_text}});
    xhr(`${PREFIX}/tickets/?status__name=ticket.status.draft`,'GET', null, {}, 200, TF.list(TD.statusSevenId, TD.statusSevenKey));
  },
  afterEach(assert) {
    Ember.run(application, 'destroy');
    assert.deviceLayout = undefined;
  }
});

test('visiting /general/application-layout/application-layout-mobile-test.js', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    assert.equal(currentURL(), BASEURLS.dashboard_url);
    assert.equal(find(NAVBAR + ' > li').length, 1);
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
