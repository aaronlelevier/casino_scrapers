import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import config from 'bsrs-ember/config/environment';
import random from 'bsrs-ember/models/random';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import PD from 'bsrs-ember/vendor/defaults/profile';
import PF from 'bsrs-ember/vendor/profile_fixtures';
import PersonF from 'bsrs-ember/vendor/people_fixtures';
import page from 'bsrs-ember/tests/pages/profile';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS from 'bsrs-ember/utilities/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_profile_url;
const newId = 1;
const NEW_URL = `${BASE_URL}/new/${newId}`;
const LIST_URL = `${BASE_URL}/index`;
const API_LIST_URL = `${PREFIX}${BASE_URL}/?page=1`;
const API_CREATE_URL = `${PREFIX}${BASE_URL}/`;
const API_LIST_URL_PERSON = `${PREFIX}/admin/people/`;

const SEARCH = '.ember-power-select-search input';

var application, store, listData, listXhr, run = Ember.run;

moduleForAcceptance('Acceptance | profile new test', {
  beforeEach() {

    store = this.application.__container__.lookup('service:simpleStore');
    listData = PF.list();
    listXhr = xhr(API_LIST_URL, 'GET', null, {}, 200, listData);
    random.uuid = function() { return UUID.value; };
  },
  afterEach() {
  }
});

test('visit new URL and create a new record', assert => {
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
  });
  // description
  page.descFill(PD.descOne);
  andThen(() => {
    assert.equal(page.descValue, PD.descOne);
  });
  // assignee
  let keyword = 'boy1';
  xhr(`${API_LIST_URL_PERSON}person__icontains=${keyword}/`, 'GET', null, {}, 200, PersonF.search_power_select());
  selectSearch('.t-profile-assignee-select', keyword);
  selectChoose('.t-profile-assignee-select', keyword);
  let payload = {
    id: UUID.value,
    description: PD.descOne,
    assignee: '249543cf-8fea-426a-8bc3-09778cd78001',
    filters: []
  };
  xhr(API_CREATE_URL, 'POST', payload, {}, 200, {});
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
  });
});

// cancel modal tests

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
  clearxhr(listXhr);
  visit(NEW_URL);
  page.descFill(PD.descTwo);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), NEW_URL);
      assert.ok(generalPage.modalIsVisible);
      assert.equal(find('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
    });
  });
  generalPage.clickModalCancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), NEW_URL);
      assert.equal(page.descValue, PD.descTwo);
      assert.ok(generalPage.modalIsHidden);
    });
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
  visit(NEW_URL);
  page.descFill(PD.descTwo);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), NEW_URL);
      assert.ok(generalPage.modalIsVisible);
    });
  });
  generalPage.clickModalRollback();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), LIST_URL);
    });
  });
});

test('clicking cancel button with no edits will take from detail view to list view', (assert) => {
  visit(NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), NEW_URL);
  });
  generalPage.cancel();
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
  });
});
