import Ember from 'ember';
const { run } = Ember;
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import { test } from 'qunit';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import { isFocused } from 'bsrs-ember/tests/helpers/input';
import TA_FIXTURES from 'bsrs-ember/vendor/ticket_activity_fixtures';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import LD from 'bsrs-ember/vendor/defaults/location';
import PD from 'bsrs-ember/vendor/defaults/person';
import LF from 'bsrs-ember/vendor/location_fixtures';
import PF from 'bsrs-ember/vendor/people_fixtures';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import page from 'bsrs-ember/tests/pages/ticket-mobile';
import generalPage, { mobileSearch } from 'bsrs-ember/tests/pages/general-mobile';
import random from 'bsrs-ember/models/random';
import BASEURLS, { TICKETS_URL, PEOPLE_URL, LOCATIONS_URL } from 'bsrs-ember/utilities/urls';

var store, list_xhr;

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = `${BASE_URL}/index`;
const DETAIL_2_URL = `${BASE_URL}/${TD.idGridTwo}`;
const HEADER_WRAP_CLASS = '.t-grid-mobile-header';
const LETTER_A = {keyCode: 65};
const LETTER_S = {keyCode: 83};
const FILTERSET_COMPONENT = '.t-mobile-save-filterset-component';
const FILTERSET_COMPONENT_INPUT = '.t-mobile-save-filterset-component__input';

moduleForAcceptance('Acceptance | general grid-head mobile', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    list_xhr = xhr(`${TICKETS_URL}?page=1`, 'GET', null, {}, 200, TF.list());
    setWidth('mobile');
    random.uuid = function() { return UUID.value; };
  },
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
  xhr(PREFIX + BASE_URL + '/?search=subb2','GET',null,{},200,TF.searched('subb2', 'request'));
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
  await generalPage.mobileSearch('subb2');
  await triggerEvent(mobileSearch, 'keyup', LETTER_S);
  assert.equal(currentURL(), TICKET_URL);
  assert.equal(store.find('ticket-list').get('length'), 10); //store length is same b/c search does not touch store
  assert.equal(find('.t-grid-search-data').length, 1);
  assert.equal(find('.t-mobile-search-result__title:eq(0)').text().trim(), 'Repair • Plumbing • Toilet Leak');
  assert.equal(find('.t-mobile-search-result__meta:eq(0)').text().trim(), LD.baseStoreName);
  xhr(`${TICKETS_URL}${TD.idGridTwo}/`, 'GET', null, {}, 200, TF.detail(TD.idOne));
  xhr(`${TICKETS_URL}${TD.idGridTwo}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.empty());
  await generalPage.clickSearchGridOne();
  assert.equal(currentURL(), DETAIL_2_URL);
  //TODO: asserts that are on single page
});

// test('savefilterset will fire off xhr', async assert => {
//   random.uuid = function() { return UUID.value; };
//   xhr(PREFIX + BASE_URL + '/?page=1&request__icontains=ape19', 'GET', null, {}, 200, TF.searched('ape19', 'request'));
//   await visit(TICKET_URL);
//   await generalPage.clickFilterOpen();
//   await page.clickFilterRequest();
//   await generalPage.filterInput('ape19');
//   await triggerEvent('.t-filter-input', 'keyup', {keyCode: 68});
//   await generalPage.submitFilterSort();
//   assert.equal(find(FILTERSET_COMPONENT).length, 1);
//   isFocused(FILTERSET_COMPONENT_INPUT);
//   assert.equal(find(FILTERSET_COMPONENT_INPUT).attr('placeholder'), t('grid.filterset_name'));
//   assert.equal(find('.t-filterset-wrap > hbox > div').length, 5);
//   await fillIn(FILTERSET_COMPONENT_INPUT, 'foobar');
//   let name = 'foobar';
//   let routePath = 'tickets.index';
//   let url = window.location.toString();
//   let query = '?find=request%3Aape19&id_in=';
//   let section = '.t-grid-wrap';
//   let navigation = '.t-filterset-wrap li';
//   let payload = {id: UUID.value, name: name, TICKETS_URL_name: routePath, TICKETS_URL_uri: query};
//   xhr('/api/admin/saved-searches/', 'POST', JSON.stringify(payload), {}, 200, {});
//   await generalPage.saveFilterset();
//   // isFocused('.t-mobile-save-filterset-component__input');
//   //TODO: needs to be in correct order
//   assert.equal(find('.t-filterset-wrap > hbox > div').length, 6);
// });

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

test('clicking on filter twice will keep results in grid', async assert => {
  await visit(TICKET_URL);
  await generalPage.clickFilterOpen();
  await generalPage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.requestOneGrid);
  await generalPage.clickFilterOpen();
  await generalPage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.requestOneGrid);
});


/* jshint ignore:end */
