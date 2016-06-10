import Ember from 'ember';
import { test } from 'qunit';
import getOwner from '../../../helpers/get-owner';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import config from 'bsrs-ember/config/environment';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import RD from 'bsrs-ember/vendor/defaults/role';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import SD from 'bsrs-ember/vendor/defaults/setting';

const PREFIX = config.APP.NAMESPACE;
const HOME_URL = '/';
const NAVBAR = '.t-navbar-items';
const DASHBOARD_URL = BASEURLS.dashboard_url;

var application;

module('Acceptance | application layout test', {
  beforeEach(assert) {
    application = startApp();
    xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET', null, {}, 200, {settings: {dashboard_text: SD.dashboard_text}});
    xhr(`${PREFIX}/tickets/?status__name=ticket.status.draft`,'GET', null, {}, 200, TF.list(TD.statusSevenId, TD.statusSevenKey));
  },
  afterEach(assert) {
    Ember.run(application, 'destroy');
  }
});

// test('navbar and tray have correct items', function(assert) {
//   visit(HOME_URL);
//   andThen(() => {
//     assert.equal(find('.t-tray-items > li').length, 4);
//     assert.equal(find(NAVBAR + ' > li').length, 4);
//     assert.equal(find(NAVBAR + ' > li:eq(1)').text(), t('modules.tickets.titleShort'));
//     assert.equal(find(NAVBAR + ' > li:eq(2)').text(), t('modules.workOrders.titleShort'));
//     assert.equal(find(NAVBAR + ' > li:eq(3)').text(), t('modules.invoices.titleShort'));
//   });
// });

// test('current user is set from bootstrap data', function(assert) {
//   visit(HOME_URL);
//   andThen(() => {
//     assert.equal(find('.t-current-user-fullname').text(), 'Donald Trump');
//     assert.equal(find('.t-current-user-role').text(), RD.nameOne);
//   });
// });

test('navigating to unkown route will redirect to dashboard', (assert) => {
  visit('/wat');
  andThen(() => {
    assert.equal(currentURL(), DASHBOARD_URL);
  });
});
