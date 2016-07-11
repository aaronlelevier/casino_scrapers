import Ember from 'ember';
import module from 'bsrs-ember/tests/helpers/module';
import { test } from 'qunit';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import { waitFor } from 'bsrs-ember/tests/helpers/utilities';
import { ticket_payload_with_comment } from 'bsrs-ember/tests/helpers/payloads/ticket';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import PF from 'bsrs-ember/vendor/people_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import PD from 'bsrs-ember/vendor/defaults/person';
import TA_FIXTURES from 'bsrs-ember/vendor/ticket_activity_fixtures';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import page from 'bsrs-ember/tests/pages/ticket-mobile';
import ticketPage from 'bsrs-ember/tests/pages/tickets';
import generalMobilePage from 'bsrs-ember/tests/pages/general-mobile';
import generalPage from 'bsrs-ember/tests/pages/general';

var application, store, endpoint, list_xhr, activity;

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = `${BASE_URL}/index`;
const DETAIL_URL = `${BASE_URL}/index/${TD.idOne}`;
const ASSIGNEE = '.t-ticket-assignee-select';
const TICKET_PUT_URL = `${PREFIX}${BASE_URL}/${TD.idOne}/`;
const ACTIVITY_ITEMS = '.t-activity-list-item';

module('Acceptance | mobile ticket detail test', {
  beforeEach() {
    /* SETUP */
    application = startApp();
    store = application.__container__.lookup('service:simpleStore');
    endpoint = PREFIX + BASE_URL;
    list_xhr = xhr(endpoint+'/?page=1', 'GET', null, {}, 200, TF.list());
    endpoint = `${PREFIX}${BASE_URL}/`;
    xhr(`${endpoint}${TD.idOne}/`, 'GET', null, {}, 200, TF.detail(TD.idOne));
    activity = xhr(`${endpoint}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.empty());
    /* MOBILE RENDER */
    const flexi = application.__container__.lookup('service:device/layout');
    const breakpoints = flexi.get('breakpoints');
    const bp = {};
    breakpoints.forEach((point) => {
      bp[point.name] = point.begin + 5;
    });
    flexi.set('width', bp.mobile);
  },
  afterEach() {
    Ember.run(application, 'destroy');
  }
});

/* jshint ignore:start */

test('can click to detail, show activities, and go back to list', async assert => {
  clearxhr(activity);
  xhr(`${endpoint}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.assignee_only());
  await ticketPage.visit();
  assert.equal(currentURL(), TICKET_URL);
  await click('.t-grid-data:eq(0)')
  assert.equal(currentURL(), DETAIL_URL);
  const ticket = store.find('ticket', TD.idOne);
  assert.equal(find('.t-detail-title').text(), `#${ticket.get('number')}`);
  assert.equal(find(`${ACTIVITY_ITEMS}`).length, 2);
  await generalMobilePage.backButtonClick();
  assert.equal(currentURL(), TICKET_URL);
});

test('can update fields and save', async assert => {
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  const ticket = store.find('ticket', TD.idOne);
  assert.equal(find('.t-detail-title').text(), `#${ticket.get('number')}`);
  assert.equal(find('.t-mobile-ticket-activity-section').length, 1);
  await click('.t-mobile-footer-item:eq(1)');
  assert.equal(find('.t-mobile-ticket-detail-section').length, 1);
  xhr(`${PREFIX}/admin/people/person__icontains=b/`, 'GET', null, {}, 200, PF.search_power_select());
  selectSearch(ASSIGNEE, 'b');
  selectChoose(ASSIGNEE, PD.fullnameBoy);
  await generalMobilePage.mobileActionDropdownClick();
  let response_put = TF.detail(TD.idOne);
  response_put.assignee = {id: PD.idBoy, first_name: PD.nameBoy};
  let payload = TF.put({id: TD.idOne, assignee: PD.idBoy});
  xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, response_put);
  await generalPage.save()
  assert.equal(currentURL(), TICKET_URL);
  assert.equal(ticket.get('assignee').get('id'), PD.idBoy);
});

test('when user changes an attribute and clicks cancel, we prompt them with a modal and they hit cancel', async assert => {
  await page.visitDetail();
  await click('.t-mobile-footer-item:eq(1)');
  await page.requestFillIn('wat');
  assert.equal(page.request, 'wat');
  await generalMobilePage.backButtonClick();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      // assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      // assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      // assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      // assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
    });
  });
  // generalPage.clickModalCancel();
  // andThen(() => {
  //   waitFor(assert, () => {
  //     assert.equal(currentURL(), DETAIL_URL);
  //     assert.equal(page.priorityInput, TD.priorityTwo);
  //     assert.throws(Ember.$('.ember-modal-dialog'));
  //   });
  // });
});

test('can add comment and click update to show new activity', async assert => {
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  await ticketPage.commentFillIn(TD.commentOne);
  assert.equal(ticketPage.comment, TD.commentOne);
  let response = TF.detail(TD.idOne);
  xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(ticket_payload_with_comment), {}, 200, response);
  ajax(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.comment_only());
  await ticketPage.update();
  assert.equal(currentURL(), DETAIL_URL);
  const ticket = store.find('ticket', TD.idOne);
  assert.equal(ticket.get('comment'), '');
  assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
  assert.equal(find(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} commented 4 months ago ${TD.commentOne}`);
});

/* jshint ignore:end */