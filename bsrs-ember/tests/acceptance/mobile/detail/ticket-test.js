import Ember from 'ember';
const { get, run } = Ember;
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import { test } from 'qunit';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import { waitFor } from 'bsrs-ember/tests/helpers/utilities';
import { ticket_payload_with_comment } from 'bsrs-ember/tests/helpers/payloads/ticket';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import PF from 'bsrs-ember/vendor/people_fixtures';
import LF from 'bsrs-ember/vendor/location_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import PD from 'bsrs-ember/vendor/defaults/person';
import LD from 'bsrs-ember/vendor/defaults/location';
import CF from 'bsrs-ember/vendor/category_fixtures';
import CD from 'bsrs-ember/vendor/defaults/category';
import TA_FIXTURES from 'bsrs-ember/vendor/ticket_activity_fixtures';
import config from 'bsrs-ember/config/environment';
import page from 'bsrs-ember/tests/pages/ticket-mobile';
import ticketPage from 'bsrs-ember/tests/pages/tickets';
import generalMobilePage from 'bsrs-ember/tests/pages/general-mobile';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { TICKETS_URL, PEOPLE_URL, CATEGORIES_URL, LOCATIONS_URL } from 'bsrs-ember/utilities/urls';

var store, list_xhr, activity;

const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = `${BASE_URL}/index`;
const DETAIL_URL = `${BASE_URL}/${TD.idOne}`;
const ASSIGNEE = '.t-ticket-assignee-select';
const CC = '.t-ticket-cc-select';
const LOCATION = '.t-ticket-location-select';
const TICKET_PUT_URL = `${TICKETS_URL}${TD.idOne}/`;
const ACTIVITY_ITEMS = '.t-activity-list-item';

moduleForAcceptance('Acceptance | mobile ticket detail test', {
  beforeEach() {
    /* SETUP */
    setWidth('mobile');
    store = this.application.__container__.lookup('service:simpleStore');
    list_xhr = xhr(`${TICKETS_URL}?page=1`, 'GET', null, {}, 200, TF.list());
    xhr(`${TICKETS_URL}${TD.idOne}/`, 'GET', null, {}, 200, TF.detail(TD.idOne));
    activity = xhr(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.empty());
  },
});

/* jshint ignore:start */

test('can click to detail, show activities, and go back to list', async assert => {
  clearxhr(activity);
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.assignee_only());
  await ticketPage.visit();
  assert.equal(currentURL(), TICKET_URL);
  await click('.t-grid-data:eq(0)');
  assert.equal(currentURL(), DETAIL_URL);
  const ticket = store.find('ticket', TD.idOne);
  assert.equal(find('.t-detail-title').text(), `#${ticket.get('number')}`);
  assert.equal(find('[data-test-id="priority-tag"]').text().trim(), t(ticket.get('priority').get('name')));
  assert.equal(find('[data-test-id="status-tag"]').text().trim(), t(ticket.get('status').get('name')));
  assert.ok(find('[data-test-id="created-tag"]').text().trim().includes(ticket.get('assignee.fullname')));
  assert.equal(find(`${ACTIVITY_ITEMS}`).length, 2);
  await generalMobilePage.backButtonClick();
  assert.equal(currentURL(), TICKET_URL);
});

test('can click through component sections and save to redirect to index', async assert => {
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  await generalMobilePage.footerItemThreeClick();
  assert.ok(Ember.$('.t-mobile-footer-item:eq(2)').hasClass('active'));
  await generalMobilePage.footerItemTwoClick();
  assert.ok(Ember.$('.t-mobile-footer-item:eq(1)').hasClass('active'));
  await generalMobilePage.footerItemOneClick();
  assert.ok(Ember.$('.t-mobile-footer-item:eq(0)').hasClass('active'));
  const payload = TF.put({id: TD.idOne});
  xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, {});
  await generalPage.save();
  assert.equal(currentURL(), TICKET_URL);
});


test('can update all fields and save', async assert => {
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  const ticket = store.find('ticket', TD.idOne);
  assert.equal(find('.t-detail-title').text(), `#${ticket.get('number')}`);
  assert.equal(find('.t-mobile-ticket-activity-section').length, 1);
  await click('.t-mobile-footer-item:eq(1)');
  assert.equal(find('.t-mobile-ticket-detail-section').length, 1);
  ajax(`${PEOPLE_URL}person__icontains=b/`, 'GET', null, {}, 200, PF.search_power_select());
  await page.requestFillIn('my request');
  selectSearch(ASSIGNEE, 'b');
  selectChoose(ASSIGNEE, PD.fullnameBoy);
  selectSearch(CC, 'b');
  selectChoose(CC, PD.fullnameBoy);
  const TOP_LEVEL_CATEGORIES_TICKET_URL = `${CATEGORIES_URL}parents/`;
  const top_level_xhr = xhr(TOP_LEVEL_CATEGORIES_TICKET_URL, 'GET', null, {}, 200, CF.top_level());
  await ticketPage.categoryOneClickDropdown();
  await ticketPage.categoryOneClickOptionTwo();
  await generalMobilePage.footerItemThreeClick();
  assert.ok(Ember.$('.t-mobile-footer-item:eq(2)').hasClass('active'));
  xhr(`${LOCATIONS_URL}location__icontains=6/`, 'GET', null, {}, 200, LF.search_power_select());
  selectSearch(LOCATION, '6');
  selectChoose(LOCATION, LD.storeNameTwo);
  let response_put = TF.detail(TD.idOne);
  response_put.assignee = {id: PD.idBoy, first_name: PD.nameBoy};
  let payload = TF.put({id: TD.idOne, request: 'my request', assignee: PD.idBoy, cc: [PD.idOne, PD.idBoy], categories: [CD.idThree], location: LD.idTwo});
  xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(payload), {}, 200, response_put);
  await generalPage.save()
  assert.equal(currentURL(), TICKET_URL);
  assert.equal(ticket.get('assignee').get('id'), PD.idBoy);
});

test('when user changes an attribute and clicks cancel, we prompt them with a modal and they hit cancel', async assert => {
  clearxhr(list_xhr);
  await page.visitDetail();
  await click('.t-mobile-footer-item:eq(1)');
  await page.requestFillIn('wat');
  assert.equal(page.request, 'wat');
  await generalMobilePage.backButtonClick();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
    });
  });
  generalPage.clickModalCancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.equal(page.request, 'wat');
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('when user changes an attribute and clicks cancel, we prompt them with a modal and they hit rollback', async assert => {
  await page.visitDetail();
  await click('.t-mobile-footer-item:eq(1)');
  await page.requestFillIn('wat');
  assert.equal(find('.t-mobile-ticket-request').val(), 'wat');
  await generalMobilePage.backButtonClick();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
    });
  });
  generalPage.clickModalRollback();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), TICKET_URL);
      const ticket = store.find('ticket', TD.idOne);
      assert.notEqual(find('.t-mobile-ticket-request').val(), 'wat');
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('can add comment and click update to show new activity', async assert => {
  clearxhr(list_xhr);
  await page.visitDetail();
  assert.equal(currentURL(), DETAIL_URL);
  await ticketPage.commentFillIn(TD.commentOne);
  assert.equal(ticketPage.comment, TD.commentOne);
  let response = TF.detail(TD.idOne);
  xhr(TICKET_PUT_URL, 'PUT', JSON.stringify(ticket_payload_with_comment), {}, 200, response);
  ajax(`${TICKETS_URL}${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.comment_only());
  await ticketPage.update();
  assert.equal(currentURL(), DETAIL_URL);
  const ticket = store.find('ticket', TD.idOne);
  assert.equal(ticket.get('comment'), '');
  assert.equal(find(`${ACTIVITY_ITEMS}`).length, 1);
  assert.equal(find(`${ACTIVITY_ITEMS}:eq(0)`).text().trim(), `${PD.fullname} commented 4 months ago ${TD.commentOne}`);
});

/* jshint ignore:end */
