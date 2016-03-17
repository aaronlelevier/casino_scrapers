import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import DTDF from 'bsrs-ember/vendor/dtd_fixtures';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import generalPage from 'bsrs-ember/tests/pages/general';
import page from 'bsrs-ember/tests/pages/dtd';
import random from 'bsrs-ember/models/random';
import { dtd_new_payload } from 'bsrs-ember/tests/helpers/payloads/dtd';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_dtd_url;
const DTD_URL = `${BASE_URL}`;
const DTD_NEW_URL = `${BASE_URL}/new/1`;
const DTD_NEW_URL_2 = `${BASE_URL}/new/2`;
const DJANGO_DTD_URL = `${PREFIX}/dtds/`;
const DETAIL_URL = `${BASE_URL}/${UUID.value}`;
const DJANGO_DTD_NEW_URL = `${DJANGO_DTD_URL}${UUID.value}/`;

let application, store, payload, list_xhr, original_uuid, detail_xhr;

module('Acceptance | dtd-new', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('store:main');
    list_xhr = xhr(`${DJANGO_DTD_URL}?page=1`, 'GET', null, {}, 201, DTDF.empty());
    original_uuid = random.uuid;
    random.uuid = function() { return UUID.value; };
    detail_xhr = xhr(DJANGO_DTD_NEW_URL, 'GET', null, {}, 200, dtd_new_payload);
  },
  afterEach() {
    payload = null;
    random.uuid = original_uuid;
    Ember.run(application, 'destroy');
  }
});

test('visiting /dtd/new', (assert) => {
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), DTD_URL);
  });
  click('.t-add-new');
  andThen(() => {
    assert.equal(currentURL(), DTD_NEW_URL);
    assert.equal(store.find('dtd').get('length'), 1);
    const dtd = store.find('dtd', UUID.value);
    assert.ok(dtd.get('new'));
    assert.notOk(dtd.get('key'));
    assert.notOk(dtd.get('description'));
  });
  page.keyFillIn(DTD.keyOne);
  page.descriptionFillIn(DTD.descriptionOne);
  const response = Ember.$.extend(true, {}, payload);
  xhr(DJANGO_DTD_URL, 'POST', JSON.stringify(dtd_new_payload), {}, 201, response);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let dtd = store.find('dtd', UUID.value);
    assert.equal(dtd.get('key'), DTD.keyOne);
    assert.equal(dtd.get('description'), DTD.descriptionOne);
    assert.ok(dtd.get('isNotDirty'));
  });
});

test('when user clicks cancel we prompt them with a modal and they cancel to keep model data', (assert) => {
  clearxhr(detail_xhr);
  page.visitNew();
  page.keyFillIn(DTD.keyOne);
  generalPage.cancel();
  andThen(() => {
    waitFor(() => {
      assert.equal(currentURL(), DTD_NEW_URL);
      assert.equal(find('.t-modal').is(':visible'), true);
      assert.equal(find('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
    });
  });
  click('.t-modal-footer .t-modal-cancel-btn');
  andThen(() => {
    waitFor(() => {
      assert.equal(currentURL(), DTD_NEW_URL);
      assert.equal(page.key, DTD.keyOne);
      assert.equal(find('.t-modal').is(':hidden'), true);
    });
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back model to remove from store', (assert) => {
  clearxhr(detail_xhr);
  page.visitNew();
  page.keyFillIn(DTD.keyOne);
  generalPage.cancel();
  andThen(() => {
    waitFor(() => {
      assert.equal(currentURL(), DTD_NEW_URL);
      assert.equal(find('.t-modal').is(':visible'), true);
      let dtds = store.find('dtd');
      assert.equal(dtds.get('length'), 1);
    });
  });
  click('.t-modal-footer .t-modal-rollback-btn');
  andThen(() => {
    waitFor(() => {
      assert.equal(currentURL(), DTD_URL);
      let dtds = store.find('dtd');
      assert.equal(dtds.get('length'), 0);
      assert.equal(find('tr.t-grid-data').length, 0);
    });
  });
});

test('when user enters new form and doesnt enter data, the record is correctly removed from the store', (assert) => {
  clearxhr(detail_xhr);
  page.visitNew();
  generalPage.cancel();
  andThen(() => {
    assert.equal(store.find('dtd').get('length'), 0);
  });
});

//TODO: button stays selected after first select
// test('scott adding a new dtd should allow for another new dtd to be created after the first is persisted', (assert) => {
//     let dtd_count;
//     random.uuid = original_uuid;
//     dtd_new_payload.id = 'abc123';
//     patchRandomAsync(0);
//     visit(DTD_URL);
//     click('.t-add-new');
//     page.keyFillIn(DTD.keyOne);
//     page.descriptionFillIn(DTD.descriptionOne);
//     xhr(DJANGO_DTD_URL, 'POST', JSON.stringify(dtd_new_payload), {}, 201, Ember.$.extend(true, {}, payload));
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), DTD_URL);
//         dtd_count = store.find('dtd').get('length');
//     });
//     click('.t-add-new');
//     andThen(() => {
//         assert.equal(currentURL(), DTD_NEW_URL_2);
//         assert.equal(store.find('dtd').get('length'), dtd_count + 1);
//         assert.equal(find('.t-dtd-key').val(), '');
//     });
// });
