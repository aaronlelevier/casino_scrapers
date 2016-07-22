import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import TPF from 'bsrs-ember/vendor/third_party_fixtures';
import TPD from 'bsrs-ember/vendor/defaults/third-party';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import BASEURLS from 'bsrs-ember/utilities/urls';
import generalPage from 'bsrs-ember/tests/pages/general';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/third-party';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_third_parties_url;
const THIRD_PARTY_URL = BASE_URL + '/index';
const THIRD_PARTY_NEW_URL = BASE_URL + '/new/1';
const DJANGO_THIRD_PARTY_URL = PREFIX + '/admin/third-parties/';
const DETAIL_URL = BASE_URL + '/' + TPD.idOne;
const DJANGO_DETAIL_URL = PREFIX + DJANGO_THIRD_PARTY_URL + TPD.idOne + '/';

let store, payload, list_xhr;

moduleForAcceptance('Acceptance | third-party new test', {
  beforeEach() {

    store = this.application.__container__.lookup('service:simpleStore');
    list_xhr = xhr(`${DJANGO_THIRD_PARTY_URL}?page=1`, "GET", null, {}, 200, TPF.empty());
    payload = {
      id: UUID.value,
      name: TPD.nameOne,
      number: TPD.numberOne,
      status: TPD.statusActive
    };
    random.uuid = function() { return UUID.value; };
  },
  afterEach() {
    payload = null;
  }
});

test('visit /third-parties/new and do a create', (assert) => {
  let response = Ember.$.extend(true, {}, payload);
  xhr(DJANGO_THIRD_PARTY_URL, 'POST', JSON.stringify(payload), {}, 201, response);
  visit(THIRD_PARTY_URL);
  click('.t-add-new');
  andThen(() => {
    assert.equal(currentURL(), THIRD_PARTY_NEW_URL);
    assert.equal(store.find('third-party').get('length'), 1);
  });
  fillIn('.t-third-party-name', TPD.nameOne);
  fillIn('.t-third-party-number', TPD.numberOne);
  page.statusClickDropdown();
  page.statusClickOptionOne();
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), THIRD_PARTY_URL);
    assert.equal(store.find('third-party').get('length'), 1);
    let third_party = store.find('third-party', UUID.value);
    assert.equal(third_party.get('id'), UUID.value);
    assert.equal(third_party.get('name'), TPD.nameOne);
    assert.equal(third_party.get('number'), TPD.numberOne);
    assert.ok(third_party.get('isNotDirty'));
  });
});

test('validation works and when hit save, we do same post', (assert) => {
  let response = Ember.$.extend(true, {}, payload);
  xhr(DJANGO_THIRD_PARTY_URL, 'POST', JSON.stringify(payload), {}, 201, response);
  visit(THIRD_PARTY_URL);
  click('.t-add-new');
  andThen(() => {
    assert.ok(find('.t-name-validation-error').is(':hidden'));
    assert.ok(find('.t-number-validation-error').is(':hidden'));
    assert.ok(find('.t-status-validation-error').is(':hidden'));
  });
  generalPage.save();
  andThen(() => {
    assert.ok(find('.t-name-validation-error').is(':visible'));
    assert.ok(find('.t-number-validation-error').is(':visible'));
    assert.ok(find('.t-status-validation-error').is(':visible'));
  });
  fillIn('.t-third-party-name', TPD.nameOne);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), THIRD_PARTY_NEW_URL);
    assert.ok(find('.t-number-validation-error').is(':visible'));
    assert.ok(find('.t-status-validation-error').is(':visible'));
  });
  fillIn('.t-third-party-name', TPD.nameOne);
  fillIn('.t-third-party-number', TPD.numberOne);
  page.statusClickDropdown();
  page.statusClickOptionOne();
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), THIRD_PARTY_URL);
  });
});

test('when user clicks cancel we prompt them with a modal and they cancel', (assert) => {
  clearxhr(list_xhr);
  visit(THIRD_PARTY_NEW_URL);
  fillIn('.t-third-party-name', TPD.nameOne);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), THIRD_PARTY_NEW_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
    });
  });
  click('.t-modal-footer .t-modal-cancel-btn');
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), THIRD_PARTY_NEW_URL);
      assert.equal(find('.t-third-party-name').val(), TPD.nameOne);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back model to remove from store', (assert) => {
  visit(THIRD_PARTY_NEW_URL);
  fillIn('.t-third-party-name', TPD.storeName);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), THIRD_PARTY_NEW_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
      let third_party = store.find('third-party', {id: UUID.value});
      assert.equal(third_party.get('length'), 1);
    });
  });
  click('.t-modal-footer .t-modal-rollback-btn');
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), THIRD_PARTY_URL);
      let third_party = store.find('third-party', {id: UUID.value});
      assert.equal(third_party.get('length'), 0);
      assert.equal(find('tr.t-grid-data').length, 0);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('when user enters new form and doesnt enter data, the record is correctly removed from the store', (assert) => {
  visit(THIRD_PARTY_NEW_URL);
  generalPage.cancel();
  andThen(() => {
    assert.equal(store.find('third-party').get('length'), 0);
  });
});

test('adding a new third-party should allow for another new third-party to be created after the first is persisted', (assert) => {
  uuidReset();
  payload.id = 'abc123';
  patchRandomAsync(0);
  visit(THIRD_PARTY_URL);
  click('.t-add-new');
  fillIn('.t-third-party-name', TPD.nameOne);
  fillIn('.t-third-party-name', TPD.nameOne);
  fillIn('.t-third-party-number', TPD.numberOne);
  page.statusClickDropdown();
  page.statusClickOptionOne();
  ajax(DJANGO_THIRD_PARTY_URL, 'POST', JSON.stringify(payload), {}, 201, Ember.$.extend(true, {}, payload));
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), THIRD_PARTY_URL);
    assert.equal(store.find('third-party').get('length'), 1);
  });
  click('.t-add-new');
  andThen(() => {
    assert.equal(currentURL(), THIRD_PARTY_NEW_URL);
    assert.equal(store.find('third-party').get('length'), 2);
    assert.equal(find('.t-third-party-name').val(), '');
  });
});
