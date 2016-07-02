import Ember from 'ember';
import module from 'bsrs-ember/tests/helpers/module';
import { test } from 'qunit';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {isFocused} from 'bsrs-ember/tests/helpers/input';
import TA_FIXTURES from 'bsrs-ember/vendor/ticket_activity_fixtures';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import LD from 'bsrs-ember/vendor/defaults/location';
import PD from 'bsrs-ember/vendor/defaults/person';
import LF from 'bsrs-ember/vendor/location_fixtures';
import PF from 'bsrs-ember/vendor/people_fixtures';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import page from 'bsrs-ember/tests/pages/ticket-mobile';
import generalPage, { mobileSearch } from 'bsrs-ember/tests/pages/general-mobile';
import random from 'bsrs-ember/models/random';

var application, store, endpoint, list_xhr, endpoint, original_uuid;

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const BASE_PEOPLE_URL = BASEURLS.base_people_url;
const BASE_LOCATION_URL = BASEURLS.base_locations_url;
const TICKET_URL = `${BASE_URL}/index`;
const DETAIL_2_URL = `${BASE_URL}/index/${TD.idGridTwo}`;
const HEADER_WRAP_CLASS = '.t-grid-mobile-header';
const LETTER_A = {keyCode: 65};
const LETTER_S = {keyCode: 83};
const FILTERSET_COMPONENT = '.t-mobile-save-filterset-component';
const FILTERSET_COMPONENT_INPUT = '.t-mobile-save-filterset-component__input';
const LOCATION = '.t-ticket-location-select';
const ASSIGNEE = '.t-ticket-assignee-select';

module('Acceptance | grid-head mobile', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('service:simpleStore');
    endpoint = PREFIX + BASE_URL;
    list_xhr = xhr(`${endpoint}/?page=1`, 'GET', null, {}, 200, TF.list());
    const flexi = application.__container__.lookup('service:device/layout');
    const breakpoints = flexi.get('breakpoints');
    const bp = {};
    breakpoints.forEach((point) => {
      bp[point.name] = point.begin + 5;
    });
    flexi.set('width', bp.mobile);
    original_uuid = random.uuid;
  },
  afterEach() {
    random.uuid = original_uuid;
    Ember.run(application, 'destroy');
  }
});

/* jshint ignore:start */

test('clicking on filter icon will show filters and cancel will close it out', async assert => {
  await visit(TICKET_URL);
  await click('.t-mobile-filter');
  assert.equal(currentURL(), TICKET_URL);
  assert.equal(find('.t-mobile-filters').length, 1);
  assert.equal(find('.t-mobile-filter-title').text(), t('grid.filter.other'));
  assert.equal(find('.t-mobile-filter-first-btn').text(), t('crud.cancel.button'));
  assert.equal(find('.t-mobile-filter-second-btn').text(), t('grid.filter'));
  await click('.t-mobile-filter-first-btn');
  assert.throws(find('.t-mobile-filters'));
});

test('search presents results on slideUp pane w/o pushing into store', async assert => {
  xhr(PREFIX + BASE_URL + '/?search=ape','GET',null,{},200,TF.searched('ape', 'request'));
  xhr(PREFIX + BASE_URL + '/?search=sub2','GET',null,{},200,TF.searched('sub2', 'request'));
  await visit(TICKET_URL);
  assert.equal(currentURL(), TICKET_URL);
  assert.equal(store.find('ticket-list').get('length'), 10);
  await generalPage.clickSearchIcon();
  assert.equal(find(mobileSearch).attr('placeholder'), t('ticket.search'));
  assert.equal(find(mobileSearch).attr('type'), 'search');
  // isFocused('.t-mobile-search-slideUp .t-mobile-search-wrap .t-grid-search-input');
  await generalPage.mobileSearch('ape');
  await triggerEvent(mobileSearch, 'keyup', LETTER_A);
  assert.equal(currentURL(), TICKET_URL);
  assert.equal(store.find('ticket-list').get('length'), 10);
  assert.equal(find('.t-grid-search-data').length, 9);
  assert.equal(find('.t-mobile-search-result__title:eq(0)').text().trim(), 'Repair');
  assert.equal(find('.t-mobile-search-result__meta:eq(0)').text().trim(), TD.locationTwo);
  await generalPage.mobileSearch('sub2');
  await triggerEvent(mobileSearch, 'keyup', LETTER_S);
  assert.equal(currentURL(), TICKET_URL);
  assert.equal(store.find('ticket-list').get('length'), 10); //store length is same b/c search does not touch store
  assert.equal(find('.t-grid-search-data').length, 1);
  assert.equal(find('.t-mobile-search-result__title:eq(0)').text().trim(), 'Repair • Plumbing • Toilet Leak');
  assert.equal(find('.t-mobile-search-result__meta:eq(0)').text().trim(), LD.storeName);
  xhr(`${endpoint}/${TD.idGridTwo}/`, 'GET', null, {}, 200, TF.detail(TD.idOne));
  xhr(`${endpoint}/${TD.idGridTwo}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.empty());
  await generalPage.clickSearchGridOne();
  assert.equal(currentURL(), DETAIL_2_URL);
  //TODO: asserts that are on single page
});

test('savefilterset will fire off xhr', async assert => {
  random.uuid = function() { return UUID.value; };
  xhr(PREFIX + BASE_URL + '/?page=1&request__icontains=ape19', 'GET', null, {}, 200, TF.searched('ape19', 'request'));
  await visit(TICKET_URL);
  await generalPage.clickFilterOpen();
  await page.clickFilterRequest();
  await generalPage.filterInput('ape19');
  await triggerEvent('.t-filter-input', 'keyup', {keyCode: 68});
  await generalPage.submitFilterSort();
  assert.equal(find(FILTERSET_COMPONENT).length, 1);
  isFocused(FILTERSET_COMPONENT_INPUT);
  assert.equal(find(FILTERSET_COMPONENT_INPUT).attr('placeholder'), t('grid.filterset_name'));
  assert.equal(find('.t-filterset-wrap > hbox > div').length, 5);
  await fillIn(FILTERSET_COMPONENT_INPUT, 'foobar');
  let name = 'foobar';
  let routePath = 'tickets.index';
  let url = window.location.toString();
  let query = '?find=request%3Aape19&id_in=';
  let section = '.t-grid-wrap';
  let navigation = '.t-filterset-wrap li';
  let payload = {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query};
  xhr('/api/admin/saved-searches/', 'POST', JSON.stringify(payload), {}, 200, {});
  await generalPage.saveFilterset();
  // isFocused('.t-mobile-save-filterset-component__input');
  //TODO: needs to be in correct order
  assert.equal(find('.t-filterset-wrap > hbox > div').length, 6);
});

test('savefilterset input will close if have filters and decide not to fill it in', async assert => {
  random.uuid = function() { return UUID.value; };
  xhr(PREFIX + BASE_URL + '/?page=1&request__icontains=ape19', 'GET', null, {}, 200, TF.searched('ape19', 'request'));
  await visit(TICKET_URL);
  await generalPage.clickFilterOpen();
  await page.clickFilterRequest();
  await fillIn('.t-filter-input', 'ape19');
  await triggerEvent('.t-filter-input', 'keyup', {keyCode: 68});
  await generalPage.submitFilterSort();
  assert.equal(find(FILTERSET_COMPONENT).length, 1);
  await generalPage.closeFiltersetInput();
  assert.equal(find(FILTERSET_COMPONENT).length, 0);
});

test('ticket request filter will filter down results and reset page to 1', async assert => {
  xhr(PREFIX + BASE_URL + '/?page=1&request__icontains=ape19', 'GET', null, {}, 200, TF.searched('ape19', 'request'));
  clearxhr(list_xhr);
  xhr(PREFIX + BASE_URL + '/?page=2', 'GET', null, {}, 200, TF.list());
  await visit(TICKET_URL+'?page=2');
  assert.equal(currentURL(), TICKET_URL + '?page=2');
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.requestOneGrid);
  await generalPage.clickFilterOpen();
  await page.clickFilterRequest();
  assert.equal(find('.t-filter-input').length, 1);
  await generalPage.filterInput('ape19');
  await triggerEvent('.t-filter-input', 'keyup', {keyCode: 68});
  await generalPage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.requestLastPage2Grid);
});

test('filtering on priority will sort when filter is clicked', async assert => {
  xhr(`${PREFIX}${BASE_URL}/?page=1&priority__id__in=${TD.priorityOneId}`, 'GET', null, {}, 200, TF.searched_related(TD.priorityOneId, 'priority'));
  await visit(TICKET_URL);
  assert.equal(store.find('ticket-list').get('length'), 10);
  await generalPage.clickFilterOpen();
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
  await generalPage.submitFilterSort();
  assert.equal(store.find('ticket-list').get('length'), 10);
  assert.equal(find('.t-grid-data:eq(0) > .t-ticket-priority-translated_name span').text().trim(), t('ticket.priority.emergency'));
  await generalPage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 1);
  assert.equal(page.priorityOneIsChecked(), true);
  assert.equal(page.priorityTwoIsChecked(), false);
  assert.equal(page.priorityThreeIsChecked(), false);
  assert.equal(page.priorityFourIsChecked(), false);
  await page.priorityTwoCheck();
  xhr(`${PREFIX}${BASE_URL}/?page=1&priority__id__in=${TD.priorityOneId},${TD.priorityTwoId}`, 'GET', null, {}, 200, TF.searched_related(TD.priorityTwoId, 'priority'));
  await generalPage.submitFilterSort();
});

test('can uncheck a value after already checked and no xhr is sent', async assert => {
  xhr(`${PREFIX}${BASE_URL}/?page=1&priority__id__in=${TD.priorityOneId}`, 'GET', null, {}, 200, TF.searched_related(TD.priorityOneId, 'priority'));
  await visit(TICKET_URL);
  assert.equal(store.find('ticket-list').get('length'), 10);
  await generalPage.clickFilterOpen();
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
  await generalPage.submitFilterSort();
  assert.equal(store.find('ticket-list').get('length'), 10);
  assert.equal(find('.t-grid-data:eq(0) > .t-ticket-priority-translated_name span').text().trim(), t('ticket.priority.emergency'));
  await generalPage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 1);
  await page.priorityOneCheck();
  assert.equal(page.priorityOneIsChecked(), false);
  assert.equal(page.priorityTwoIsChecked(), false);
  assert.equal(page.priorityThreeIsChecked(), false);
  assert.equal(page.priorityFourIsChecked(), false);
  await generalPage.submitFilterSort();
  await generalPage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 0);
  assert.equal(page.priorityOneIsChecked(), false);
  assert.equal(page.priorityTwoIsChecked(), false);
  assert.equal(page.priorityThreeIsChecked(), false);
  assert.equal(page.priorityFourIsChecked(), false);
});

test('filtering on multiple parameters', async assert => {
  xhr(`${PREFIX}${BASE_URL}/?page=1&priority__id__in=${TD.priorityOneId}&status__id__in=${TD.statusOneId}`, 'GET', null, {}, 200, TF.searched_related(TD.priorityOneId, 'priority'));
  await visit(TICKET_URL);
  await generalPage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 0);
  await page.clickFilterPriority();
  await page.priorityOneCheck();
  await page.clickFilterStatus();
  await page.statusOneCheck();
  await generalPage.submitFilterSort();
});

test('filtering location on power select and can remove', async assert => {
  xhr(`${PREFIX}${BASE_URL}/?page=1&location__id__in=${LD.idThree}&status__id__in=${TD.statusOneId}`, 'GET', null, {}, 200, TF.searched_related(TD.priorityOneId, 'priority'));
  xhr(`${PREFIX}${BASE_URL}/?page=1&location__id__in=${LD.idFour},${LD.idThree}&status__id__in=${TD.statusOneId}`, 'GET', null, {}, 200, TF.searched_related(TD.priorityOneId, 'priority'));
  xhr(`${PREFIX}${BASE_URL}/?page=1&location__id__in=${LD.idFour}&status__id__in=${TD.statusOneId}`, 'GET', null, {}, 200, TF.searched_related(TD.priorityOneId, 'priority'));
  xhr(`${PREFIX}${BASE_URL}/?page=1&location__id__in=${LD.idFour}`, 'GET', null, {}, 200, TF.searched_related(TD.priorityOneId, 'priority'));
  await visit(TICKET_URL);
  assert.equal(store.find('ticket-list').get('length'), 10);
  await generalPage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 0);
  assert.equal(find(LOCATION).length, 0);
  await page.clickFilterLocation();
  assert.equal(find('.t-filter__input-wrap').length, 1);
  xhr(`${PREFIX}${BASE_LOCATION_URL}/?name__icontains=6`, 'GET', null, {}, 200, LF.search());
  await selectSearch(LOCATION, '6');
  await selectChoose(LOCATION, 'ZXY863');
  await generalPage.submitFilterSort();
  // Select a status as well
  await generalPage.clickFilterOpen();
  assert.equal(page.locationInput.split(' ')[1], 'ZXY863');
  await page.clickFilterStatus();
  await page.statusOneCheck();
  await generalPage.submitFilterSort();
  // Select another location
  await generalPage.clickFilterOpen();
  xhr(`${PREFIX}${BASE_LOCATION_URL}/?name__icontains=9`, 'GET', null, {}, 200, LF.search_idThree());
  await selectSearch(LOCATION, '9');
  await selectChoose(LOCATION, 'GHI789');
  await generalPage.submitFilterSort();
  await generalPage.clickFilterOpen();
  assert.equal(page.locationInput.split(' ')[1], 'ZXY863');
  assert.equal(page.locationInput.split(' ')[3], 'GHI789');
  // Remove
  await removeMultipleOption(LOCATION, 'ZXY863');
  await generalPage.submitFilterSort();
  await generalPage.clickFilterOpen();
  assert.equal(page.locationInput.split(' ')[1], 'GHI789');
});

test('filtering assignee on power select and can remove', async assert => {
  xhr(`${PREFIX}${BASE_URL}/?page=1&assignee__id__in=${PD.idBoy}`, 'GET', null, {}, 200, TF.searched_related(TD.priorityOneId, 'priority'));
  await visit(TICKET_URL);
  assert.equal(store.find('ticket-list').get('length'), 10);
  await generalPage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 0);
  assert.equal(find(ASSIGNEE).length, 0);
  await page.clickFilterAssignee();
  assert.equal(find('.t-filter__input-wrap').length, 1);
  xhr(`${PREFIX}${BASE_PEOPLE_URL}/?fullname__icontains=boy`, 'GET', null, {}, 200, PF.search());
  await selectSearch(ASSIGNEE, 'boy');
  await selectChoose(ASSIGNEE, PD.fullnameBoy);
  assert.equal(page.assigneeInput.split(' ')[1], PD.nameBoy);
  await generalPage.submitFilterSort();
  await generalPage.clickFilterOpen();
  assert.equal(page.assigneeInput.split(' ')[1], PD.nameBoy);
  removeMultipleOption(ASSIGNEE, PD.fullnameBoy);
  await generalPage.submitFilterSort();
});

test('clicking on filter twice will keep results in grid', async assert => {
  await visit(TICKET_URL);
  await generalPage.clickFilterOpen();
  await generalPage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.requestOneGrid);
  await generalPage.clickFilterOpen();
  await generalPage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.requestOneGrid);
});

test('removing find or id_in filter will reset grid', async assert => {
  xhr(`${PREFIX}${BASE_URL}/?page=1&assignee__id__in=${PD.idBoy}`, 'GET', null, {}, 200, {'results': []});
  await visit(TICKET_URL);
  await generalPage.clickFilterOpen();
  await page.clickFilterAssignee();
  xhr(`${PREFIX}${BASE_PEOPLE_URL}/?fullname__icontains=boy`, 'GET', null, {}, 200, PF.search());
  await selectSearch(ASSIGNEE, 'boy');
  await selectChoose(ASSIGNEE, PD.fullnameBoy);
  await generalPage.submitFilterSort();
  await generalPage.clickFilterOpen();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), '');
  removeMultipleOption(ASSIGNEE, PD.fullnameBoy);
  await generalPage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.requestOneGrid);
  await generalPage.clickFilterOpen();
  await generalPage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.requestOneGrid);
  await generalPage.clickFilterOpen();
  await generalPage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.requestOneGrid);
});

/* jshint ignore:end */
