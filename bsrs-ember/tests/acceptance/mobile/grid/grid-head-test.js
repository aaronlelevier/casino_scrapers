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
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import page from 'bsrs-ember/tests/pages/ticket-mobile';
import generalPage, { mobileSearch } from 'bsrs-ember/tests/pages/general-mobile';
import random from 'bsrs-ember/models/random';

var application, store, endpoint, list_xhr, endpoint, original_uuid;

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = `${BASE_URL}/index`;
const DETAIL_2_URL = `${BASE_URL}/index/${TD.idGridTwo}`;
const HEADER_WRAP_CLASS = '.t-grid-mobile-header';
const LETTER_A = {keyCode: 65};
const LETTER_S = {keyCode: 83};
const FILTERSET_COMPONENT = '.t-mobile-save-filterset-component';
const FILTERSET_COMPONENT_INPUT = '.t-mobile-save-filterset-component__input';

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
  let query = '?find=request%3Aape19';
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

test('sorting on priority will sort when filter is clicked', async assert => {
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


/* jshint ignore:end */
