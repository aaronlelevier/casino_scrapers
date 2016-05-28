import Ember from 'ember';
import { test } from 'qunit';
import getOwner from '../../../helpers/get-owner';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import config from 'bsrs-ember/config/environment';
// import module from 'bsrs-ember/tests/helpers/module';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import RD from 'bsrs-ember/vendor/defaults/role';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TF from 'bsrs-ember/vendor/ticket_fixtures';

const PREFIX = config.APP.NAMESPACE;
const HOME_URL = '/';
const NAVBAR = '.t-navbar-items';

var application;

moduleForAcceptance('Acceptance | application layout test', {
  beforeEach(assert) {
    // application = startApp();
    xhr(`${PREFIX}/tickets/?status__name=ticket.status.draft`,'GET', null, {}, 200, TF.list(TD.statusSevenId, TD.statusSevenKey));
    assert.deviceLayout = getOwner(this).lookup('service:device/layout');
    let breakpoints = assert.deviceLayout.get('breakpoints');
    let bp = {};
    breakpoints.forEach((point) => {
      bp[point.name] = point.begin + 5;
    });
    assert.deviceLayout.set('width', bp.huge);
  },
  afterEach(assert) {
    assert.deviceLayout = getOwner(this).lookup('service:device/layout');
    let breakpoints = assert.deviceLayout.get('breakpoints');
    let bp = {};
    breakpoints.forEach((point) => {
      bp[point.name] = point.begin + 5;
    });
    Ember.run(() => {
      assert.deviceLayout.set('width', bp.huge);
    });
  }
});

test('navbar and tray have correct items', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    assert.equal(find('.t-tray-items > li').length, 4);
    assert.equal(find(NAVBAR + ' > li').length, 4);
    assert.equal(find(NAVBAR + ' > li:eq(1)').text(), t('modules.tickets.titleShort'));
    assert.equal(find(NAVBAR + ' > li:eq(2)').text(), t('modules.workOrders.titleShort'));
    assert.equal(find(NAVBAR + ' > li:eq(3)').text(), t('modules.invoices.titleShort'));
  });
});

test('current user is set from bootstrap data', function(assert) {
  visit(HOME_URL);
  andThen(() => {
    assert.equal(find('.t-current-user-fullname').text(), 'Donald Trump');
    assert.equal(find('.t-current-user-role').text(), RD.nameOne);
  });
});

test('navigating to unkown route will redirect to dashboard', (assert) => {
  visit('/wat');
  andThen(() => {
    assert.equal(currentURL(), BASEURLS.dashboard_url);
  });
});
