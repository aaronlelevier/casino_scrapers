import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import config from 'bsrs-ember/config/environment';
import BASEURLS, { TICKET_LIST_URL } from 'bsrs-ember/utilities/urls';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
// import timemachine from 'vendor/timemachine';
import page from 'bsrs-ember/tests/pages/tickets';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_tickets_url;
const NUMBER_FIVE = {keyCode: 53};

let application, store, endpoint, list_xhr;

moduleForAcceptance('Acceptance | error grid test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    endpoint = PREFIX + BASE_URL + '/?page=1';
    list_xhr = xhr(endpoint, 'GET', null, {}, 200, TF.list());
  },
});

test('typing a search will with a 400 or greater will show in context error', function(assert) {
  let search_one = PREFIX + BASE_URL + '/?page=1&search=5';
  xhr(search_one, 'GET', null, {}, 400, TF.searched('5', 'name'));
  visit(TICKET_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestOneGrid);
  });
  fillIn('.t-grid-search-input', '5');
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FIVE);
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL + '?search=5');
    assert.equal(find('.t-grid-data').length, 0);
  });
});
