import Ember from 'ember';
const { run } = Ember;
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import { test } from 'qunit';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import PD from 'bsrs-ember/vendor/defaults/person';
import PF from 'bsrs-ember/vendor/people_fixtures';
import LF from 'bsrs-ember/vendor/location_fixtures';
import LD from 'bsrs-ember/vendor/defaults/location';
import TENANT_DEFAULTS from 'bsrs-ember/vendor/defaults/tenant';
import TA_FIXTURES from 'bsrs-ember/vendor/ticket_activity_fixtures';
import config from 'bsrs-ember/config/environment';
import page from 'bsrs-ember/tests/pages/ticket-mobile';
import ticketPage from 'bsrs-ember/tests/pages/tickets';
import generalMobilePage from 'bsrs-ember/tests/pages/general-mobile';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { TICKETS_URL, PEOPLE_URL, LOCATIONS_URL } from 'bsrs-ember/utilities/urls';

var store, list_xhr;

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = `${BASE_URL}/index`;
const DASHBOARD_URL = BASEURLS.DASHBOARD_URL;
const DETAIL_URL = `${BASE_URL}/index/${TD.idOne}`;
const ACTIVITY_ITEMS = '.t-activity-list-item';
const ASSIGNEE = '.t-ticket-assignee-select';
const LOCATION = '.t-ticket-location-select';
// const SORT_ASSIGNEE_DIR = '.t-sort-assignee-fullname-dir';
// const FILTER_PRIORITY = '.t-filter-priority-translated-name';

moduleForAcceptance('Acceptance | grid ticket mobile test', {
  beforeEach() {
    setWidth('mobile');
    store = this.application.__container__.lookup('service:simpleStore');
    list_xhr = xhr(`${TICKETS_URL}?page=1`, 'GET', null, {}, 200, TF.list());
  },
});

/* jshint ignore:start */

test('only renders grid items from server and not other ticket objects already in store', assert => {
  /* MOBILE doesn't clear out grid items on every route call to allow for infinite scrolling. If other tickets in store, this will fail */
  xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET', null, {}, 200, {settings: {dashboard_text: TENANT_DEFAULTS.dashboard_text}});
  visit(DASHBOARD_URL);
  andThen(() => {
    assert.equal(currentURL(), DASHBOARD_URL);
    assert.equal(store.find('ticket-list').get('length'), 0);
  });
  clearxhr(list_xhr);
  xhr(`${TICKETS_URL}?page=1`, 'GET', null, {}, 200, TF.list_two());
  visit(TICKET_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
    assert.equal(store.find('ticket-list').get('length'), 9);
  });
});

test('visiting mobile ticket grid show correct layout', assert => {
  ticketPage.visit();
  andThen(() => {
    const ticket = store.findOne('ticket-list');
    assert.equal(currentURL(), TICKET_URL);
    assert.equal(find('.t-mobile-grid-title').text().trim(), '19 Tickets');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.ok(find('.t-grid-data:eq(0) > div:eq(0)').text().trim());
    assert.ok(find('.t-grid-data:eq(0) > div:eq(0)').hasClass('t-ticket-categories'));
    assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.requestOneGrid);
    assert.equal(find('.t-grid-data:eq(0) > div:eq(2)').text().trim(), t('ticket.status.new'));
    assert.ok(find('.t-grid-data:eq(0) > div:eq(2)').hasClass('t-ticket-status-translated_name'));
    assert.equal(find('.t-grid-data:eq(0) > div:eq(3)').text().trim(), t('ticket.priority.emergency'));
    assert.ok(find('.t-grid-data:eq(0) > div:eq(3)').hasClass('t-ticket-priority-translated_name'));
    assert.equal(find('.t-grid-data:eq(0) > div:eq(4)').text().trim(), LD.baseStoreName);
    assert.equal(find('.t-grid-data:eq(0) > div:eq(5)').text().trim(), ticket.get('assignee').fullname);
    assert.equal(find('.t-grid-data:eq(0) > div:eq(6)').text().trim().split(' ')[0], 'Today');
    assert.equal(find('.t-grid-data:eq(0) > div:eq(6)').text().trim().split(' ')[1], 'at');
    assert.equal(find('.t-grid-data:eq(0) > div:eq(7)').text().trim(), ticket.get('number'));
  });
});

test('ticket request filter will filter down results and reset page to 1', async assert => {
  xhr(`${TICKETS_URL}?page=1&request__icontains=ape19`, 'GET', null, {}, 200, TF.searched('ape19', 'request'));
  clearxhr(list_xhr);
  xhr(`${TICKETS_URL}?page=2`, 'GET', null, {}, 200, TF.list());
  await visit(TICKET_URL+'?page=2');
  assert.equal(currentURL(), TICKET_URL + '?page=2');
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.requestOneGrid);
  await generalMobilePage.clickFilterOpen();
  await page.clickFilterRequest();
  assert.equal(find('.t-filter-input').length, 1);
  await generalMobilePage.filterInput('ape19');
  await triggerEvent('.t-filter-input', 'keyup', {keyCode: 68});
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.requestLastPage2Grid);
});

test('filtering on priority will sort when filter is clicked', async assert => {
  xhr(`${TICKETS_URL}?page=1&priority__id__in=${TD.priorityOneId}`, 'GET', null, {}, 200, TF.searched_related(TD.priorityOneId, 'priority'));
  await ticketPage.visit();
  assert.equal(store.find('ticket-list').get('length'), 10);
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 0);
  await page.clickFilterPriority();
  assert.equal(find('.t-filter__input-wrap').length, 1);
  assert.equal(find('.t-checkbox-list').length, 1);
  assert.equal(page.priorityOneIsChecked(), false);
  await page.priorityOneCheck();
  assert.equal(page.priorityOneIsChecked(), true);
  assert.equal(page.priorityTwoIsChecked(), false);
  assert.equal(page.priorityThreeIsChecked(), false);
  assert.equal(page.priorityFourIsChecked(), false);
  await generalMobilePage.submitFilterSort();
  assert.equal(store.find('ticket-list').get('length'), 10);
  assert.equal(find('.t-grid-data:eq(0) > .t-ticket-priority-translated_name span').text().trim(), t('ticket.priority.emergency'));
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 1);
  assert.equal(page.priorityOneIsChecked(), true);
  assert.equal(page.priorityTwoIsChecked(), false);
  assert.equal(page.priorityThreeIsChecked(), false);
  assert.equal(page.priorityFourIsChecked(), false);
  await page.priorityTwoCheck();
  xhr(`${TICKETS_URL}?page=1&priority__id__in=${TD.priorityOneId},${TD.priorityTwoId}`, 'GET', null, {}, 200, TF.searched_related(TD.priorityTwoId, 'priority'));
  await generalMobilePage.submitFilterSort();
});

test('can uncheck a value after already checked and no xhr is sent', async assert => {
  xhr(`${TICKETS_URL}?page=1&priority__id__in=${TD.priorityOneId}`, 'GET', null, {}, 200, TF.searched_related(TD.priorityOneId, 'priority'));
  await ticketPage.visit();
  assert.equal(store.find('ticket-list').get('length'), 10);
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 0);
  await page.clickFilterPriority();
  assert.equal(find('.t-filter__input-wrap').length, 1);
  assert.equal(find('.t-checkbox-list').length, 1);
  assert.equal(page.priorityOneIsChecked(), false);
  await page.priorityOneCheck();
  assert.equal(page.priorityOneIsChecked(), true);
  assert.equal(page.priorityTwoIsChecked(), false);
  assert.equal(page.priorityThreeIsChecked(), false);
  assert.equal(page.priorityFourIsChecked(), false);
  await generalMobilePage.submitFilterSort();
  assert.equal(store.find('ticket-list').get('length'), 10);
  assert.equal(find('.t-grid-data:eq(0) > .t-ticket-priority-translated_name span').text().trim(), t('ticket.priority.emergency'));
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 1);
  await page.priorityOneCheck();
  assert.equal(page.priorityOneIsChecked(), false);
  assert.equal(page.priorityTwoIsChecked(), false);
  assert.equal(page.priorityThreeIsChecked(), false);
  assert.equal(page.priorityFourIsChecked(), false);
  await generalMobilePage.submitFilterSort();
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 0);
  assert.equal(page.priorityOneIsChecked(), false);
  assert.equal(page.priorityTwoIsChecked(), false);
  assert.equal(page.priorityThreeIsChecked(), false);
  assert.equal(page.priorityFourIsChecked(), false);
});

test('filtering on multiple parameters', async assert => {
  xhr(`${TICKETS_URL}?page=1&priority__id__in=${TD.priorityOneId}&status__id__in=${TD.statusOneId}`, 'GET', null, {}, 200, TF.searched_related(TD.priorityOneId, 'priority'));
  await ticketPage.visit();
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 0);
  await page.clickFilterPriority();
  await page.priorityOneCheck();
  await page.clickFilterStatus();
  await page.statusOneCheck();
  await generalMobilePage.submitFilterSort();
});

test('filtering assignee on power select and can remove', async assert => {
  xhr(`${TICKETS_URL}?page=1&assignee__id__in=${PD.idBoy}`, 'GET', null, {}, 200, TF.searched_related(TD.priorityOneId, 'priority'));
  await ticketPage.visit();
  assert.equal(store.find('ticket-list').get('length'), 10);
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 0);
  assert.equal(find(ASSIGNEE).length, 0);
  await page.clickFilterAssignee();
  assert.equal(find('.t-filter__input-wrap').length, 1);
  xhr(`${PEOPLE_URL}person__icontains=boy/`, 'GET', null, {}, 200, PF.search_power_select());
  await selectSearch(ASSIGNEE, 'boy');
  await selectChoose(ASSIGNEE, PD.fullnameBoy);
  assert.equal(page.assigneeInput.split(' ')[1], PD.nameBoy);
  await generalMobilePage.submitFilterSort();
  await generalMobilePage.clickFilterOpen();
  assert.equal(page.assigneeInput.split(' ')[1], PD.nameBoy);
  removeMultipleOption(ASSIGNEE, PD.fullnameBoy);
  await generalMobilePage.submitFilterSort();
});

test('filtering location on power select and can remove', async assert => {
  xhr(`${TICKETS_URL}?page=1&location__id__in=${LD.idThree}&status__id__in=${TD.statusOneId}`, 'GET', null, {}, 200, TF.searched_related(TD.priorityOneId, 'priority'));
  xhr(`${TICKETS_URL}?page=1&location__id__in=${LD.idFour},${LD.idThree}&status__id__in=${TD.statusOneId}`, 'GET', null, {}, 200, TF.searched_related(TD.priorityOneId, 'priority'));
  xhr(`${TICKETS_URL}?page=1&location__id__in=${LD.idFour}&status__id__in=${TD.statusOneId}`, 'GET', null, {}, 200, TF.searched_related(TD.priorityOneId, 'priority'));
  xhr(`${TICKETS_URL}?page=1&location__id__in=${LD.idFour}`, 'GET', null, {}, 200, TF.searched_related(TD.priorityOneId, 'priority'));
  await ticketPage.visit();
  assert.equal(store.find('ticket-list').get('length'), 10);
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 0);
  assert.equal(find(LOCATION).length, 0);
  await page.clickFilterLocation();
  assert.equal(find('.t-filter__input-wrap').length, 1);
  xhr(`${LOCATIONS_URL}location__icontains=6/`, 'GET', null, {}, 200, LF.search_power_select());
  await selectSearch(LOCATION, '6');
  await selectChoose(LOCATION, 'ZXY863');
  await generalMobilePage.submitFilterSort();
  await generalMobilePage.clickFilterOpen();
  assert.equal(page.locationInput.split(' ')[1], 'ZXY863');
  await page.clickFilterStatus();
  await page.statusOneCheck();
  await generalMobilePage.submitFilterSort();
  // Select another location
  await generalMobilePage.clickFilterOpen();
  xhr(`${LOCATIONS_URL}location__icontains=9/`, 'GET', null, {}, 200, LF.search_idThree());
  await selectSearch(LOCATION, '9');
  await selectChoose(LOCATION, 'GHI789');
  await generalMobilePage.submitFilterSort();
  await generalMobilePage.clickFilterOpen();
  assert.equal(page.locationInput.split(' ')[1], 'ZXY863');
  assert.equal(page.locationInput.split(' ')[3], 'GHI789');
  // Remove
  await removeMultipleOption(LOCATION, 'ZXY863');
  await generalMobilePage.submitFilterSort();
  await generalMobilePage.clickFilterOpen();
  assert.equal(page.locationInput.split(' ')[1], 'GHI789');
});

test('removing find or id_in filter will reset grid', async assert => {
  xhr(`${TICKETS_URL}?page=1&assignee__id__in=${PD.idBoy}`, 'GET', null, {}, 200, {'results': []});
  await ticketPage.visit();
  await generalMobilePage.clickFilterOpen();
  await page.clickFilterAssignee();
  xhr(`${PEOPLE_URL}person__icontains=boy/`, 'GET', null, {}, 200, PF.search_power_select());
  await selectSearch(ASSIGNEE, 'boy');
  await selectChoose(ASSIGNEE, PD.fullnameBoy);
  await generalMobilePage.submitFilterSort();
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), '');
  removeMultipleOption(ASSIGNEE, PD.fullnameBoy);
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.requestOneGrid);
  await generalMobilePage.clickFilterOpen();
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.requestOneGrid);
  await generalMobilePage.clickFilterOpen();
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.requestOneGrid);
});

/* jshint ignore:end */
