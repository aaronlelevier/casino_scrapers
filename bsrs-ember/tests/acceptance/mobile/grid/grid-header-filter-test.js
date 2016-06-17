import Ember from 'ember';
import module from 'bsrs-ember/tests/helpers/module';
import { test } from 'qunit';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {isFocused} from 'bsrs-ember/tests/helpers/input';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import page from 'bsrs-ember/tests/pages/ticket-mobile';
import generalPage from 'bsrs-ember/tests/pages/general-mobile';

var application, store, endpoint, list_xhr;

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = `${BASE_URL}/index`;
const HEADER_WRAP_CLASS = '.t-grid-mobile-header';
const LETTER_A = {keyCode: 65};

module('Acceptance | grid-head mobile', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('service:simpleStore');
    list_xhr = xhr(PREFIX + BASE_URL + '/?page=1', 'GET', null, {}, 200, TF.list());
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

test('clicking on filter icon will show filters and cancel will close it out', function(assert) {
  visit(TICKET_URL);
  click('.t-mobile-filter');
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
    assert.equal(find('.t-mobile-filters').length, 1);
    assert.equal(find('.t-mobile-filter-title').text(), t('grid.filter.other'));
    assert.equal(find('.t-mobile-filter-first-btn').text(), t('crud.cancel.button'));
    assert.equal(find('.t-mobile-filter-second-btn').text(), t('grid.filter'));
  });
  click('.t-mobile-filter-first-btn');
  andThen(() => {
    assert.throws(find('.t-mobile-filters'));
  });
});

test('clicking on search icon will show search bar above grid title and can search ticket grid', assert => {
  visit(TICKET_URL);
  click('.t-mobile-search');
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
    assert.throws(find('.t-mobile-filters'));
    assert.equal(find(`${HEADER_WRAP_CLASS} .t-mobile-search-wrap`).length, 1);
    assert.equal(find(`${HEADER_WRAP_CLASS} .t-grid-search-input`).length, 1);
    assert.equal(find(`${HEADER_WRAP_CLASS} .t-mobile-search-wrap .t-grid-search-input`).attr('placeholder'), t('ticket.search'));
  });
});

test('ticket request filter will filter down results and reset page to 1', function(assert) {
  xhr(PREFIX + BASE_URL + '/?page=1&request__icontains=ape19', 'GET', null, {}, 200, TF.searched('ape19', 'request'));
  clearxhr(list_xhr);
  xhr(PREFIX + BASE_URL + '/?page=2', 'GET', null, {}, 200, TF.list());
  visit(TICKET_URL+'?page=2');
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL + '?page=2');
    assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.requestOneGrid);
  });
  click('.t-mobile-filter');
  click('.t-filter-request');
  andThen(() => {
    assert.equal(find('.t-filter-input').length, 1);
  });
  fillIn('.t-filter-input', 'ape19');
  triggerEvent('.t-filter-input', 'keyup', {keyCode: 68});
  generalPage.submitFilterSort();
  andThen(() => {
    assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.requestLastPage2Grid);
  });
});

test('search filters down results and resets page to 1', assert => {
  xhr(PREFIX + BASE_URL + '/?page=1&search=ape19','GET',null,{},200,TF.searched('ape19', 'request'));
  clearxhr(list_xhr);
  xhr(PREFIX + BASE_URL + '/?page=2', 'GET', null, {}, 200, TF.list());
  visit(TICKET_URL+'?page=2');
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL + '?page=2');
  });
  generalPage.clickSearchIcon();
  andThen(() => {
    assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.requestOneGrid);
    assert.equal(find('.t-grid-search-input:eq(1)').attr('placeholder'), t('ticket.search'));
    isFocused('.t-grid-search-input:eq(1)');
  });
  generalPage.mobileSearch('ape19');
  triggerEvent('.t-grid-search-input:eq(1)', 'keyup', LETTER_A);
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL + '?search=ape19');
    assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.requestLastPage2Grid);
  });
});
