import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import config from 'bsrs-ember/config/environment';
import CF from 'bsrs-ember/vendor/category_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import LD from 'bsrs-ember/vendor/defaults/location';
import TA_FIXTURES from 'bsrs-ember/vendor/ticket_activity_fixtures';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import BASEURLS from 'bsrs-ember/utilities/urls';

const idTwo = 'bf2b9c85-f6bd-4345-9834-c5d51de53d02';
const PREFIX = config.APP.NAMESPACE;
const TICKET_LIST_URL = `${BASEURLS.base_tickets_url}/index`;
const TICKET_ONE_DETAIL_URL = `${BASEURLS.base_tickets_url}/${TD.idOne}`;
const TICKET_TWO_DETAIL_URL = `${BASEURLS.base_tickets_url}/${idTwo}`;
const TOP_LEVEL_CATEGORIES_URL = `${PREFIX}/admin/categories/parents/`;
const TICKET_ACTIVITIES_ONE_URL = `${PREFIX}/tickets/${TD.idOne}/activity/`;
const TICKET_ACTIVITIES_TWO_URL = `${PREFIX}/tickets/${idTwo}/activity/`;

var application, store, ticket_one, ticket_two;

moduleForAcceptance('Acceptance | ticket and ticket test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
  },
});

test('rolling back should have no effect on another open tickets dirty status', (assert) => {
  ajax(`${PREFIX}${BASEURLS.base_tickets_url}/?page=1`, 'GET', null, {}, 200, TF.list());
  visit(TICKET_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL);
  });
  ajax(`${PREFIX}${TICKET_ONE_DETAIL_URL}/`, 'GET', null, {}, 200, TF.detail(TD.idOne));
  ajax(TICKET_ACTIVITIES_ONE_URL, 'GET', null, {}, 200, TA_FIXTURES.empty());
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), TICKET_ONE_DETAIL_URL);
    ticket_one = store.find('ticket', TD.idOne);
    assert.equal(ticket_one.get('isDirtyOrRelatedDirty'), false);
  });
  visit(TICKET_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL);
    ticket_one = store.find('ticket', TD.idOne);
    assert.equal(ticket_one.get('isDirtyOrRelatedDirty'), false);
    assert.equal(ticket_one.get('locationIsDirty'), false);
    assert.equal(ticket_one.get('location_fk'), LD.idOne);
  });
  ajax(`${PREFIX}${TICKET_TWO_DETAIL_URL}/`, 'GET', null, {}, 200, TF.detail(idTwo));
  ajax(TICKET_ACTIVITIES_TWO_URL, 'GET', null, {}, 200, TA_FIXTURES.empty());
  click('.t-grid-data:eq(1)');
  andThen(() => {
    assert.equal(currentURL(), TICKET_TWO_DETAIL_URL);
    ticket_one = store.find('ticket', TD.idOne);
    assert.equal(ticket_one.get('isDirtyOrRelatedDirty'), false);
    assert.equal(ticket_one.get('locationIsDirty'), false);
    ticket_two = store.find('ticket', idTwo);
    assert.equal(ticket_two.get('isDirtyOrRelatedDirty'), false);
  });
  fillIn('.t-ticket-request', 'something random');
  andThen(() => {
    assert.equal(currentURL(), TICKET_TWO_DETAIL_URL);
    ticket_one = store.find('ticket', TD.idOne);
    assert.equal(ticket_one.get('isDirtyOrRelatedDirty'), false);
    ticket_two = store.find('ticket', idTwo);
    assert.equal(ticket_two.get('isDirtyOrRelatedDirty'), true);
  });
  click('.t-cancel-btn');
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), TICKET_TWO_DETAIL_URL);
      ticket_one = store.find('ticket', TD.idOne);
      assert.equal(ticket_one.get('isDirtyOrRelatedDirty'), false);
      ticket_two = store.find('ticket', idTwo);
      assert.equal(ticket_two.get('isDirtyOrRelatedDirty'), true);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
    });
  });
  click('.t-modal-rollback-btn');
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), TICKET_LIST_URL);
      ticket_one = store.find('ticket', TD.idOne);
      assert.equal(ticket_one.get('isDirtyOrRelatedDirty'), false);
      ticket_two = store.find('ticket', idTwo);
      assert.equal(ticket_two.get('isDirtyOrRelatedDirty'), false);
    });
  });
});
